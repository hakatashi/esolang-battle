const assert = require('assert');
const shuffle = require('array-shuffle');

const sampleSize = require('lodash/sampleSize');

const triangleNumbers = [
	0,
	1,
	3,
	6,
	10,
	15,
	21,
	28,
	36,
	45,
	55,
	66,
	78,
	91,
	105,
	120,
	136,
	153,
	171,
	190,
	210,
	231,
	253,
];
const notTriangleNumbers = Array.from({length: 256}, (e, i) => i).filter(
	(n) => !triangleNumbers.includes(n)
);

module.exports.generateInput = () => shuffle([
	...triangleNumbers,
	triangleNumbers[Math.floor(Math.random() * triangleNumbers.length)],
	triangleNumbers[Math.floor(Math.random() * triangleNumbers.length)],
	...sampleSize(notTriangleNumbers, 25),
])
	.map((n) => `${n.toString(2).padStart(8, '0')}\n`)
	.join('');

module.exports.isValidAnswer = (input, output) => {
	assert(input.match(/^([01]{8}\n){50}$/));

	if (process.env.NODE_ENV !== 'production') {
		// return true;
	}

	const correctOutput = input
		.split('\n')
		.filter((n) => n.length > 0)
		.map((n) => (triangleNumbers.includes(parseInt(n, 2)) ? '1' : '0'))
		.join('');
	assert(correctOutput.length === 50);

	// Trim
	const trimmedOutput = output
		.toString()
		.replace(/\s/g, '')
		.trim();
	console.log(input, correctOutput);

	return trimmedOutput === correctOutput;
};
