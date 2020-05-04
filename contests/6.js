/* eslint-disable array-plural/array-plural */
const assert = require('assert');
const last = require('lodash/last');
const max = require('lodash/max');
const sample = require('lodash/sample');
const sampleSize = require('lodash/sampleSize');
const shuffle = require('lodash/shuffle');
const times = require('lodash/times');
const zip = require('lodash/zip');

const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const patterns = [
	'AA AA',
	'AA AB',
	'AA BA',
	'AA BB',
	'AA BC',
	'AB AA',
	'AB AB',
	'AB AC',
	'AB BA',
	'AB BB',
	'AB BC',
	'AB CA',
	'AB CB',
	'AB CC',
	'AB CD',
];

const WIDTH = 11;
const HEIGHT = 13;
const xy = (x, y) => y * WIDTH + x;

module.exports.getPrecedingIndices = (cellIndex) => {
	const x = cellIndex % WIDTH;
	const y = Math.floor(cellIndex / WIDTH);
	const precedings = [];
	if (x - 1 >= 0) {
		precedings.push(xy(x - 1, y));
	}
	if (x + 1 < WIDTH) {
		precedings.push(xy(x + 1, y));
	}
	if (y % 2 === 0) {
		if (x - 1 >= 0 && y - 1 >= 0) {
			precedings.push(xy(x - 1, y - 1));
		}
		if (y - 1 >= 0) {
			precedings.push(xy(x, y - 1));
		}
		if (x - 1 >= 0 && y + 1 < HEIGHT) {
			precedings.push(xy(x - 1, y + 1));
		}
		if (y + 1 < HEIGHT) {
			precedings.push(xy(x, y + 1));
		}
	} else {
		if (x + 1 < WIDTH && y - 1 >= 0) {
			precedings.push(xy(x + 1, y - 1));
		}
		if (y - 1 >= 0) {
			precedings.push(xy(x, y - 1));
		}
		if (x + 1 < WIDTH && y + 1 < HEIGHT) {
			precedings.push(xy(x + 1, y + 1));
		}
		if (y + 1 < HEIGHT) {
			precedings.push(xy(x, y + 1));
		}
	}
	return precedings;
};

const ngRegex = /(\d)\1\1/;

module.exports.generateInput = () => {
	const lines = [];
	for (const pattern of patterns) {
		const generated = [];
		while (generated.length < 2) {
			const selectedDigits = shuffle(sampleSize(digits, 4));
			const line = sample(digits).toString() + pattern
				.replace(/A/g, selectedDigits[0])
				.replace(/B/g, selectedDigits[1])
				.replace(/C/g, selectedDigits[2])
				.replace(/D/g, selectedDigits[3]) + sample(digits).toString();
			if (!line.match(ngRegex) && !generated.includes(line)) {
				generated.push(line);
			}
		}
		lines.push(...generated);
	}

	while (lines.length < 32) {
		const selectedDigits = times(6, () => sample(digits));
		const line = `${selectedDigits.slice(0, 3).join('')} ${selectedDigits.slice(3, 6).join('')}`;
		if (!line.match(ngRegex) && !lines.includes(line)) {
			lines.push(line);
		}
	}

	return shuffle(lines).map((line) => `${line}\n`).join('');
};

const countScore = (line, digit) => {
	const cells = [line[0], line[1], line[2], digit.toString(), line[4], line[5], line[6]];
	const continuousLength = [1];
	for (const [i, cell] of cells.entries()) {
		if (i === 0) {
			continue;
		}
		if (cells[i - 1] === cell) {
			continuousLength.push(last(continuousLength) + 1);
		} else {
			continuousLength.push(1);
		}
	}
	const maximumContinuation = max(continuousLength);
	return maximumContinuation >= 3 ? maximumContinuation : 0;
};

module.exports.isValidAnswer = (input, output) => {
	if (process.env.NODE_ENV !== 'production') {
		return true;
	}

	const trimmedOutput = output.toString().replace(/\s/g, '').split('');
	if (trimmedOutput.length !== 32) {
		console.log('info: length not valid');
		return false;
	}

	const inputLines = input.split('\n').filter((line) => line.length > 0);
	assert(inputLines.length === 32);

	for (const [char, line] of zip(trimmedOutput, inputLines)) {
		if (!digits.includes(char)) {
			return false;
		}
		const digit = parseInt(char);
		const maximumScore = max(digits.map((d) => countScore(line, d)));
		if (countScore(line, digit) !== maximumScore) {
			return false;
		}
	}

	console.log('info:', {input, output, trimmedOutput});

	return true;
};
