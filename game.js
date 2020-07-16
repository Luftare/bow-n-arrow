const WAVE_GAP_TICKS = 200;

const ENEMY_SPAWN_MIN_DISTANCE = 300;
const ENEMY_SPACE = 30;
const ENEMY_VELOCITY = -0.3;
const ARROW_VELOCITY = 3;
const PLAYER_X = 40;
const PLAYER_HEIGHT = 30;
const FLOOR_Y = 100;

let preferences = {
  timeSpeed: 1,
};

let state;

const waveToEnemyCount = (wave) => 5;
const waveToEnemyHp = (wave) => 20 + wave;
const enemyCoinReward = (upgrades) => 1 + upgrades.lootBonus;
const loadTicks = (level) => 80 - level * 2;
const lootBonus = (level) => level;
const critChance = (level) => 0 + level * 0.1;
const waveToTickCount = (wave) => {
  const enemyCount = waveToEnemyCount(wave);
  const lastEnemyX = ENEMY_SPAWN_MIN_DISTANCE + ENEMY_SPACE * (enemyCount - 1);
  const lastEnemyDistanceToPlayer = lastEnemyX - PLAYER_X;
  return lastEnemyDistanceToPlayer / Math.abs(ENEMY_VELOCITY);
};
const upgradeCost = (currentLevel) => 2 ** currentLevel;

const isAlive = ({ hp }) => hp > 0;

const renderGame = (canvas, state) => {
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'green';
  ctx.fillRect(0, FLOOR_Y, DOM.game.width, DOM.game.height - FLOOR_Y);
  ctx.fillStyle = 'red';
  ctx.fillRect(
    PLAYER_X + state.player.range,
    FLOOR_Y,
    -2,
    DOM.game.height - FLOOR_Y
  );

  ctx.fillStyle = 'black';
  ctx.fillRect(PLAYER_X, FLOOR_Y, -15, -PLAYER_HEIGHT);

  state.enemies.forEach(({ x }) =>
    ctx.fillRect(x, FLOOR_Y, 15, -PLAYER_HEIGHT)
  );
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
  state.player.loadCounter -= preferences.timeSpeed;
  const enemyInRange = state.enemies.some(
    ({ x }) => Math.abs(x - PLAYER_X) <= state.player.range
  );
  const isLoaded = state.player.loadCounter <= 0;
  if (isLoaded && enemyInRange) {
    state.player.loadCounter = loadTicks(state.upgrades.loadTime);
    shoot(state);
  }
};

const handleEnemyKill = (state, enemy) => {
  state.player.coins += enemyCoinReward(state.upgrades);
};

const updateArrow = (state) => (arrow) => {
  const nextX = arrow.x + ARROW_VELOCITY * preferences.timeSpeed;
  const enemyMovement = ENEMY_VELOCITY * preferences.timeSpeed;
  const arrowStartX = arrow.x + enemyMovement;

  const enemy = state.enemies.find((e) => e.x >= arrowStartX && e.x < nextX);

  if (enemy) {
    const isCrit = Math.random() < critChance(state.upgrades.critChance);
    const critMultiplier = isCrit ? 2 : 1;
    enemy.hp -= arrow.damage * critMultiplier;
    arrow.hp--;

    if (enemy.hp <= 0) {
      handleEnemyKill(state, enemy);
    }
  }

  arrow.x = nextX;
};

const updateEnemy = (state) => (enemy) => {
  enemy.x += ENEMY_VELOCITY * preferences.timeSpeed;
};

const shoot = (state) => {
  state.arrows.push({ x: PLAYER_X, hp: 1, damage: 15 });
};

const updateWave = () => {
  state.waveCounter -= preferences.timeSpeed;

  if (state.waveCounter <= 0) {
    state.wave++;
    spawnWave(state.wave);
    state.waveCounter = waveToTickCount(state.wave) + WAVE_GAP_TICKS;
  }
};

const updateGameOver = () => {
  state.isGameOver = state.enemies.some(({ x }) => x <= PLAYER_X);
};

const tick = () => {
  if (state.isGameOver) return;

  updateWave();

  updatePlayer(state);

  state.arrows.forEach(updateArrow(state));
  state.enemies.forEach(updateEnemy(state));

  state.enemies = state.enemies.filter(isAlive);
  state.arrows = state.arrows.filter(isAlive);

  updateGameOver();

  render(DOM.game, state);
};

const enemyFactory = (state, index) => ({
  x: ENEMY_SPAWN_MIN_DISTANCE + ENEMY_SPACE * index,
  hp: waveToEnemyHp(state.wave),
});

const spawnWave = (wave) => {
  const newEnemies = [...Array(waveToEnemyCount(state.wave))].map((_, index) =>
    enemyFactory(state, index)
  );
  state.enemies = [...state.enemies, ...newEnemies];
};

const loop = () => {
  requestAnimationFrame(loop);
  tick(state);
};

const initGame = () => {
  state = {
    isGameOver: false,
    waveCounter: 0,
    wave: 0,
    enemies: [],
    arrows: [],
    upgrades: {
      loadTime: 0,
      lootBonus: 0,
      critChance: 0,
      critMultiplier: 2,
    },
    player: {
      coins: 0,
      range: 200,
      loadCounter: 0,
    },
  };
};

const boot = () => {
  initGame();
  renderUpgrades();
  loop();
};
