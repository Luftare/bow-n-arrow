const get = (key, levelAdjust = 0) =>
  upgradeValues[key](game.state.upgrades[key] + levelAdjust);

const upgradeCost = (currentLevel) => Math.floor(2 ** currentLevel);

const upgradeValues = {
  lootBonus: (level) => 1 + Math.floor(level ** 2.1),
  tripleLootChance: (level) => 0 + level * 0.03,
  flower: (level) => 0.02 * level,
  damage: (level) => Math.floor(10 + level ** 1.5),
  loadTicks: (level) => 60 * (Math.PI * 0.5 - Math.atan(level / 20)),
  range: (level) => 250 + level * 4,
  critChance: (level) => 0.04 + level * 0.02,
  critMultiplier: (level) => 1.5 + level * 0.15,
  pierceChance: (level) => 0.0 + level * 0.02,
  freezeChance: (level) => 0 + level * 0.02,
  freezeDuration: (level) => 20 + level * 10,
  freezeDamage: (level) => level * 0.1,
  earthquakeCoinDamage: (level) => 0.1 + level * 0.05,
  actionDiscount: (level) => 0 - level * 0.05,
};

const renderUpgrades = (state) => {
  const labels = {
    lootBonus: 'Coin reward',
    tripleLootChance: 'Triple Loot Chance',
    flower: 'Coin Flower',
    damage: 'Damage',
    range: 'Range',
    loadTicks: 'Load Time',
    critChance: 'Crit Chance',
    critMultiplier: 'Crit Multiplier',
    pierceChance: 'Pierce Chance',
    freezeChance: 'Freeze Chance',
    freezeDuration: 'Freeze Duration',
    freezeDamage: 'Freeze Damage / s',
    earthquakeCoinDamage: 'Earthquake conversion',
    actionDiscount: 'Action Discount',
  };

  const colors = {
    lootBonus: 'yellow',
    tripleLootChance: 'yellow',
    flower: 'yellow',
    damage: 'red',
    range: 'red',
    loadTicks: 'red',
    critChance: 'red',
    critMultiplier: 'red',
    pierceChance: 'red',
    freezeChance: 'blue',
    freezeDuration: 'blue',
    freezeDamage: 'blue',
    earthquakeCoinDamage: '',
    actionDiscount: '',
  };

  const descriptions = {
    lootBonus: 'Coin reward for killing an orc',
    tripleLootChance: 'Chance of getting a triple reward',
    damage: 'Arrow base damage',
    range: 'Range of arrow',
    loadTicks: 'Time between shooting arrows',
    critChance:
      'Chance of making a critical hit and dealing extra damage to target',
    critMultiplier: 'Damage multiplier when a critical hit occurs',
    pierceChance:
      "Arrow's chance to pierce a target and continue towards the next target",
    freezeChance:
      'Chance of freezing a target making it unable to move while frozen. Frozen targets are 2x likely to receive a critical hit.',
    freezeDuration:
      'Duration of the freeze effect. Frozen targets cannot be pierced.',
    freezeDamage: `Damage per second caused by freeze effect.`,
    earthquakeCoinDamage:
      'Ratio of how coins are transformed to earthquake damage.',
    actionDiscount: 'Action trigger cost discount.',
  };

  const formats = {
    lootBonus: toPostfix,
    tripleLootChance: toPercentage,
    flower: toPercentage,
    damage: toPostfix,
    loadTicks: toSeconds,
    range: (value) => (0.06 * value).toFixed(1) + 'm',
    critChance: toPercentage,
    critMultiplier: toDecimal,
    pierceChance: toPercentage,
    freezeChance: toPercentage,
    freezeDuration: toSeconds,
    freezeDamage: (value) => (value * 60).toFixed(0),
    earthquakeCoinDamage: toPercentage,
    actionDiscount: toPercentage,
  };

  const upgradeTriggers = {
    earthquakeCoinDamage() {
      renderActions(game.state);
    },
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
      <td class="text-center">${toPostfix(upgradeCost(level))}</td>
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

      if (upgradeTriggers[upgrade]) upgradeTriggers[upgrade]();

      renderUpgrades(state);

      DOM.highlight(`${upgrade}-value`);
    });
  }
};
