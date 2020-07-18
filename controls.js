const renderStats = (state) => {
  DOM.stats.innerHTML = `
    <span>Coins: <b>${state.player.coins}</b></span>
    <span>Wave: <b>${state.wave}</b></span>
  `;

  DOM.gameOverScreen.style.display = state.isGameOver ? 'flex' : 'none';
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
    lootBonus: 'Coin reward',
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

  const descriptions = {
    lootBonus: 'Coin reward for killing an orc',
    tripleLootChance: 'Chance of getting a triple reward.',
    damage: 'Arrow base damage',
    range: 'Range of arrow',
    loadTicks: 'Time between shooting arrows',
    critChance:
      'Chance of making a critical hit and dealing extra damage to target',
    critMultiplier: 'Damage multiplier when a critical hit occurs',
    pierceChance:
      "Arrow's chance to pierce a target and continue towards the next target",
    freezeChance:
      'Chance of freezing a target making it unable to move while frozen',
    freezeDuration:
      'Duration of the freeze effect. Frozen targets cannot be pierced.',
  };

  const percentage = (value) => (value * 100).toFixed(1) + '%';
  const decimal = (value) => value.toFixed(1);
  const seconds = (value) => (value / 60).toFixed(2) + 's';

  const formats = {
    lootBonus: (value) => value,
    tripleLootChance: percentage,
    damage: (value) => value,
    loadTicks: seconds,
    range: (value) => (0.06 * value).toFixed(1) + 'm',
    critChance: percentage,
    critMultiplier: decimal,
    freezeChance: percentage,
    freezeDuration: seconds,
    pierceChance: percentage,
  };

  const upgradeDOMElements = [];

  for (let upgrade in state.upgrades) {
    const level = state.upgrades[upgrade];
    const change = formats[upgrade](get(upgrade, 1) - get(upgrade));

    upgradeDOMElements.push(`
    <tr>
      <td class="tooltip-target">${labels[upgrade]}<div class="tooltip">${
      descriptions[upgrade]
    }</div></td>
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
