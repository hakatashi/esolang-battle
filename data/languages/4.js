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
	13: 'unlambda',
	14: 'powershell',
	15: 'nadesiko',
	16: 'ruby0.49',
	17: 'alice',
	18: 'gs2',
	19: 'whitespace',
	20: 'i4004asm',
	21: 'java',
	22: 'ocaml',
	23: 'crystal',
	24: 'cy',
	25: 'kotlin',
	26: 'braille',
	27: 'vim',
	28: 'element',
	29: 'wierd',
	30: 'cubix',
	31: 'make',
	32: 'function2d',
	33: 'labyrinth',
	34: 'z80',
	35: 'swift',
	36: 'convex',
	37: 'stuck',
	38: 'fish',
	39: 'bash-busybox',
	40: 'cmd',
	41: 'lua',
	42: 'verilog',
	43: 'zucchini',
	44: 'doubleplusungood',
	45: 'jq',
	46: 'japt',
	47: 'snowman',
	48: 'taxi',
	49: 'emojicode',
	50: 'grass',
	51: 'htms',
	52: 'sceql',
	53: 'adjust',
	54: 'stop',
	55: 'brainfuck-bfi',
	56: 'rprogn',
	57: 'wordcpu',
	58: 'rail',
	59: 'typhon',
	60: 'dis',
	61: 'aheui',
	62: 'apl',
	63: 'asciidots',
	64: 'wake',
	65: 'minus',
	66: 'sqlite3',
	67: 'maybelater',
	68: 'minimal2d',
	69: 'slashes',
	70: 'width',
	71: 'floater',
	72: 'simula',
	73: 'malbolge',
	74: 'suzy',
	75: 'path',
	76: 'seed',
	77: 'aubergine',
	78: 'beam',
	79: 'goruby',
	80: 'wat',
	81: 'x86asm-nasm',
	82: 'llvm-ir',
	83: 'brainfuck-esotope',
	84: 'fernando',
	85: 'blc',
	86: 'piet',
	87: 'pure-folders',
	88: 'stackcats',
	89: 'fugue',
	90: 'lazyk',
	91: 'befunge98',
};

module.exports = Array(92)
	.fill()
	.map((_, index) => {
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
			link: langDatum ? langDatum.link : '',
		};
	});
