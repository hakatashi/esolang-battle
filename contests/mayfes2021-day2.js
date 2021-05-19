const assert = require('assert');
const range = require('lodash/range');
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

module.exports.generateInput = () => {
	const syllables = [
		...range(10).map(() => 'to'),
		...range(10).map(() => 'kyo'),
	];
	assert(syllables.length === 20);

	const line = shuffle(syllables).join('');
	assert(line.length === 50);
	assert(line.includes('tokyo') || line.includes('kyoto'));

	return `${line}\n`;
};

module.exports.isValidAnswer = (input, output) => {
	const count = (s, t) => s.split(t).length - 1;

	const tokyoCount = count(input, 'tokyo');
	const kyotoCount = count(input, 'kyoto');

	const trimmedOutput = output.toString().replace(/\s/g, '');

	console.log('info:', {input, tokyoCount, kyotoCount, output, trimmedOutput});

	let t = 0;
	let k = 0;

	for (const char of trimmedOutput) {
		if (char === 't' || char === 'T') {
			t += 1;
		} else if (char === 'k' || char === 'K') {
			k += 1;
		} else {
			return false;
		}
	}

	return (t === tokyoCount && k === 0) || (t === 0 && k === kyotoCount);
};
