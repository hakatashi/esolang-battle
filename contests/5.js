const assert = require('assert');
const shuffle = require('array-shuffle');
const math = require('mathjs');
const chunk = require('lodash/chunk');
const random = require('lodash/random');

const printableRegex = /[a-z0-9!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-]/ig;

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
	const tokyoX = random(10, 49);
	const kyotoX = random(0, tokyoX - 3);
	const height = random(3, 50);

	const lines = Array(height).fill(' '.repeat(50));

	lines[0] = Array(50).fill().map((_, i) => i === tokyoX ? 'T' : ' ').join('');
	lines[height - 1] = Array(50).fill().map((_, i) => i === kyotoX ? 'K' : ' ').join('');

	return lines.join('\n') + '\n';
};

module.exports.isValidAnswer = (input, output) => {
	if (process.env.NODE_ENV !== 'production') {
		// return true;
	}

	const inputLines = input.split('\n').filter((line) => line);
	const tokyoX = inputLines[0].indexOf('T');
	const kyotoX = inputLines[inputLines.length - 1].indexOf('K');

	const outputLines = output.toString().split('\n');
	for (const [index, line] of outputLines.entries()) {
		if (line.slice(50).match(/\S/)) {
			console.log(`info: line ${index} exceeds permit output range`);
			return false;
		}
		if (index >= inputLines.length && line.match(/\S/)) {
			console.log(`info: line ${index} exceeds permit output range`);
			return false;
		}
	}

	const normalizedOutputLines = Array(inputLines.length).fill().map((_, i) => (
		((outputLines[i] || '') + ' '.repeat(50)).slice(0, 50)
	));

	const printableCounts = normalizedOutputLines.join('').match(printableRegex).length;
	if (printableCounts > Math.abs(tokyoX - kyotoX) + inputLines.length) {
		console.log(`info: printable character counts ${printableCounts} exceeds limit`);
		return false;
	}

	if (!normalizedOutputLines[0][tokyoX].match(printableRegex)) {
		console.log('info: start point is not reachable');
		return false;
	}

	const visited = new Set();
	const queue = [];
	let isReachable = false;

	visited.add(tokyoX);
	queue.push({x: tokyoX, y: 0});

	const isPrintable = (x, y) => (
		normalizedOutputLines[y][x].match(printableRegex)
	);

	while (queue.length > 0) {
		const {x, y} = queue.pop();
		console.log({x, y});
		if (x === kyotoX && y === inputLines.length - 1) {
			isReachable = true;
			break;
		}
		if (x - 1 >= 0 && !visited.has(y * 50 + x - 1) && isPrintable(x - 1, y)) {
			visited.add(y * 50 + x - 1);
			queue.push({x: x - 1, y});
		}
		if (x + 1 <= 49 && !visited.has(y * 50 + x + 1) && isPrintable(x + 1, y)) {
			visited.add(y * 50 + x + 1);
			queue.push({x: x + 1, y});
		}
		if (y - 1 >= 0 && !visited.has((y - 1) * 50 + x) && isPrintable(x, y - 1)) {
			visited.add((y - 1) * 50 + x);
			queue.push({x, y: y - 1});
		}
		if (y + 1 < inputLines.length && !visited.has((y + 1) * 50 + x) && isPrintable(x, y + 1)) {
			visited.add((y + 1) * 50 + x);
			queue.push({x, y: y + 1});
		}
	}

	if (!isReachable) {
		console.log('info: kyoto is unreachable');
		return false;
	}

	console.log('info:', {input, output});

	return true;
};
