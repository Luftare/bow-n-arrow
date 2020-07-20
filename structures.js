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
      `+${humanizeNumber(flowerCoins)}`,
      'orange',
      16
    );
  }
};
