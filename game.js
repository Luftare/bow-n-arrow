const WAVE_GAP_TICKS = 100;

const ENEMY_SPAWN_MIN_DISTANCE = 550;
const ENEMY_SPACE = 50;
const ENEMY_VELOCITY = -1;
const ARROW_VELOCITY = 6;
const PLAYER_X = 80;
const PLAYER_HEIGHT = 64;
const PLAYER_WIDTH = 32;
const STRUCTURE_GAP = 20;
let FLOOR_Y = DOM.game.clientHeight * 0.78;

const game = {
  state: null,
  preferences: {
    timeSpeed: 1,
  },
};

const indexToStructureCost = (index) => Math.floor(2 ** (index + 8));
const waveToWaveGapTicks = (wave) => 100 - wave * 5;
const waveToEnemyCount = (wave) => Math.floor(1 + wave * 0.1);
const waveToIsBoss = (wave) => wave % 4 === 0;
const waveToEnemyHp = (wave) => 5 + wave * 0.5;
const waveToBossHp = (wave) => 20 + wave ** 1.5;
const waveToTickCount = (wave) => {
  const isBoss = waveToIsBoss(wave);
  const enemyCount = isBoss ? 1 : waveToEnemyCount(wave);
  const lastEnemyX = ENEMY_SPAWN_MIN_DISTANCE + ENEMY_SPACE * (enemyCount - 1);
  const lastEnemyDistanceToPlayer = lastEnemyX - PLAYER_X;
  return lastEnemyDistanceToPlayer / Math.abs(ENEMY_VELOCITY);
};

const isAlive = ({ hp }) => hp > 0;

const render = (canvas, state) => {
  FLOOR_Y = DOM.game.clientHeight * 0.78;
  renderGame(canvas, state);
};

const updatePlayer = (state) => {
  state.player.loadCounter -= game.preferences.timeSpeed;
  const overload = Math.max(
    0,
    game.preferences.timeSpeed - state.player.loadCounter
  );
  state.player.loadCounter = Math.max(0, state.player.loadCounter);

  const range = get('range');
  const enemyInRange = state.enemies.some(
    ({ x }) => Math.abs(x - PLAYER_X) <= range
  );
  const isLoaded = state.player.loadCounter <= 0;
  if (isLoaded && enemyInRange) {
    state.player.loadCounter = get('loadTicks') - overload;
    shoot(state);
  }
};

const handleEnemyKill = (state, enemy) => {
  const bossMultiplier = enemy.isBoss ? 4 : 1;
  const isTripled = Math.random() < get('tripleLootChance');
  const tripler = isTripled ? 3 : 1;
  const coins = Math.floor(get('lootBonus') * bossMultiplier * tripler);
  state.player.coins += coins;

  DOM.displayMessage(
    PLAYER_X - 42 + randomDev(20),
    FLOOR_Y - 100 + randomDev(16),
    `+${toPostfix(coins)}`,
    'orange',
    isTripled ? 24 : 16
  );
};

const updateArrow = (state) => (arrow) => {
  const nextX = arrow.x + ARROW_VELOCITY * game.preferences.timeSpeed;
  const enemyMovement = ENEMY_VELOCITY * game.preferences.timeSpeed;
  const arrowStartX = arrow.x + enemyMovement;

  const enemy = state.enemies
    .filter((e) => e.hp > 0)
    .find((e) => e.x >= arrowStartX && e.x < nextX);

  if (enemy) {
    const cloverBonus = getCloverBonus();
    const isFrozen = enemy.freeze > 0;
    const frozenBonus = isFrozen ? 2 : 1;
    const isCrit =
      Math.random() < get('critChance') * frozenBonus + cloverBonus;

    const critMultiplier = isCrit ? get('critMultiplier') : 1;
    const damage = Math.floor(arrow.damage * critMultiplier);

    enemy.hp -= damage;
    DOM.displayMessage(
      enemy.x + randomDev(10),
      FLOOR_Y - 64 * (enemy.isBoss ? 2 : 1) + randomDev(10),
      toPostfix(damage),
      'black',
      isCrit ? 24 : 16
    );

    if (enemy.hp <= 0) {
      handleEnemyKill(state, enemy);
    } else if (!isFrozen) {
      const willFreeze =
        Math.random() <
        upgradeValues.freezeChance(state.upgrades.freezeChance) + cloverBonus;
      if (willFreeze) {
        enemy.freeze = get('freezeDuration');
      }
    }

    const willPierce =
      !isFrozen && Math.random() < get('pierceChance') + cloverBonus;

    if (willPierce) {
      arrow.x = enemy.x + 0.0001;
    } else {
      arrow.hp--;
    }
  }

  arrow.x = nextX;
};

const updateEnemy = (state) => (enemy) => {
  enemy.freeze = Math.max(0, enemy.freeze - game.preferences.timeSpeed);
  if (enemy.freeze > 0) {
    enemy.hp -= get('freezeDamage') * game.preferences.timeSpeed;

    return;
  }
  enemy.x += ENEMY_VELOCITY * game.preferences.timeSpeed;

  state.structures = state.structures.filter(({ x }) => {
    const willDie = x > enemy.x;
    return !willDie;
  });
};

const shoot = (overrides = {}) => {
  game.state.arrows.push({
    x: PLAYER_X,
    hp: 1,
    damage: get('damage'),
    ...overrides,
  });
};

const updateWave = () => {
  game.state.waveCounter -= game.preferences.timeSpeed;

  if (game.state.waveCounter <= 0) {
    game.state.wave++;
    spawnWave(game.state.wave);
    game.state.waveCounter =
      waveToTickCount(game.state.wave) + waveToWaveGapTicks(game.state.wave);
  }
};

const isGameWon = () => game.state.wave >= 200;

const updateGameOver = () => {
  game.state.isGameOver =
    isGameWon() || game.state.enemies.some(({ x }) => x <= PLAYER_X);
};

const tickSimulation = () => {
  updateWave();
  updatePlayer(game.state);
  game.state.arrows.forEach(updateArrow(game.state));
  game.state.enemies.forEach(updateEnemy(game.state));

  game.state.enemies = game.state.enemies.filter(isAlive);
  game.state.arrows = game.state.arrows
    .filter(isAlive)
    .filter(({ x }) => x < 10000);

  updateActions(game.state);
  updateGameOver();
};

const tick = () => {
  const isInterrupted = game.state.isGameOver || game.state.isPaused;

  if (!isInterrupted) {
    tickSimulation();
  }

  render(DOM.game, game.state);
  renderStats(game.state);
  updateButtons(game.state);
};

const enemyFactory = (state, index) => ({
  x: ENEMY_SPAWN_MIN_DISTANCE + ENEMY_SPACE * index,
  hp: waveToEnemyHp(state.wave),
  maxHp: waveToEnemyHp(state.wave),
  freeze: 0,
  isBoss: false,
  animationOffset: Math.random() * 10000,
});

const bossFactory = (state) => ({
  x: ENEMY_SPAWN_MIN_DISTANCE,
  hp: waveToBossHp(state.wave),
  maxHp: waveToBossHp(state.wave),
  freeze: 0,
  isBoss: true,
  animationOffset: Math.random() * 10000,
});

const spawnWave = (wave) => {
  const isBoss = waveToIsBoss(wave);

  const newEnemies = isBoss
    ? [bossFactory(game.state)]
    : [...Array(waveToEnemyCount(game.state.wave))].map((_, index) =>
        enemyFactory(game.state, index)
      );

  game.state.enemies = [...game.state.enemies, ...newEnemies];

  handleCoinFlowers();
};

const spawnStructure = (key) => {
  game.state.player.coins -= indexToStructureCost(game.state.structureIndex);
  game.state.structureIndex++;
  const indexX = game.state.structures.length;
  game.state.structures.push({
    x: PLAYER_X + STRUCTURE_GAP * indexX + 5,
    type: key,
  });
};

const loop = () => {
  tick(game.state);
  requestAnimationFrame(loop);
};

const boot = () => {
  game.state = createState();
  renderUpgrades(game.state);
  renderActions(game.state);
  renderStructureOptions();
  renderPreferences();
  loop();
  document.querySelector('main').style.display = 'block';
};

const startNewGame = () => {
  game.state = createState();
  renderUpgrades(game.state);
  renderStructureOptions();
  renderActions(game.state);
};
