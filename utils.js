const humanizePostFixes = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];

const isInt = (num) => Math.floor(num) === num;

const humanizeNumber = (num) => {
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
