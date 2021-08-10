const assert = require('assert');
const langsData = require('../langs.json');

const languages = {
	0: null,
	1: null,
	2: null,
	3: null,
	4: null,
	5: null,
	6: null,
	7: null,
	8: null,
	9: null,
	10: null,
	11: null,
	12: null,
	13: 'snowman',
	14: 'hexagony',
	15: 'hypertorus',
	16: 'pyramid-scheme',
	17: 'cobol',
	18: 'gnuplot',
	19: null,
	20: null,
	21: null,
	22: null,
	23: null,
	24: 'alphabeta',
	25: 'braintwist',
	26: 'v-vim',
	27: 'transceternal',
	28: 'racket',
	29: 'wysiscript',
	30: 'abc',
	31: null,
	32: null,
	33: null,
	34: 'oh',
	35: 'husk',
	36: 'produire',
	37: 'olang',
	38: 'golfscript',
	39: 'make',
	40: 'reasonml',
	41: 'unlambda',
	42: null,
	43: null,
	44: null,
	45: 'rail',
	46: 'qlb',
	47: 'mines',
	48: 'vlang',
	49: null,
	50: 'egison',
	51: 'tex',
	52: 'pure-folders',
	53: 'cpp-compile-time-clang',
	54: null,
	55: 'piet',
	56: 'golfish',
	57: 'tetris',
	58: 'php',
	59: 'd-gdc',
	60: 'perl',
	61: 'lua',
	62: 'classic-music-theory',
	63: 'backhand',
	64: 'pxem',
	65: null,
	66: 'starry',
	67: 'bubble-sort',
	68: 'vim',
	69: 'node',
	70: 'ruby',
	71: 'c-gcc',
	72: 'golang',
	73: 'haskell',
	74: 'bash-pure',
	75: 'brainfuck-esotope',
	76: 'coq',
	77: 'z80',
	78: 'fish',
	79: 'stuck',
	80: null,
	81: 'rust',
	82: 'python3',
	83: null,
	84: 'japt',
	85: 'erlang',
	86: 'fortran',
	87: null,
	88: null,
	89: 'whitespace',
	90: 'function2d',
	91: 'jelly',
	92: 'wren',
	93: 'bash-busybox',
	94: 'powershell',
	95: 'cjam',
	96: 'bots',
	97: 'ring',
	98: null,
	99: null,
	100: 'emojicode',
	101: 'fish-shell-pure',
	102: 'calc',
	103: 'wenyan',
	104: 'cyclicbrainfuck',
	105: 'verilog',
	106: 'awk',
	107: 'ballerina',
	108: null,
	109: null,
	110: null,
	111: null,
	112: 'sqlite3',
	113: 'xslt',
	114: 'gs2',
	115: 'fernando',
	116: 'jq',
	117: 'fugue',
	118: 'hanoi_stack',
	119: null,
	120: null,
	121: null,
	122: null,
	123: 'moo',
	124: 'standback',
	125: 'iwashi',
	126: 'apl',
	127: 'cubically',
	128: 'irc',
	129: null,
	130: null,
	131: null,
	132: null,
	133: null,
	134: null,
	135: null,
	136: null,
	137: null,
	138: null,
	139: null,
	140: null,
	141: null,
	142: null,
};

const WIDTH = 11;
const HEIGHT = 13;
module.exports = Array(WIDTH * HEIGHT)
	.fill()
	.map((_, index) => {
		if (index === 49) {
			return {
				type: 'base',
				team: 0,
			};
		}

		if (index === 80) {
			return {
				type: 'base',
				team: 1,
			};
		}

		if (index === 83) {
			return {
				type: 'base',
				team: 2,
			};
		}
                if (index >= 123 && index <= 128) {
			return {
				type: 'base',
				team: 0,
			};
                }
		if (index === 18 || index === 30 || index == 41 || index === 53 || index === 64 || index == 76 ) {
			return {
				type: 'base',
				team: 1,
			};
		}
		if (index  === 45 || index === 13 || index === 24 || index === 34 || index === 55 || index == 66) {
			return {
				type: 'base',
				team: 2,
			};
		}

		if (languages[index] === null) {
			return null;
		}

		const langDatum = langsData.find((lang) => lang.slug === languages[index]);
		assert(langDatum, languages[index]);

		return {
			type: 'language',
			slug: languages[index],
			name: langDatum.name,
			link: langDatum.link,
		};
	});
