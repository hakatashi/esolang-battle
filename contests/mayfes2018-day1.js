const assert = require('assert');
const random = require('lodash/random');

const A = 'A'.charCodeAt(0);

module.exports.generateInput = () => `${Array(26).fill().map(() => String.fromCharCode(A + random(0, 25))).join('')}\n`;

module.exports.isValidAnswer = (input, output) => {
	if (process.env.NODE_ENV !== 'production') {
		return true;
	}

	const correctOutput = input.trim().split('').map((char, i) => (
		String.fromCharCode((char.charCodeAt(0) - A + i + 1) % 26 + A)
	)).join('');
	assert(correctOutput.length === 26);

	// Trim
	const trimmedOutput = output
		.toString()
		.replace(/\s/g, '');

	console.log('info:', {input, correctOutput, output, trimmedOutput});

	return trimmedOutput === correctOutput;
};
