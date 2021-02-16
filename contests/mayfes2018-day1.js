const assert = require('assert');
const random = require('lodash/random');

const A = 'A'.charCodeAt(0);

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

module.exports.generateInput = () => `${Array(26)
	.fill()
	.map(() => String.fromCharCode(A + random(0, 25)))
	.join('')}\n`;

module.exports.isValidAnswer = (input, output) => {
	if (process.env.NODE_ENV !== 'production') {
		return true;
	}

	const correctOutput = input
		.trim()
		.split('')
		.map((char, i) => String.fromCharCode(((char.charCodeAt(0) - A + i + 1) % 26) + A))
		.join('');
	assert(correctOutput.length === 26);

	// Trim
	const trimmedOutput = output.toString().replace(/\s/g, '');

	console.log('info:', {input, correctOutput, output, trimmedOutput});

	return trimmedOutput === correctOutput;
};
