const WAVE_GAP_TICKS = 100;

const ENEMY_SPAWN_MIN_DISTANCE = 550;
const ENEMY_SPACE = 50;
const ENEMY_VELOCITY = -1;
const ARROW_VELOCITY = 6;
const PLAYER_X = 80;
const PLAYER_HEIGHT = 64;
const PLAYER_WIDTH = 32;
let FLOOR_Y = DOM.game.height * 0.78;

const game = {
  state: null,
  preferences: {
    timeSpeed: 1,
  },
};

const randomDev = (max) => (Math.random() - 0.5) * 2 * max;

const booleanOsc = (frq, offset = 0) =>
  Math.cos(Date.now() * frq * game.preferences.timeSpeed + offset) > 0;

const get = (key, levelAdjust = 0) =>
  upgradeValues[key](game.state.upgrades[key] + levelAdjust);

const upgradeValues = {
  lootBonus: (level) => 1 + Math.floor(level ** 2.1),
  tripleLootChance: (level) => 0 + level * 0.03,
  damage: (level) => Math.floor(10 + level ** 1.5),
  loadTicks: (level) => 100 - level * 4,
  range: (level) => 250 + level * 4,
  critChance: (level) => 0.04 + level * 0.02,
  critMultiplier: (level) => 1.5 + level * 0.15,
  freezeChance: (level) => 0 + level * 0.02,
  freezeDuration: (level) => 20 + level * 10,
  pierceChance: (level) => 0.0 + level * 0.02,
};

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
const upgradeCost = (currentLevel) => Math.floor(2 ** currentLevel);

const isAlive = ({ hp }) => hp > 0;

const render = (canvas, state) => {
  renderGame(canvas, state);
  renderStats(state);
  updateUpgradeAvailability(state);
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
    PLAYER_X - 42 + randomDev(10),
    FLOOR_Y - 90 + randomDev(10),
    `+${coins}`,
    'orange',
    isTripled ? 24 : 16
  );
};

const updateArrow = (state) => (arrow) => {
  const nextX = arrow.x + ARROW_VELOCITY * game.preferences.timeSpeed;
  const enemyMovement = ENEMY_VELOCITY * game.preferences.timeSpeed;
  const arrowStartX = arrow.x + enemyMovement;

  const enemy = state.enemies.find((e) => e.x >= arrowStartX && e.x < nextX);

  if (enemy) {
    const isFrozen = enemy.freeze > 0;
    const frozenBonus = isFrozen ? 2 : 1;
    const isCrit = Math.random() < get('critChance') * frozenBonus;

    const critMultiplier = isCrit ? get('critMultiplier') : 1;
    const damage = Math.floor(arrow.damage * critMultiplier);
    enemy.hp -= damage;
    DOM.displayMessage(
      enemy.x + randomDev(10),
      FLOOR_Y - 64 * (enemy.isBoss ? 2 : 1) + randomDev(10),
      damage,
      'black',
      isCrit ? 24 : 16
    );
    const willPierce = !isFrozen && Math.random() < get('pierceChance');

    if (willPierce) {
      arrow.x = enemy.x + 0.0001;
    } else {
      arrow.hp--;
    }

    if (enemy.hp <= 0) {
      handleEnemyKill(state, enemy);
    } else if (!isFrozen) {
      const willFreeze =
        Math.random() < upgradeValues.freezeChance(state.upgrades.freezeChance);
      if (willFreeze) {
        enemy.freeze = get('freezeDuration');
      }
    }
  }

  arrow.x = nextX;
};

const updateEnemy = (state) => (enemy) => {
  enemy.freeze = Math.max(0, enemy.freeze - game.preferences.timeSpeed);
  if (enemy.freeze > 0) return;
  enemy.x += ENEMY_VELOCITY * game.preferences.timeSpeed;
};

const shoot = () => {
  game.state.arrows.push({
    x: PLAYER_X,
    hp: 1,
    damage: get('damage'),
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

const updateGameOver = () => {
  game.state.isGameOver = game.state.enemies.some(({ x }) => x <= PLAYER_X);
};

const tick = () => {
  if (game.state.isGameOver) return;

  updateWave();

  updatePlayer(game.state);

  game.state.arrows.forEach(updateArrow(game.state));
  game.state.enemies.forEach(updateEnemy(game.state));

  game.state.enemies = game.state.enemies.filter(isAlive);
  game.state.arrows = game.state.arrows
    .filter(isAlive)
    .filter(({ x }) => x < 10000);

  updateGameOver();

  render(DOM.game, game.state);
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
};

const loop = () => {
  requestAnimationFrame(loop);
  tick(game.state);
};

const createState = () => ({
  isGameOver: false,
  waveCounter: 0,
  wave: 0,
  enemies: [],
  arrows: [],
  upgrades: {
    lootBonus: 0,
    tripleLootChance: 0,
    damage: 0,
    loadTicks: 0,
    range: 0,
    critChance: 0,
    critMultiplier: 0,
    pierceChance: 0,
    freezeChance: 0,
    freezeDuration: 0,
  },
  player: {
    coins: 0,
    range: 200,
    loadCounter: 0,
  },
});

const boot = () => {
  game.state = createState();
  renderUpgrades(game.state);
  loop();
};

const startNewGame = () => {
  game.state = createState();
  renderUpgrades(game.state);
};
