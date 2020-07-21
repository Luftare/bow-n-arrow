const humanizePostFixes = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
const randomDev = (max) => (Math.random() - 0.5) * 2 * max;

const booleanOsc = (frq, offset = 0) =>
  game.state.isPaused ||
  game.state.isGameOver ||
  Math.cos(Date.now() * frq * game.preferences.timeSpeed + offset) > 0;

const isInt = (num) => Math.floor(num) === num;

const toPostfix = (num) => {
  const rounded = Math.floor(num);
  const digits = (rounded + '').length;
  const postFixIndex = Math.floor((digits - 1) / 3);
  const postFix = humanizePostFixes[postFixIndex];
  const baseNum = num / 10 ** (postFixIndex * 3);
  return `${
    postFixIndex > 0
      ? baseNum.toFixed(2 - ((digits - 1) % 3))
      : isInt(baseNum)
      ? baseNum
      : baseNum.toFixed(1)
  }${postFix}`;
};
const toPercentage = (value) => (value * 100).toFixed(1) + '%';
const toDecimal = (value) => value.toFixed(1);
const toSeconds = (value) => (value / 60).toFixed(2) + 's';

// [
//   0.1,
//   1,
//   12,
//   122,
//   1222,
//   12222,
//   122222,
//   1222222,
//   12222222,
//   122222222,
//   1222222222,
// ].forEach((n) => {
//   console.log(n + ' -> ' + humanizeNumber(n));
// });
