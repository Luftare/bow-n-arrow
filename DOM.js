const DOM = {
  stats: document.getElementById('stats'),
  game: document.getElementById('game'),
  preferences: document.getElementById('preferences'),
  gameElementsContainer: document.getElementById('game-elements-container'),
  upgrades: {
    container: document.getElementById('upgrades'),
  },

  displayMessage(x, y, message, color, size = 14) {
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
    }, 500);
  },
};
