const assert = require('assert');
const shuffle = require('lodash/shuffle');
const truncatedCuboctahedron = require('../data/truncated-cuboctahedron');

module.exports.getPrecedingIndices = (cellIndex) => {
	const faces = [
		...truncatedCuboctahedron.squares,
		...truncatedCuboctahedron.hexagons,
		...truncatedCuboctahedron.octagons,
	];
	const face = faces[cellIndex];

	return Array(26)
		.fill()
		.map((_, index) => index)
		.filter((index) => {
			if (index === cellIndex) {
				return false;
			}

			const testFace = faces[index];
			const sharedVertices = testFace.filter((vertice) => face.includes(vertice));

			return sharedVertices.length === 2;
		});
};

const numbers = Array(90)
	.fill()
	.map((_, x) => (x + 10).toString());

module.exports.generateInput = () => {
	// input generator
	const nums = shuffle(numbers).filter((_, x) => x < 50);
	const input = `${nums.join('\n')}\n`;
	console.log(input);
	return input;
};

module.exports.isValidAnswer = (input, output) => {
	if (process.env.NODE_ENV !== 'production') {
		return true;
	}

	const lines = input.split('\n').filter((line) => line.length > 0);

	assert(lines.length === 50);

	let minValue = parseInt(lines[0]) + 1;
	let cnt = '';

	for (const line of lines) {
		const val = parseInt(line);
		if (val < minValue) {
			minValue = val;
			cnt += '1';
		} else {
			cnt += '0';
		}
	}

	const correctOutput = cnt;

	const trimmedOutput = output.toString().replace(/\s/g, '');

	console.log('info:', {input, correctOutput, output, trimmedOutput});

	return trimmedOutput === correctOutput;
};
