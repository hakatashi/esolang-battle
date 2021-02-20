const assert = require('assert');
const sample = require('lodash/sample');
const shuffle = require('lodash/shuffle');
const languages = require('../data/languages/hackathon2018.js');

const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

module.exports.getPrecedingIndices = () => languages.map((_, i) => i);

const generateInputCase = () => {
	const tokens = [...Array(81).fill('x'), '0123456789', '9876543210'];

	let input = shuffle(tokens).join('');

	while (input.includes('x')) {
		const xIndex = input.indexOf('x');
		const prevChar = input[xIndex - 1];
		const nextChar = input[xIndex + 1];
		const candidates = digits.filter(
			(digit) => digit.toString() !== prevChar && digit.toString() !== nextChar,
		);
		input = input.replace('x', sample(candidates).toString());
	}

	assert(input.length === 101);

	return `${input}\n`;
};

module.exports.generateInput = () => {
	let input = null;

	while (!input || input.match(/(00|11|22|33|44|55|66|77|88|99)/)) {
		input = generateInputCase();
	}

	return input;
};

module.exports.isValidAnswer = (input, output) => {
	if (process.env.NODE_ENV !== 'production') {
		return true;
	}

	const correctOutput = input
		.trim()
		.split('')
		.map((char, i, chars) => {
			if (i + 1 >= chars.length) {
				return '';
			}

			const nextChar = chars[i + 1];
			return nextChar > char ? '1' : '0';
		})
		.join('');
	assert(correctOutput.length === 100);

	// Trim
	const trimmedOutput = output.toString().replace(/\s/g, '');

	console.log('info:', {input, correctOutput, output, trimmedOutput});

	return trimmedOutput === correctOutput;
};
