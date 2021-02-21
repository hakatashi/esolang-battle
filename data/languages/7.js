const assert = require('assert');
const langsData = require('../langs.json');

const languages = {
   // Row 1 Begin
	3: 'lazyk',
	4: 'dis',
	5: 'functional',
	6: null, // 'base'
	7: 'snowman',
	8: 'hexagony',
        9: 'spl',
   // Row 1 End
   // Row 2 Begin
	15: 'hypertorus',
	16: 'pyramid-scheme',
	17: 'cobol',
	18: 'gnuplot',
	19: 'v-vim',
	20: 'transceternal',
	21: 'braintwist',
	22: 'alphabeta',
   // Row 2 End
   // Row 3 Begin
	28: 'racket',
	29: 'wysiscript',
	30: 'abc',
	31: 'wat',
	32: 'clisp-sbcl',
	33: '2sable',
	34: 'oh',
	35: 'husk',
	36: 'produire',
   // Row 3 End
   // Row 4 Begin
	40: 'reasonml',
	41: 'unlambda',
	42: 'goruby',
	43: 'element',
	44: 'simula',
	45: 'rail',
	46: 'qlb',
	47: 'mines',
	48: 'vlang',
	49: 'osecpu-aska',
   // Row 4 End
   // Row 5 Begin
	53: 'cpp-compile-time-clang', // TODO
	54: 'cpp-clang',
	55: 'piet',
	56: 'golfish',
	57: 'tetris',
	58: 'php',
	59: 'd-gdc',
	60: 'perl',
	61: 'lua',
	62: 'classic-music-theory',
	63: 'backhand',
   // Row 5 End
   // Row 6 Begin
	65: 'bubble-sort',
	66: 'starry',
	67: 'elixir',
	68: 'vim',
	69: null, // 'base'
	70: 'ruby',
	71: 'c-gcc',
	72: null, // 'base'
	73: 'haskell',
	74: 'bash-pure',
	75: 'brainfuck-esotope',
	76: 'coq',
   // Row 6 End
   // Row 7 Begin
	78: 'fish',
	79: 'stuck',
	80: 'fsharp-dotnet',
	81: 'rust',
	82: 'python3',
	83: 'node',
	84: 'kotlin',
	85: 'erlang',
	86: 'csharp-dotnet',
	87: 'grass',
	88: 'serenity',
	89: 'whitespace',
	90: 'function2d',
   // Row 7 End
   // Row 8 Begin
	91: 'jelly',
	92: 'wren',
	93: 'bash-busybox',
	94: 'powershell',
	95: 'cjam',
	96: 'golang',
	97: 'swift',
	98: 'octave',
	99: 'bots',
	100: 'emojicode',
	101: 'fish-shell-pure',
	102: 'calc',
   // Row 8 End
   // Row 9 Begin
	105: 'verilog',
	106: 'awk',
	107: 'ballerina',
	108: 'ring',
	109: 'jq',
	110: null, // 'base'
	111: 'python2',
	112: 'sqlite3',
	113: 'xslt',
	114: 'gs2',
	115: 'fernando',
   // Row 9 End
   // Row 10 Begin
	118: null, // 'base'
	119: 'hanoi_stack',
	120: 'tex',
	121: 'r',
	122: 'sed',
	123: 'moo',
	124: 'standback',
	125: 'iwashi',
	126: 'apl',
	127: null, // 'base'
   // Row 10 End
   // Row 11 Begin
	131: 'irc',
	132: 'cubically',
	133: 'wenyan',
	134: 'cyclicbrainfuck',
	135: 'olang',
	136: 'fish-shell-pure',
	137: 'make',
	138: 'befunge98',
	139: 'nadesiko',
	140: 'llvm-ir',
   // Row 11 End
   // Row 12 Begin
	145: 'golfscript',
	146: 'z80',
	147: 'pxem',
	148: 'osecpu',
	149: 'pure-folders',
	150: 'egison',
	151: 'encapsulation',
	152: 'tcl',
   // Row 12 End
   // Row 13 Begin
	159: 'ocaml',
	160: 'perl6',
	161: 'ruby0.49',
	162: 'seclusion',
	163: 'wake',
	164: 'multi-reader',
	165: 'fugue',
   // Row 13 End
};

const WIDTH = 13;
const HEIGHT = 15;
module.exports = Array(WIDTH * HEIGHT)
	.fill()
	.map((_, index) => {
		if (index === 69) {
			return {
				type: 'base',
				team: 0,
			};
		}

		if (index === 72) {
			return {
				type: 'base',
				team: 1,
			};
		}

		if (index === 110) {
			return {
				type: 'base',
				team: 2,
			};
		}
                if (index == 127) { //if (index == 90 || index == 165) {
			return {
				type: 'base',
				team: 0,
			};
                }
		if (index == 118) {// if (index === 159 || index == 78 ) {
			return {
				type: 'base',
				team: 1,
			};
		}
		if (index == 6) { //if (index  === 3 || index == 9) {
			return {
				type: 'base',
				team: 2,
			};
		}

		if (languages[index] === null || languages[index] === undefined) {
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
