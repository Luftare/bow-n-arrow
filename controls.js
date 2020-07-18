const renderStats = (state) => {
  DOM.stats.innerHTML = `
    <span>Coins: <b>${state.player.coins}</b></span>
    <span>Wave: <b>${state.wave}</b></span>
  `;

  DOM.gameOverScreen.style.opacity = state.isGameOver ? 1 : 0;
};

const renderPreferences = () => {
  const timeSpeeds = [1, 2, 8, 16];
  const timeSpeedId = (num) => `time-speed-${num}`;

  DOM.preferences.innerHTML = timeSpeeds
    .map(
      (value, index) =>
        `<label><input type="radio" name="time-speed" id="${timeSpeedId(
          value
        )}" ${index === 0 ? 'checked' : ''} /> x${value}</label>`
    )
    .join('');

  timeSpeeds.forEach((value) => {
    document
      .getElementById(timeSpeedId(value))
      .addEventListener('change', () => (game.preferences.timeSpeed = value));
  });
};

const renderUpgrades = (state) => {
  const labels = {
    lootBonus: 'Loot',
    tripleLootChance: 'Triple Loot Chance',
    damage: 'Damage',
    range: 'Range',
    loadTicks: 'Load Time',
    critChance: 'Crit Chance',
    critMultiplier: 'Crit Multiplier',
    pierceChance: 'Pierce Chance',
    freezeChance: 'Freeze Chance',
    freezeDuration: 'Freeze Duration',
  };

  const colors = {
    lootBonus: 'yellow',
    tripleLootChance: 'yellow',
    damage: 'red',
    range: 'red',
    loadTicks: 'red',
    critChance: 'red',
    critMultiplier: 'red',
    pierceChance: 'red',
    freezeChance: 'blue',
    freezeDuration: 'blue',
  };

  const percentage = (value) => (value * 100).toFixed(1) + '%';
  const decimal = (value) => value.toFixed(1);

  const formats = {
    lootBonus: (value) => value,
    tripleLootChance: percentage,
    damage: (value) => value,
    loadTicks: (value) => (value / 60).toFixed(2) + 's',
    range: (value) => (0.06 * value).toFixed(1) + 'm',
    critChance: percentage,
    critMultiplier: decimal,
    freezeChance: percentage,
    freezeDuration: (value) => value,
    pierceChance: percentage,
  };

  const upgradeDOMElements = [];

  for (let upgrade in state.upgrades) {
    const level = state.upgrades[upgrade];
    const change = formats[upgrade](get(upgrade, 1) - get(upgrade));

    upgradeDOMElements.push(`
    <tr>
      <td>${labels[upgrade]}</td>
      <td id="${upgrade}-value" class="text-center">${formats[upgrade](
      get(upgrade)
    )}</td>
      <td class="text-center">${
        (change + '').includes('-') ? '' : '+'
      }${change}</td>
      <td class="text-center">${upgradeCost(level)}</td>
      <td style="text-align: right;">
        <button id="${upgrade}" class="button button--${
      colors[upgrade]
    }">Upgrade</button>
      </td>
    </tr>
    `);
  }

  DOM.upgrades.container.innerHTML = `
    <table>
    <tr>
      <th>Type</th>
      <th class="text-center">Current</th>
      <th class="text-center">Change</th>
      <th class="text-center">Cost</th>
      <th></th>
    </tr>
    ${upgradeDOMElements.join('')}
    </table>
  `;

  for (let upgrade in state.upgrades) {
    const level = state.upgrades[upgrade];
    DOM.upgrades[upgrade] = document.getElementById(upgrade);
    DOM.upgrades[upgrade].addEventListener('click', () => {
      if (game.state.isGameOver) return;
      state.player.coins -= upgradeCost(state.upgrades[upgrade]);
      state.upgrades[upgrade]++;
      renderUpgrades(state);

      DOM.highlight(`${upgrade}-value`);
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
