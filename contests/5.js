const assert = require('assert');
const shuffle = require('array-shuffle');
const math = require('mathjs');
const chunk = require('lodash/chunk');
const random = require('lodash/random');

module.exports.getPrecedingIndices = (cellIndex) => {
	const x = cellIndex % 24;
	const y = Math.floor(cellIndex / 24);
	const isOdd = Math.floor(y / 2) % 2 === 0;
	const dx = x % 4;
	const dy = y % 2;
	const type = dy * 4 + dx;

	let cells = null;

	if (type === 0) {
		cells = [
			{x: x - 1, y},
			{x: x + 1, y},
			{x, y: y + 1},
		];
	} else if (type === 1) {
		cells = [
			{x: x - 1, y},
			{x: x + 1, y},
			{x: isOdd ? x : x - 4, y: y - 1},
			{x, y: y + 1},
		];
	} else if (type === 2) {
		cells = [
			{x: x - 1, y},
			{x: x + 1, y},
			{x: isOdd ? x + 2 : x - 2, y: y - 1},
		];
	} else if (type === 3) {
		cells = [
			{x: x - 1, y},
			{x: x + 1, y},
			{x: isOdd ? x + 2 : x - 2, y: y - 1},
			{x: x - 2, y: y + 1},
		];
	} else if (type === 4) {
		cells = [
			{x: x - 3, y},
			{x: x + 1, y},
			{x, y: y - 1},
			{x: isOdd ? x + 2 : x - 2, y: y + 1},
		];
	} else if (type === 5) {
		cells = [
			{x: x - 1, y},
			{x: x + 3, y},
			{x, y: y - 1},
			{x: x + 2, y: y - 1},
			{x: isOdd ? x + 2 : x - 2, y: y + 1},
			{x: isOdd ? x + 4 : x, y: y + 1},
		];
	} else {
		return [];
	}

	return cells.filter((c) => (
		0 <= c.x && c.x < 24 && 0 <= c.y && c.y < 14
	)).map((c) => (
		c.y * 24 + c.x
	));
};

const generateTestInput = () => chunk(
	shuffle([
		random(1, 9),
		...Array(11)
			.fill()
			.map(() => random(1, 99)),
	]),
	3
);

const getDeterminant = (vectors) => {
	const [A, B, C, D] = vectors;
	return math.det([
		math.subtract(B, A),
		math.subtract(C, A),
		math.subtract(D, A),
	]);
};

module.exports.generateInput = () => {
	let vectors = null;
	let determinant = null;
	while (true) {
		vectors = generateTestInput();
		determinant = getDeterminant(vectors);
		if (determinant % 6 === 0 && Math.abs(determinant) >= 30000) {
			break;
		}
	}

	const validVectors =
		determinant > 0
			? vectors
			: [vectors[0], vectors[1], vectors[3], vectors[2]];

	return validVectors
		.map(
			(vector) => `${vector
				.map((value) => value.toString(10).padStart(2, '0'))
				.join(' ')}\n`
		)
		.join('');
};

module.exports.isValidAnswer = (input, output) => {
	if (process.env.NODE_ENV !== 'production') {
		return true;
	}

	const answer = getDeterminant(chunk(input.split(/\s/), 3)) / 6;
	assert(Number.isInteger(answer));
	assert(answer >= 5000);

	const correctOutput = answer.toString();

	// Trim
	const trimmedOutput = output
		.toString()
		.trim()
		.replace(/^0+/, '');
	console.log('info:', {input, correctOutput, output, trimmedOutput});

	return trimmedOutput === correctOutput;
};
