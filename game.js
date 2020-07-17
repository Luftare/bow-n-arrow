const WAVE_GAP_TICKS = 100;

const ENEMY_SPAWN_MIN_DISTANCE = 300;
const ENEMY_SPACE = 30;
const ENEMY_VELOCITY = -0.3;
const ARROW_VELOCITY = 3;
const PLAYER_X = 40;
const PLAYER_HEIGHT = 30;
const PLAYER_WIDTH = 15;
let FLOOR_Y = DOM.game.height * 0.76;

const game = {
  state: null,
  preferences: {
    timeSpeed: 1,
  },
};

const booleanOsc = (frq) =>
  Math.cos(Date.now() * frq * game.preferences.timeSpeed) > 0;

const get = (key, levelAdjust = 0) =>
  upgradeValues[key](game.state.upgrades[key] + levelAdjust);

const upgradeValues = {
  lootBonus: (level) => 1 + Math.floor(level ** 2.1),
  tripleLootChance: (level) => 0.04 + level * 0.02,
  damage: (level) => Math.floor(10 + level ** 1.5),
  loadTicks: (level) => 100 - level * 2,
  range: (level) => 150 + level * 2,
  critChance: (level) => 0.04 + level * 0.02,
  critMultiplier: (level) => 1.5 + level * 0.15,
  freezeChance: (level) => 0 + level * 0.02,
  freezeDuration: (level) => 100 + level * 50,
  pierceChance: (level) => 0.0 + level * 0.02,
};

const waveToWaveGapTicks = (wave) => 100 - wave * 5;
const waveToEnemyCount = (wave) => Math.floor(1 + wave * 0.1);
const waveToIsBoss = (wave) => wave % 4 === 0;
const waveToEnemyHp = (wave) => 15 + wave * 0.5;
const waveToBossHp = (wave) => 50 + wave ** 1.5;
const waveToTickCount = (wave) => {
  const isBoss = waveToIsBoss(wave);
  const enemyCount = isBoss ? 1 : waveToEnemyCount(wave);
  const lastEnemyX = ENEMY_SPAWN_MIN_DISTANCE + ENEMY_SPACE * (enemyCount - 1);
  const lastEnemyDistanceToPlayer = lastEnemyX - PLAYER_X;
  return lastEnemyDistanceToPlayer / Math.abs(ENEMY_VELOCITY);
};
const upgradeCost = (currentLevel) => Math.floor(2 ** currentLevel);

const isAlive = ({ hp }) => hp > 0;

const renderGame = (canvas, state) => {
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'lightgray';
  ctx.fillRect(PLAYER_X + get('range'), FLOOR_Y, -2, DOM.game.height - FLOOR_Y);

  state.enemies.forEach(({ x, hp, maxHp, freeze, isBoss }) => {
    const sizeMultiplier = isBoss ? 2 : 1;
    ctx.fillStyle = freeze > 0 ? 'blue' : 'darkgreen';
    // ctx.fillRect(
    //   x,
    //   FLOOR_Y,
    //   PLAYER_WIDTH * sizeMultiplier,
    //   -PLAYER_HEIGHT * sizeMultiplier
    // );

    ctx.drawImage(
      DOM.images.orcs[booleanOsc(0.015) || freeze > 0 ? 0 : 1],
      Math.round(x - 10 * sizeMultiplier),
      Math.round(FLOOR_Y - 32 * sizeMultiplier),
      32 * sizeMultiplier,
      32 * sizeMultiplier
    );

    ctx.fillStyle = 'lightgreen';
    const hpWidth = (PLAYER_WIDTH * sizeMultiplier * hp) / maxHp;
    ctx.fillRect(x, FLOOR_Y - PLAYER_HEIGHT * sizeMultiplier - 3, hpWidth, -4);
  });

  ctx.fillStyle = 'black';
  ctx.fillRect(PLAYER_X, FLOOR_Y, -PLAYER_WIDTH, -PLAYER_HEIGHT);

  const maxLoadTicks = get('loadTicks');
  const isAiming = maxLoadTicks - state.player.loadCounter > 15;
  if (isAiming) {
    ctx.fillRect(PLAYER_X, FLOOR_Y - 10, -PLAYER_WIDTH - 4, -6);
  }

  ctx.fillStyle = 'black';
  state.arrows.forEach(({ x }) =>
    ctx.fillRect(x, FLOOR_Y - PLAYER_HEIGHT * 0.5, -10, -2)
  );
};

const render = (canvas, state) => {
  renderGame(canvas, state);
  renderStats(state);
  updateUpgradeAvailability(state);
};

const updatePlayer = (state) => {
  state.player.loadCounter -= game.preferences.timeSpeed;
  const range = get('range');
  const enemyInRange = state.enemies.some(
    ({ x }) => Math.abs(x - PLAYER_X) <= range
  );
  const isLoaded = state.player.loadCounter <= 0;
  if (isLoaded && enemyInRange) {
    state.player.loadCounter = get('loadTicks');
    shoot(state);
  }
};

const handleEnemyKill = (state, enemy) => {
  const bossMultiplier = enemy.isBoss ? 4 : 1;
  const isTripled = Math.random() < get('tripleLootChance');
  const tripler = isTripled ? 3 : 1;
  state.player.coins += Math.floor(get('lootBonus') * bossMultiplier * tripler);

  if (isTripled) {
    DOM.displayMessage(
      PLAYER_X - 24,
      FLOOR_Y - PLAYER_HEIGHT,
      'Triple!',
      'black',
      14
    );
  }
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
      enemy.x,
      FLOOR_Y - PLAYER_HEIGHT,
      damage,
      isCrit ? 'black' : 'black',
      isCrit ? 18 : 12
    );
    const willPierce = !isCrit && Math.random() < get('pierceChance');
    if (willPierce) {
      DOM.displayMessage(enemy.x, FLOOR_Y - PLAYER_HEIGHT, 'Pierce!', 'orange');
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
        DOM.displayMessage(
          enemy.x,
          FLOOR_Y - PLAYER_HEIGHT,
          'Frozen!',
          'darkblue'
        );
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
});

const bossFactory = (state) => ({
  x: ENEMY_SPAWN_MIN_DISTANCE,
  hp: waveToBossHp(state.wave),
  maxHp: waveToBossHp(state.wave),
  freeze: 0,
  isBoss: true,
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
    freezeChance: 0,
    freezeDuration: 0,
    pierceChance: 0,
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
