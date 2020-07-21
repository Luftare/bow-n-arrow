const actionCooldowns = {
  earthquake: 1500,
};

const actionCosts = {
  earthquake: (game) =>
    Math.ceil(game.state.player.coins * (1 + get('actionDiscount'))),
  blizzard: (game) => Math.ceil(10 * (1 + get('actionDiscount'))),
};

const actionTriggers = {
  earthquake() {
    const enemyCount = game.state.enemies.length;
    const { coins } = game.state.player;

    game.state.visual.shakeCounter = 20;

    if (enemyCount === 0) return;

    const totalDamage = coins * get('earthquakeCoinDamage');
    const damagePerEnemy = Math.round(totalDamage / enemyCount);

    game.state.enemies.forEach((enemy) => {
      enemy.hp -= damagePerEnemy;
      DOM.displayMessage(
        enemy.x + randomDev(10),
        FLOOR_Y - 64 * (enemy.isBoss ? 2 : 1) + randomDev(10),
        toPostfix(damagePerEnemy),
        'black',
        16
      );

      if (enemy.hp <= 0) {
        handleEnemyKill(game.state, enemy);
      }
    });
  },
  blizzard() {
    const freezeDuration = get('freezeDuration');
    game.state.enemies.forEach((e) => {
      e.freeze += freezeDuration;
    });
  },
};

const updateActions = (state) => {
  Object.keys(state.actions).forEach((key) => {
    state.actions[key].cooldownCounter = Math.max(
      0,
      state.actions[key].cooldownCounter - game.preferences.timeSpeed
    );
    DOM.actionCooldowns[key].innerHTML = Math.ceil(
      state.actions[key].cooldownCounter / 60
    );

    DOM.actionCooldowns[key].style.display =
      state.actions[key].cooldownCounter <= 0 ? 'none' : 'flex';

    DOM.actionCosts[key].innerHTML = toPostfix(actionCosts[key](game));
  });
};

const renderActions = (state) => {
  const details = {
    earthquake: {
      label: 'Earthquake',
      color: 'red',
      description: () =>
        `Converts each coin to ${get('earthquakeCoinDamage').toFixed(
          2
        )} damage equally distributed to all enemies.`,
    },
    blizzard: {
      label: 'Blizzard',
      color: 'blue',
      description: () =>
        `Freezes all enemies for ${(get('freezeDuration') / 60).toFixed(
          2
        )} seconds.`,
    },
  };

  const actionsKeys = Object.keys(state.actions);
  DOM.actions.container.innerHTML = actionsKeys
    .map((key) => {
      const { label, description, color } = details[key];
      return `
        <div class="card">
          <h5>${label}</h5>
          <p>${description()}</p>
          <p class="card-clear">Cost: <b><span id="${key}-action-cost">${123}</span></b></p>
          <button id="${key}-action" class="relative button button--${color}">Trigger
            <div id="${key}-action-cooldown" class="cooldown"></div>
          </button>
        </div>
      `;
    })
    .join('');

  actionsKeys.forEach((key) => {
    DOM.actions[key] = document.getElementById(`${key}-action`);
    DOM.actionCooldowns[key] = document.getElementById(
      `${key}-action-cooldown`
    );
    DOM.actionCosts[key] = document.getElementById(`${key}-action-cost`);
    DOM.actions[key].addEventListener('click', () => {
      if (game.state.isGameOver) return;
      state.actions[key].cooldownCounter = state.actions[key].cooldown;
      actionTriggers[key]();
    });
  });
};
