const assert = require('assert');
const random = require('lodash/random');
const sum = require('lodash/sum');

module.exports.getPrecedingIndices = (cellIndex) => {
	assert(cellIndex >= 0);
	assert(cellIndex < 9);

	const x = cellIndex % 3;
	const y = Math.floor(cellIndex / 3);

	const precedingCells = [];

	if (x - 1 >= 0) {
		precedingCells.push(y * 3 + (x - 1));
	}

	if (x + 1 < 3) {
		precedingCells.push(y * 3 + (x + 1));
	}

	if (y - 1 >= 0) {
		precedingCells.push((y - 1) * 3 + x);
	}

	if (y + 1 < 3) {
		precedingCells.push((y + 1) * 3 + x);
	}

	return precedingCells;
};

module.exports.generateInput = () => `${Array(100).fill().map(() => random()).join('')}\n`;

module.exports.isValidAnswer = (input, output) => {
	if (process.env.NODE_ENV !== 'production') {
		return true;
	}

	const inputNumbers = input.split('').map((n) => parseInt(n));
	const correctOutput = inputNumbers.map((n, i) => sum(inputNumbers.slice(0, i)) % 2).join('');
	assert(correctOutput.length === 100);

	// Trim
	const trimmedOutput = output
		.toString()
		.replace(/\s/g, '');

	console.log('info:', {input, correctOutput, output, trimmedOutput});

	return trimmedOutput === correctOutput;
};
