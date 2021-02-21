/* eslint-disable array-plural/array-plural */
const assert = require('assert');
const last = require('lodash/last');
const max = require('lodash/max');
const sample = require('lodash/sample');
const sampleSize = require('lodash/sampleSize');
const shuffle = require('lodash/shuffle');
const times = require('lodash/times');
const zip = require('lodash/zip');

const WIDTH = 13;
const HEIGHT = 15;
const xy = (x, y) => y * WIDTH + x;

const patterns = [
['110', '000', '000'],
['100', '010', '000'],
['100', '100', '000'],
['111', '000', '000'],
['110', '001', '000'],
['110', '100', '000'],
['100', '010', '001'],
['100', '100', '100'],
['100', '100', '010'],
['111', '100', '000'],
['110', '110', '000'],
['110', '101', '000'],
['110', '100', '100'],
['110', '100', '010'],
['110', '100', '001'],
['110', '001', '001']];

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

const doubleShuffle = (pattern) => {
   const rowids = shuffle(Array.from({length: pattern.length}, (_,i) => i));
   return shuffle(pattern.map(col => rowids.map(d => col[d]).join('')));
};

module.exports.generateInput = () => {
	let generatedPatterns = [];
	for (const pattern of patterns) {
           generatedPatterns.push(doubleShuffle(pattern));
	}
        const shuffledGeneratedPatterns = shuffle(generatedPatterns);
        return shuffledGeneratedPatterns.flat().join('\n');
};

module.exports.isValidAnswer = (input, output) => {
	if (process.env.NODE_ENV !== 'production') {
		return true;
	}

	const trimmedOutput = output.toString().replace(/\s/g, '').split('');
	if (trimmedOutput.length !== patterns.length) {
		console.log('info: length not valid');
		return false;
	}

	const inputLines = input.split('\n').filter((line) => line.length > 0);
        const onePatternLength = patterns[0].length
	assert(inputLines.length === patterns.length * onePatternLength);

        for (let i = 0; i < patterns.length; i++) {
           const patternAsInt = inputLines.slice(3*i, 3*i+3).map(l => parseInt(l, 2));
           const isNifu = patternAsInt.reduce((acc, item) => acc + item) > patternAsInt.reduce((acc, item) => acc | item);
           if (isNifu !== Boolean(Number(trimmedOutput[i]))) {
            console.log('info: [failed]', {input, output, trimmedOutput});
              return false;
           }
        }

	console.log('info:', {input, output, trimmedOutput});

	return true;
};
