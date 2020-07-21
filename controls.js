const renderStats = (state) => {
  DOM.stats.innerHTML = `
    <span>Coins: <b>${toPostfix(state.player.coins)}</b></span>
    <span>Wave: <b>${state.wave}</b></span>
  `;

  const isBoss = waveToIsBoss(game.state.wave);

  DOM.waveStats.innerHTML = `
    <span>${isBoss ? 'Boss' : 'Orcs'}: <b>${toPostfix(
    isBoss ? waveToBossHp(game.state.wave) : waveToEnemyHp(game.state.wave)
  )}</b> hp</span>  
  `;

  DOM.gameOverText.innerHTML = isGameWon() ? 'YOU WIN!' : 'GAME OVER';
  DOM.gameOverScreen.style.display = state.isGameOver ? 'flex' : 'none';
  DOM.pauseScreen.style.display = state.isPaused ? 'flex' : 'none';
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

const updateButtons = (state) => {
  Object.keys(state.upgrades).forEach((key) => {
    DOM.upgrades[key].disabled =
      state.player.coins < upgradeCost(state.upgrades[key]);
  });

  Object.keys(state.structureOptions).forEach((key) => {
    DOM.structureOptions[key].disabled =
      state.player.coins < indexToStructureCost(state.structureIndex);
  });

  Object.keys(state.actions).forEach((key) => {
    DOM.actions[key].disabled = state.actions[key].cooldownCounter > 0;
  });
};
