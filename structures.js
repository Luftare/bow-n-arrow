const handleCoinFlowers = () => {
  const flowers = game.state.structures.filter(({ type }) => type === 'flower');
  const flowerCoins = Math.floor(
    game.state.structureOptions.flower.waveBonus *
      flowers.length *
      game.state.player.coins
  );
  game.state.player.coins += flowerCoins;

  if (flowerCoins) {
    const firstFlower = flowers[0];
    const lastFlower = flowers[flowers.length - 1];

    const messageCenter = firstFlower.x + (lastFlower.x - firstFlower.x) / 2;

    DOM.displayMessage(
      messageCenter - 16,
      FLOOR_Y - 50 + randomDev(6),
      `+${toPostfix(flowerCoins)}`,
      'orange',
      16
    );
  }
};

const getCloverBonus = () =>
  game.state.structureOptions.clover.luckBonus *
  game.state.structures.filter(({ type }) => type === 'clover').length;

const renderStructureOptions = () => {
  const details = {
    flower: {
      label: 'Coin Flower',
      description: () =>
        `At the beginning of a wave, each flower generates additional ${(
          game.state.structureOptions.flower.waveBonus * 100
        ).toFixed(0)}% of current coins.`,
    },
    clover: {
      label: 'Clover',
      description: () =>
        `Each clover adds +${(
          game.state.structureOptions.clover.luckBonus * 100
        ).toFixed(0)}% chance to all luck-based effects.`,
    },
  };

  const optionDOMElements = Object.keys(game.state.structureOptions).map(
    (key) => {
      const { label, description } = details[key];
      return `
        <div class="card">
          <h5>${label}</h5>
          <p>${description()}</p>
          <p class="card-clear">Cost: <b>${toPostfix(
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
