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
    loadTicks: 'Load Time',
    lootBonus: 'Loot Bonus',
    critChance: 'Crit Chance',
    critMultiplier: 'Crit Multiplier',
  };

  const formats = {
    loadTicks: (value) => value,
    lootBonus: (value) => value,
    critChance: (value) => (value * 100).toFixed(1) + '%',
    critMultiplier: (value) => value,
  };

  const upgradeDOMElements = [];

  for (let upgrade in state.upgrades) {
    const level = state.upgrades[upgrade];

    upgradeDOMElements.push(`
    <div>
    <span>${labels[upgrade]}</span>
    <span>${formats[upgrade](upgradeValues[upgrade](level))}</span>
    <span> --> </span>
    <span>${formats[upgrade](upgradeValues[upgrade](level + 1))}</span>
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
