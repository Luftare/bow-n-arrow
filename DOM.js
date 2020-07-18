const DOM = {
  stats: document.getElementById('stats'),
  sticky: document.getElementById('sticky'),
  game: document.getElementById('game'),
  gameContainer: document.getElementById('game-container'),
  gameOverScreen: document.getElementById('game-over-screen'),
  preferences: document.getElementById('preferences'),
  gameElementsContainer: document.getElementById('game-elements-container'),
  upgrades: {
    container: document.getElementById('upgrades'),
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
});

window.addEventListener('scroll', (e) => {
  const isScrolled = window.scrollY > 80;

  DOM.sticky.classList[isScrolled ? 'add' : 'remove']('shrink');
});
