const assert = require('assert');
const flatten = require('lodash/flatten');
const range = require('lodash/range');
const sample = require('lodash/sample');
const shuffle = require('lodash/shuffle');
const zip = require('lodash/zip');

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

	return precedingCells.filter(
		(cell) => ![0, 3, 4, 5, 19, 20, 21, 24].includes(cell),
	);
};

const alphabets = range(26).map((i) => String.fromCharCode('a'.charCodeAt() + i));

module.exports.generateInput = () => {
	const letters = shuffle([
		...alphabets,
		...range(50 - alphabets.length).map(() => sample(alphabets)),
	]);

	const numbers = flatten(
		shuffle([
			...range(2, 10),
			...range(50 - 8 - 3 - 1).map(() => sample(range(1, 10))),
			[1, 1, 1],
		]),
	).concat([sample(range(2, 10))]);

	assert(letters.length === 50);
	assert(numbers.length === 50);

	return `${zip(letters, numbers)
		.map(([letter, number]) => (number === 1 ? letter : `${letter}${number}`))
		.join('')}\n`;
};

module.exports.isValidAnswer = (input, output) => {
	if (process.env.NODE_ENV !== 'production') {
		return true;
	}

	const chunks = input.split(/(?=[a-z])/);

	assert(chunks.length === 50);

	const correctOutput = chunks
		.map((chunk) => {
			const [letter, count = '1'] = chunk.split('');
			return letter.repeat(parseInt(count));
		})
		.join('');

	const trimmedOutput = output.toString().replace(/\s/g, '');

	console.log('info:', {input, correctOutput, output, trimmedOutput});

	return trimmedOutput === correctOutput;
};
