const renderStats = (state) => {
  DOM.stats.innerHTML = `
    <span>Coins: ${state.player.coins}</span>
    <span>Wave: ${state.wave}</span>
  `;

  DOM.gameOverScreen.style.opacity = state.isGameOver ? 1 : 0;
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

  document.getElementById(NEW_GAME).addEventListener('click', () => {
    game.state = createState();
    renderUpgrades(game.state);
  });
  timeSpeeds.forEach((value) => {
    document
      .getElementById(timeSpeedId(value))
      .addEventListener('change', () => (game.preferences.timeSpeed = value));
  });
};

const renderUpgrades = (state) => {
  const labels = {
    damage: 'Damage',
    range: 'Range',
    loadTicks: 'Load Time',
    lootBonus: 'Loot Bonus',
    critChance: 'Crit Chance',
    critMultiplier: 'Crit Multiplier',
    freezeChance: 'Freeze Chance',
    freezeDuration: 'Freeze Duration',
    pierceChance: 'Pierce Chance',
  };

  const percentage = (value) => (value * 100).toFixed(1) + '%';
  const decimal = (value) => value.toFixed(1);

  const formats = {
    lootBonus: (value) => value,
    damage: (value) => value,
    loadTicks: (value) => value,
    range: (value) => value + 'm',
    critChance: percentage,
    critMultiplier: decimal,
    freezeChance: percentage,
    freezeDuration: (value) => value,
    pierceChance: percentage,
  };

  const upgradeDOMElements = [];

  for (let upgrade in state.upgrades) {
    const level = state.upgrades[upgrade];

    upgradeDOMElements.push(`
    <div>
    <span>${labels[upgrade]}</span>
    <span>${formats[upgrade](get(upgrade))}</span>
    <span> --> </span>
    <span>${formats[upgrade](get(upgrade, 1))}</span>
    <span>Cost: ${upgradeCost(level)}</span>
    <button id="${upgrade}">Upgrade</button>
    </div>
    `);
  }

  DOM.upgrades.container.innerHTML = upgradeDOMElements.join('\n');

  for (let upgrade in state.upgrades) {
    const level = state.upgrades[upgrade];
    DOM.upgrades[upgrade] = document.getElementById(upgrade);
    DOM.upgrades[upgrade].addEventListener('click', () => {
      state.player.coins -= upgradeCost(state.upgrades[upgrade]);
      state.upgrades[upgrade]++;
      renderUpgrades(state);
    });
  }
};

const updateUpgradeAvailability = (state) => {
  for (let upgrade in state.upgrades) {
    DOM.upgrades[upgrade].disabled =
      state.player.coins < upgradeCost(state.upgrades[upgrade]);
  }
};

boot();
renderPreferences();
