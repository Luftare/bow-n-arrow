const renderStats = (state) => {
  DOM.stats.innerHTML = `
    <span>Coins: <b>${humanizeNumber(state.player.coins)}</b></span>
    <span>Wave: <b>${state.wave}</b></span>
  `;

  DOM.gameOverText.innerHTML = isGameWon() ? 'YOU WIN!' : 'GAME OVER';
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

  DOM.preferences.innerHTML +=
    '<button class="button" id="pause" style="width: 90px;">Pause</button>';

  timeSpeeds.forEach((value) => {
    document
      .getElementById(timeSpeedId(value))
      .addEventListener('change', () => (game.preferences.timeSpeed = value));
  });

  document.getElementById('pause').addEventListener('click', (e) => {
    game.state.isPaused = !game.state.isPaused;
    e.target.innerHTML = game.state.isPaused ? 'Continue' : 'Pause';
  });
};

const renderStructureOptions = () => {
  const optionDOMElements = Object.keys(game.state.structureOptions).map(
    (key) => {
      const { label, description } = game.state.structureOptions[key];
      return `
        <div class="card">
          <h5>${label}</h5>
          <p>${description()}</p>
          <p class="card-clear">Cost: <b>${humanizeNumber(
            indexToStructureCost(game.state.structureIndex)
          )}</b></p>
          <button id="${key}-structure" class="button">Purchase</button>
        </div>
      `;
    }
  );

  DOM.structureOptions.container.innerHTML = optionDOMElements.join('');

  Object.keys(game.state.structureOptions).forEach((key) => {
    DOM.structureOptions[key] = document.getElementById(`${key}-structure`);
  });

  Object.keys(game.state.structureOptions).forEach((key) => {
    DOM.structureOptions[key].addEventListener('click', () => {
      spawnStructure(key);
      renderStructureOptions();
    });
  });
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
  };

  const descriptions = {
    lootBonus: 'Coin reward for killing an orc',
    tripleLootChance: 'Chance of getting a triple reward',
    flower: `At the beginning of a wave, each flower generates additional ${(
      upgradeValues.flower(1) * 100
    ).toFixed(0)}% of current coins`,
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
  };

  const percentage = (value) => (value * 100).toFixed(1) + '%';
  const decimal = (value) => value.toFixed(1);
  const seconds = (value) => (value / 60).toFixed(2) + 's';

  const formats = {
    lootBonus: humanizeNumber,
    tripleLootChance: percentage,
    flower: percentage,
    damage: humanizeNumber,
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
      <td class="text-center">${humanizeNumber(upgradeCost(level))}</td>
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
  for (let option in state.structureOptions) {
    DOM.structureOptions[option].disabled =
      state.player.coins < indexToStructureCost(state.structureIndex);
  }
};

boot();
