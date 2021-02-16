const assert = require('assert');
const countBy = require('lodash/countBy');
const random = require('lodash/random');
const sample = require('lodash/sample');

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

	return precedingCells.filter((cell) => ![3, 12].includes(cell));
};

const getAnswers = (chars) => {
	const answers = [];
	for (const i of Array(chars.length - 16).keys()) {
		if (
			chars[i] === '1' &&
			chars[i + 5] === '1' &&
			chars[i + 12] === '1' &&
			(i + 17 === chars.length || chars[i + 17] === '1')
		) {
			answers.push(i);
		}
	}
	return answers;
};

module.exports.generateInput = () => {
	const index = random(0, 50 - 17 - 1);
	let seed = ['1', ...Array(49).fill('0')];

	seed[index] = '1';
	seed[index + 5] = '1';
	seed[index + 12] = '1';
	seed[index + 17] = '1';

	while (countBy(seed)['1'] < 15 || Math.random() > 0.1) {
		const dopingIndex = sample(
			seed
				.map((char, index) => ({char, index}))
				.filter(({char}) => char === '0'),
		).index;
		assert(seed[dopingIndex] === '0');

		const tempSeed = seed.slice();
		tempSeed[dopingIndex] = '1';
		if (getAnswers(tempSeed).length === 1) {
			seed = tempSeed;
		}
	}

	assert(getAnswers(seed).length === 1);

	return seed.join('');
};

module.exports.isValidAnswer = (input, output) => {
	if (process.env.NODE_ENV !== 'production') {
		// return true;
	}

	const answers = getAnswers(input.trim().split(''));
	assert(answers.length === 1);

	const correctOutput = Array(50)
		.fill()
		.map((_, i) => (answers[0] === i ? '1' : '0'))
		.join('');

	// Trim
	const trimmedOutput = output.toString().replace(/\s/g, '');

	console.log('info:', {input, correctOutput, output, trimmedOutput});

	return trimmedOutput === correctOutput;
};
