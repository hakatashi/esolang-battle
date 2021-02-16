const assert = require('assert');

module.exports.getPrecedingIndices = (cellIndex) => {
	const width = 5;
	const height = 5;
	assert(cellIndex >= 0);
	assert(cellIndex < width * height);

	const x = cellIndex % width;
	const y = Math.floor(cellIndex / width);

	const precedingCells = [];
	if (x - 1 >= 0) {
		precedingCells.push(y * width + (x - 1));
	}
	if (x + 1 < width) {
		precedingCells.push(y * width + (x + 1));
	}
	if (y - 1 >= 0) {
		precedingCells.push((y - 1) * width + x);
	}
	if (y + 1 < height) {
		precedingCells.push((y + 1) * width + x);
	}

	return precedingCells.filter(
		(cell) => ![0, 4, 5, 9, 10, 14, 15, 19, 20, 24].includes(cell),
	);
};

module.exports.generateInput = () => '';

module.exports.isValidAnswer = (input, output) => {
	if (process.env.NODE_ENV !== 'production') {
		return true;
	}

	const correctOutput = 'hello';

	const trimmedOutput = output.toString().replace(/\s/g, '');

	console.log('info:', {input, correctOutput, output, trimmedOutput});

	return trimmedOutput === correctOutput;
};
