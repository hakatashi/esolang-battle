const assert = require('assert');
const flatten = require('lodash/flatten');
const range = require('lodash/range');
const sample = require('lodash/sample');
const shuffle = require('lodash/shuffle');

/*
0: 京都府-兵庫13/大阪10/奈良20/三重12/滋賀4/福井19
1: 愛知県-三重12/岐阜9/長野11/静岡6
2: 栃木県-群馬5/埼玉17/茨城7
3: 山梨県-長野11/静岡6/神奈川22/東京16/埼玉17
4: 滋賀県-京都0/三重12/岐阜9/福井19
5: 群馬県-栃木2/新潟21/長野11/埼玉17
6: 静岡県-愛知1/山梨3/長野11/神奈川22
7: 茨城県(0-base)-栃木2/埼玉17/千葉14
8: 和歌山県-大阪10/奈良20/三重12
9: 岐阜県-愛知1/滋賀4/三重12/福井19/石川18/富山15/長野11
10: 大阪府-兵庫13/京都0/奈良20/和歌山8
11: 長野県-新潟21/群馬5/埼玉17/山梨3/静岡6/愛知1/岐阜9/富山15
12: 三重県-和歌山8/奈良20/京都0/滋賀4/岐阜9/愛知1
13: 兵庫県(1-base)-京都0/大阪10
14: 千葉県-東京16/埼玉17/茨城7
15: 富山県(0-base)-石川18/長野11/岐阜9/新潟21
16: 東京都(1-base)-千葉14/埼玉17/山梨3/神奈川22
17: 埼玉県-栃木2/山梨3/群馬5/茨城7/長野11/千葉14/東京16
18: 石川県-富山15/岐阜9/福井19
19: 福井県-石川18/岐阜9/滋賀4/京都0
20: 奈良県-京都0/和歌山8/大阪10/三重12
21: 新潟県-群馬5/長野11/富山15
22: 神奈川県-山梨3/静岡6/東京16
*/

const edges = [
	[4, 10, 12, 13, 19, 20],
	[6, 9, 11, 12],
	[5, 7, 17],
	[6, 11, 16, 17, 22],
	[0, 9, 12, 19],
	[2, 11, 17, 21],
	[1, 3, 11, 12],
	[2, 14, 17],
	[10, 12, 20],
	[1, 4, 11, 12, 15, 18, 19],
	[0, 8, 13, 20],
	[1, 3, 5, 6, 9, 15, 17, 21],
	[0, 1, 4, 8, 9, 20],
	[0, 10],
	[7, 16, 17],
	[9, 11, 18, 21],
	[3, 14, 17, 22],
	[2, 3, 5, 7, 11, 14, 16],
	[9, 15, 19],
	[0, 4, 9, 18],
	[0, 8, 10, 12],
	[5, 11, 15],
	[3, 6, 16],
];

module.exports.getPrecedingIndices = (cellIndex) => edges[cellIndex];

const numbers = Array(90)
	.fill()
	.map((_, x) => (x + 10).toString());

module.exports.generateInput = () => {
	// input generator
	const nums = shuffle(numbers).filter((_, x) => x < 50);
	const input = `${nums.join('\n')}\n`;
	console.log(input);
	return input;
};

module.exports.isValidAnswer = (input, output) => {
	if (process.env.NODE_ENV !== 'production') {
		return true;
	}

	const lines = input.split('\n').filter((line) => line.length > 0);

	assert(lines.length === 50);

	let minValue = parseInt(lines[0]) + 1;
	let cnt = '';

	for (const line of lines) {
		const val = parseInt(line);
		if (val < minValue) {
			minValue = val;
			cnt += '1';
		} else {
			cnt += '0';
		}
	}

	const correctOutput = cnt;

	const trimmedOutput = output.toString().replace(/\s/g, '');

	console.log('info:', {input, correctOutput, output, trimmedOutput});

	return trimmedOutput === correctOutput;
};
