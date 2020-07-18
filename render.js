const { renderGame } = (() => {
  const renderRange = (ctx, canvas, state) => {
    ctx.fillStyle = 'lightgray';
    ctx.fillRect(
      PLAYER_X + get('range'),
      FLOOR_Y,
      -4,
      DOM.game.height - FLOOR_Y
    );
  };

  const renderFlowers = (ctx, canvas, state) => {
    state.flowers.forEach(({ x }) => {
      ctx.fillStyle = 'red';
      ctx.drawImage(
        DOM.images.flower,
        Math.round(x - DOM.images.flower.width),
        Math.round(FLOOR_Y - DOM.images.flower.height)
      );
    });
  };

  const renderEnemies = (ctx, canvas, state) => {
    state.enemies.forEach(
      ({ x, hp, maxHp, freeze, isBoss, animationOffset }) => {
        const sizeMultiplier = isBoss ? 2 : 1;
        const images = isBoss ? DOM.images.bosses : DOM.images.orcs;

        ctx.drawImage(
          images[
            booleanOsc(isBoss ? 0.013 : 0.018, animationOffset) || freeze > 0
              ? 0
              : 1
          ],
          Math.round(x - 20 * sizeMultiplier),
          Math.round(FLOOR_Y - 64 * sizeMultiplier),
          64 * sizeMultiplier,
          64 * sizeMultiplier
        );

        const isFrozen = freeze > 0;

        if (isFrozen) {
          ctx.fillStyle = 'lightblue';
          ctx.globalAlpha = 0.7;
          ctx.fillRect(x, FLOOR_Y, 32 * sizeMultiplier, -64 * sizeMultiplier);
          ctx.globalAlpha = 1;
        }

        ctx.fillStyle = 'red';
        ctx.fillRect(
          x,
          FLOOR_Y - PLAYER_HEIGHT * sizeMultiplier - 3,
          PLAYER_WIDTH * sizeMultiplier,
          -5 * sizeMultiplier
        );
        ctx.fillStyle = 'lightgreen';
        const hpWidth = (PLAYER_WIDTH * sizeMultiplier * hp) / maxHp;
        ctx.fillRect(
          x,
          FLOOR_Y - PLAYER_HEIGHT * sizeMultiplier - 3,
          hpWidth,
          -5 * sizeMultiplier
        );
      }
    );
  };

  const renderPlayer = (ctx, canvas, state) => {
    const maxLoadTicks = get('loadTicks');
    const isAiming = maxLoadTicks - state.player.loadCounter > 40;
    const playerImage = isAiming ? DOM.images.player[0] : DOM.images.player[1];
    ctx.drawImage(
      playerImage,
      Math.round(PLAYER_X - playerImage.width * 1 + 4),
      Math.round(FLOOR_Y - playerImage.height * 1),
      64 * 1,
      80 * 1
    );

    if (isAiming) {
      ctx.drawImage(
        DOM.images.arrow,
        PLAYER_X - DOM.images.arrow.width + 6,
        FLOOR_Y - PLAYER_HEIGHT * 0.65 - DOM.images.arrow.height
      );
    }
  };

  const renderArrows = (ctx, canvas, state) => {
    ctx.fillStyle = 'black';
    state.arrows.forEach(({ x }) => {
      ctx.drawImage(
        DOM.images.arrow,
        x - DOM.images.arrow.width + 6,
        FLOOR_Y - PLAYER_HEIGHT * 0.65 - DOM.images.arrow.height
      );
    });
  };

  const renderGame = (canvas, state) => {
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    [
      renderRange,
      renderFlowers,
      renderEnemies,
      renderPlayer,
      renderArrows,
    ].forEach((fn) => fn(ctx, canvas, state));
  };
  return {
    renderGame,
  };
})();
