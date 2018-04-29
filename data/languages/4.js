const langsData = require('../langs.json');

const languages = {
	0: '',
	1: 'ruby',
	2: 'c-gcc',
	3: 'perl',
	4: 'golfscript',
	5: 'node',
	6: 'rust',
	7: 'd-dmd',
	8: '',
	9: 'python3',
	10: '',
	11: 'php',
	12: 'csharp',
	13: 'fish',
	14: '',
	15: '',
	16: '',
	17: '',
	18: '',
	19: 'convex',
	20: 'gs2',
	21: 'java',
	22: 'ocaml',
	23: 'crystal',
	24: 'cy',
	25: 'kotlin',
	26: '',
	27: '',
	28: '',
	29: '',
	30: '',
	31: '',
	32: '',
	33: '',
	34: '',
	35: '',
	36: '',
	37: '',
	38: '',
	39: 'cjam',
	40: '',
	41: '',
	42: '',
	43: '',
	44: '',
	45: '',
	46: '',
	47: '',
	48: '',
	49: '',
	50: '',
	51: '',
	52: '',
	53: '',
	54: '',
	55: '',
	56: '',
	57: '',
	58: '',
	59: '',
	60: '',
	61: '',
	62: '',
	63: '',
	64: '',
	65: '',
	66: '',
	67: '',
	68: '',
	69: '',
	70: '',
	71: '',
	72: '',
	73: 'malbolge',
	74: '',
	75: '',
	76: '',
	77: '',
	78: '',
	79: '',
	80: 'wat',
	81: 'x86asm-nasm',
	82: 'llvm-ir',
	83: '',
	84: '',
	85: '',
	86: '',
	87: '',
	88: 'stackcats',
	89: '',
	90: 'lazyk',
	91: 'pure-folders',
};

module.exports = Array(92).fill().map((_, index) => {
	if (index === 0) {
		return {
			type: 'base',
			team: 0,
		};
	}

	if (index === 8) {
		return {
			type: 'base',
			team: 1,
		};
	}

	if (index === 10) {
		return {
			type: 'base',
			team: 2,
		};
	}

	const langDatum = langsData.find((lang) => lang.slug === languages[index]);

	return {
		type: 'language',
		slug: languages[index],
		name: langDatum ? langDatum.name : '',
	};
});
