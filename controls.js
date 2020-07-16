const renderStats = (state) => {
  DOM.stats.innerHTML = `
    <span>${state.player.coins}</span>
  `;
};

const renderPreferences = () => {
  const NEW_GAME = 'new-game';
  const timeSpeeds = [1, 2, 8, 16];
  const timeSpeedId = (num) => `time-speed-${num}`;

  DOM.preferences.innerHTML = `
    <button id="${NEW_GAME}">New Game</button>

    ${timeSpeeds
      .map(
        (value, index) =>
          `<label><input type="radio" name="time-speed" id="${timeSpeedId(
            value
          )}" ${index === 0 ? 'checked' : ''} /> x${value}</label>`
      )
      .join('')}
    
  `;

  document.getElementById(NEW_GAME).addEventListener('click', initGame);
  timeSpeeds.forEach((value) => {
    document
      .getElementById(timeSpeedId(value))
      .addEventListener('change', () => (preferences.timeSpeed = value));
  });
};

const renderUpgrades = () => {
  const LOAD_TIME = 'load-time';
  const LOOT_BONUS = 'loot-bonus';
  const CRIT_CHANCE = 'crit-chance';

  DOM.upgrades.container.innerHTML = `
  <button id="${LOAD_TIME}">Load Time ${loadTicks(
    state.upgrades.loadTime + 1
  )} ${upgradeCost(state.upgrades.loadTime)}</button>

  <button id="${LOOT_BONUS}">Loot Bonus ${lootBonus(
    state.upgrades.lootBonus + 1
  )} ${upgradeCost(state.upgrades.lootBonus)}</button>

  <button id="${CRIT_CHANCE}">Crit Chance ${
    critChance(state.upgrades.critChance + 1) * 100
  }% ${upgradeCost(state.upgrades.critChance)}</button>

  `;

  DOM.upgrades.loadTime = document.getElementById(LOAD_TIME);
  DOM.upgrades.lootBonus = document.getElementById(LOOT_BONUS);
  DOM.upgrades.critChance = document.getElementById(CRIT_CHANCE);

  DOM.upgrades.loadTime.addEventListener('click', () => {
    state.player.coins -= upgradeCost(state.upgrades.loadTime);
    state.upgrades.loadTime++;
    renderUpgrades(state);
  });

  DOM.upgrades.lootBonus.addEventListener('click', () => {
    state.player.coins -= upgradeCost(state.upgrades.lootBonus);
    state.upgrades.lootBonus++;
    renderUpgrades(state);
  });

  DOM.upgrades.critChance.addEventListener('click', () => {
    state.player.coins -= upgradeCost(state.upgrades.critChance);
    state.upgrades.critChance++;
    renderUpgrades(state);
  });
};

const updateUpgradeAvailability = (state) => {
  DOM.upgrades.loadTime.disabled =
    state.player.coins < upgradeCost(state.upgrades.loadTime);
  DOM.upgrades.lootBonus.disabled =
    state.player.coins < upgradeCost(state.upgrades.lootBonus);
  DOM.upgrades.critChance.disabled =
    state.player.coins < upgradeCost(state.upgrades.critChance);
};

renderPreferences();

boot();
