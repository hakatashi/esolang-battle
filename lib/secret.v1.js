const assert = require('assert');
const shuffle = require('array-shuffle');

module.exports.generateInput = () => (
  shuffle(
    [
      ...Array.from({ length: 10 }, (e, i) => i),
      ...Array.from({ length: 90 }, () => Math.floor(Math.random() * 10)),
    ]
  ).join('')
);

module.exports.isValidAnswer = (input, output) => {
  assert(input.match(/^\d{100}$/));

  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  const correctOutput = input.split('').map(n => parseInt(n, 10)).sort((a, b) => a - b).join('');

  // Trim
  output = output.toString().trim();

  return output === correctOutput;
};
