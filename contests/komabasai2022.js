const assert = require('assert');

module.exports.getPrecedingIndices = (cellIndex) => {
	const width = 5;
	const height = 5;
	assert(cellIndex >= 0);
	assert(cellIndex < width * height);

	const x = cellIndex % width;
	const y = Math.floor(cellIndex / width);

	const precedingCells = [];
	if (x - 1 >= 0) {
		precedingCells.push(y * width + (x - 1));
	}
	if (x + 1 < width) {
		precedingCells.push(y * width + (x + 1));
	}
	if (y - 1 >= 0) {
		precedingCells.push((y - 1) * width + x);
	}
	if (y + 1 < height) {
		precedingCells.push((y + 1) * width + x);
	}

	return precedingCells.filter(
		(cell) => ![0, 4, 5, 9, 10, 14, 15, 19, 20, 24].includes(cell),
	);
};

module.exports.generateInput = () => {
	const dominoes = [...new Array(512)].map((v, i) => (i + 512)
		.toString(2)
		.replace(/0/g, '_')
		.replace(/1/g, '|'));
	for (let a = 512; a > 0; a--) {
		const j = Math.floor(Math.random() * a);
		[dominoes[a - 1], dominoes[j]] = [dominoes[j], dominoes[a - 1]];
	}
	const lines = `${dominoes.slice(0, 30).join('\n')}\n`;
	assert(lines.length === 330);

	return lines;
};

module.exports.isValidAnswer = (input, output) => {
	const ansArray = input.trim().split('\n').map((d) => (d.slice(0, (d.indexOf('__') + 10) % 10 + 1).match(/\|/g) || []).length);
	const outArray = output.trim().split(/\s+/).map((s) => parseInt(s));
	return ansArray.toString() === outArray.toString();
};
