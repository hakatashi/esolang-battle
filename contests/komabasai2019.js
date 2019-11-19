const assert = require('assert');
const range = require('lodash/range');
const shuffle = require('lodash/shuffle');
const random = require('lodash/random');

module.exports.getPrecedingIndices = (cellIndex) => {
	assert(cellIndex >= 0);
	assert(cellIndex < 25);

	const x = cellIndex % 5;
	const y = Math.floor(cellIndex / 5);

	const precedingCells = [];

	if (x - 1 >= 0) {
		precedingCells.push(y * 5 + (x - 1));
	}

	if (x + 1 < 5) {
		precedingCells.push(y * 5 + (x + 1));
	}

	if (y - 1 >= 0) {
		precedingCells.push((y - 1) * 5 + x);
	}

	if (y + 1 < 5) {
		precedingCells.push((y + 1) * 5 + x);
	}

	return precedingCells.filter((cell) => ![0, 4, 20, 24].includes(cell));
};


module.exports.generateInput = () => {
	const count = 100;

	const lines = shuffle([
		...range(10, 100),
		...range(count - 90).map(() => random(10, 99)),
	]);

	assert(lines.length === 100);

	return `${lines.join('\n')}\n`;
};

module.exports.isValidAnswer = (input, output) => {
	if (process.env.NODE_ENV !== 'production') {
		return true;
	}

	const lines = input.split('\n').filter((line) => line.length > 0);

	assert(lines.length === 100);

	let correctOutput = '';

	for (const line of lines) {
		const n = parseInt(line);
		if (range(1, 10).some((i) => n % i === 0 && n / i <= 9)) {
			correctOutput += '1';
		} else {
			correctOutput += '0';
		}
	}

	const trimmedOutput = output
		.toString()
		.replace(/\s/g, '');

	console.log('info:', {input, correctOutput, output, trimmedOutput});

	return trimmedOutput === correctOutput;
};
