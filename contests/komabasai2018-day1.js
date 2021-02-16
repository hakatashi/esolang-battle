const assert = require('assert');
const inRange = require('lodash/inRange');
const random = require('lodash/random');

module.exports.getPrecedingIndices = (cellIndex) => {
	assert(cellIndex >= 0);
	assert(cellIndex < 16);

	const x = cellIndex % 4;
	const y = Math.floor(cellIndex / 4);

	const precedingCells = [];

	if (x - 1 >= 0) {
		precedingCells.push(y * 4 + (x - 1));
	}

	if (x + 1 < 4) {
		precedingCells.push(y * 4 + (x + 1));
	}

	if (y - 1 >= 0) {
		precedingCells.push((y - 1) * 4 + x);
	}

	if (y + 1 < 4) {
		precedingCells.push((y + 1) * 4 + x);
	}

	return precedingCells.filter((cell) => ![0, 3, 12, 15].includes(cell));
};

module.exports.generateInput = () => `${[random(10, 99), random(10, 99)].join('\n')}\n`;

module.exports.isValidAnswer = (input, output) => {
	if (process.env.NODE_ENV !== 'production') {
		return true;
	}

	const [height, width] = input
		.trim()
		.split('\n')
		.map((token) => parseInt(token));
	assert(inRange(height, 10, 100));
	assert(inRange(width, 10, 100));

	const correctOutput = [
		'*'.repeat(width),
		...Array(height - 2)
			.fill()
			.map(() => `*${' '.repeat(width - 2)}*`),
		'*'.repeat(width),
	].join('\n');

	// Trim
	const trimmedOutput = output.toString().trim();

	console.log('info:', {input, correctOutput, output, trimmedOutput});

	return trimmedOutput === correctOutput;
};
