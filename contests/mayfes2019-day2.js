const assert = require('assert');
const range = require('lodash/range');
const shuffle = require('lodash/shuffle');
const sample = require('lodash/sample');
const flatten = require('lodash/flatten');

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

	return precedingCells.filter((cell) => ![0, 3, 4, 5, 19, 20, 21, 24].includes(cell));
};

const wins = ['01', '12', '20'];
const loses = ['10', '21', '02'];

module.exports.generateInput = () => {
	const answer = sample(range(20, 190));

	const lines = flatten([
		...shuffle([
			...range(answer).map(() => sample(wins)),
			...range(99).map(() => sample(loses)),
		]),
		sample(loses),
		...range(300 - answer - 100).map(() => sample([...wins, ...loses])),
	]);

	assert(lines.length === 300);

	return `${lines.join('\n')}\n`;
};

module.exports.isValidAnswer = (input, output) => {
	if (process.env.NODE_ENV !== 'production') {
		return true;
	}

	const lines = input.split('\n').filter((line) => line.length > 0);

	assert(lines.length === 300);

	let winCount = 0;
	let loseCount = 0;

	for (const line of lines) {
		if (wins.includes(line)) {
			winCount++;
		}
		if (loses.includes(line)) {
			loseCount++;
		}
		if (loseCount === 100) {
			break;
		}
	}

	const correctOutput = '1'.repeat(winCount);

	const trimmedOutput = output
		.toString()
		.replace(/\s/g, '');

	console.log('info:', {input, correctOutput, output, trimmedOutput});

	return trimmedOutput === correctOutput;
};
