const createState = () => ({
  isPaused: false,
  isGameOver: false,
  waveCounter: 0,
  wave: 0,
  enemies: [],
  arrows: [],
  structures: [],
  structureIndex: 0,
  visual: {
    shakeCounter: 0,
  },
  actions: {
    earthquake: {
      cooldown: 60 * 15,
      cooldownCounter: 0,
    },
    blizzard: {
      cooldown: 60 * 30,
      cooldownCounter: 0,
    },
  },
  upgrades: {
    lootBonus: 0,
    tripleLootChance: 0,
    damage: 0,
    loadTicks: 0,
    range: 0,
    critChance: 0,
    critMultiplier: 0,
    pierceChance: 0,
    freezeChance: 0,
    freezeDuration: 0,
    freezeDamage: 0,
    earthquakeCoinDamage: 0,
    actionDiscount: 0,
    actionCooldown: 0,
  },
  structureOptions: {
    flower: {
      waveBonus: 0.02,
    },
    clover: {
      luckBonus: 0.02,
    },
  },
  player: {
    coins: 0,
    range: 200,
    loadCounter: 0,
  },
});
