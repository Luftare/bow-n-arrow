const actionTriggers = {
  earthquake() {
    const enemyCount = game.state.enemies.length;
    const { coins } = game.state.player;

    game.state.player.coins = 0;
    game.state.visual.shakeCounter = 20;

    if (enemyCount === 0) return;

    const totalDamage = coins * get('earthquakeCoinDamage');
    const damagePerEnemy = Math.round(totalDamage / enemyCount);

    game.state.enemies.forEach((enemy) => {
      enemy.hp -= damagePerEnemy;
      DOM.displayMessage(
        enemy.x + randomDev(10),
        FLOOR_Y - 64 * (enemy.isBoss ? 2 : 1) + randomDev(10),
        humanizeNumber(damagePerEnemy),
        'black',
        16
      );

      if (enemy.hp <= 0) {
        handleEnemyKill(game.state, enemy);
      }
    });
  },
};
