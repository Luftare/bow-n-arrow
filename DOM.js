const DOM = {
  stats: document.getElementById('stats'),
  waveStats: document.getElementById('wave-stats'),
  sticky: document.getElementById('sticky'),
  game: document.getElementById('game'),
  pauseScreen: document.getElementById('pause-screen'),
  gameContainer: document.getElementById('game-container'),
  gameOverScreen: document.getElementById('game-over-screen'),
  gameOverText: document.getElementById('game-over-text'),
  preferences: document.getElementById('preferences'),
  gameElementsContainer: document.getElementById('game-elements-container'),
  actions: {
    container: document.getElementById('actions'),
  },
  upgrades: {
    container: document.getElementById('upgrades'),
  },
  structureOptions: {
    container: document.getElementById('structure-options-container'),
  },

  displayMessage(x, y, message, color, size = 16) {
    const messageElement = document.createElement('span');
    messageElement.innerHTML = message;
    messageElement.style.left = `${x}px`;
    messageElement.style.top = `${y}px`;
    messageElement.style.color = color;
    messageElement.style.fontSize = size;
    messageElement.classList.add('game-element');

    DOM.gameElementsContainer.appendChild(messageElement);

    setTimeout(() => {
      DOM.gameElementsContainer.removeChild(messageElement);
    }, 2000);
  },

  highlight(id) {
    document.getElementById(id).classList.add('bounce-once');

    setTimeout(() => {
      document.getElementById(id).classList.remove('bounce-once');
    }, 300);
  },

  images: {
    arrow: document.getElementById('asset-arrow'),
    flower: document.getElementById('asset-flower'),
    clover: document.getElementById('asset-clover'),
    orcs: [
      document.getElementById('asset-orc-0'),
      document.getElementById('asset-orc-1'),
    ],
    bosses: [
      document.getElementById('asset-boss-0'),
      document.getElementById('asset-boss-1'),
    ],
    player: [
      document.getElementById('asset-player-0'),
      document.getElementById('asset-player-1'),
    ],
  },
};

const handleResize = () => {
  DOM.game.width = DOM.game.clientWidth;
  DOM.game.height = DOM.game.clientHeight;
};

window.addEventListener('resize', handleResize);

window.addEventListener('load', () => {
  boot();
  setTimeout(handleResize, 0);
});

window.addEventListener('scroll', (e) => {
  const isScrolled = window.scrollY > 80;

  DOM.sticky.classList[isScrolled ? 'add' : 'remove']('shrink');
});
