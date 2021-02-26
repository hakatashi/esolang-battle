const assert = require('assert');
const langsData = require('../langs.json');

const languages = {
   // Row 1 Begin
	3: 'abc',
	4: 'vlang',
	5: 'fernando',
	6: null, // 'base'
	7: 'aheui',
	8: 'nadesiko',
        9: 'picfunge',
   // Row 1 End
   // Row 2 Begin
	15: 'perl1',
	16: 'snobol',
	17: 'cubically',
	18: 'ballerina',
	19: 'asciidots',
	20: 'matl',
	21: 'wren',
	22: 'backhand',
   // Row 2 End
   // Row 3 Begin
	28: 'whitespace',
	29: 'transceternal',
	30: 'golfish',
	31: 'element',
	32: 'imagemagick',
	33: 'powershell',
	34: 'node',
	35: 'stuck',
	36: 'v-vim',
   // Row 3 End
   // Row 4 Begin
	40: 'seclusion',
	41: 'coq',
	42: 'tcl',
	43: 'starry',
	44: 'erlang',
	45: 'osecpu',
	46: 'dis',
	47: 'gnuplot',
	48: 'wat',
	49: 'functional',
   // Row 4 End
   // Row 5 Begin
	53: 'egison',
	54: 'llvm-ir',
	55: 'wysiscript',
	56: 'racket',
	57: 'elixir',
	58: 'd-gdc',
	59: 'awk',
	60: 'haskell',
	61: 'xslt',
	62: 'olang',
	63: 'snowman',
   // Row 5 End
   // Row 6 Begin
	65: 'befunge98',
	66: 'classic-music-theory',
	67: 'make',
	68: 'vim',
	69: null, // 'base'
	70: 'python3',
	71: 'csharp-dotnet',
	72: null, // 'base'
	73: 'kotlin',
	74: 'bash-pure',
	75: 'pure-folders',
	76: 'hack',
   // Row 6 End
   // Row 7 Begin
	78: 'tetris',
	79: 'php',
	80: 'goruby',
	81: 'cpp-compile-time-clang',
	82: 'cjam',
	83: 'java',
        84: 'brainfuck-esotope',
	85: 'perl',
	86: 'jelly',
	87: 'fortran',
	88: 'fish',
	89: 'streem',
	90: 'simula',
   // Row 7 End
   // Row 8 Begin
	91: 'htms',
	92: 'husk',
	93: 'zsh-pure',
	94: 'bibtex',
	95: 'rust',
	96: 'ruby',
	97: 'golang',
	98: 'c-gcc',
	99: 'crystal',
	100: 'evil',
	101: 'wenyan',
	102: 'streem',
   // Row 8 End
   // Row 9 Begin
	105: 'irc',
	106: 'piet',
	107: 'compile-time-typescript',
	108: 'zig',
	109: 'golfscript',
	110: null, // 'base'
	111: 'sed',
	112: 'tex',
	113: 'apache2-rewrite',
	114: 'ring',
	115: 'jellyfish',
   // Row 9 End
   // Row 10 Begin
	118: null, // 'base'
	119: 'rescript',
	120: '05ab1e',
	121: 'm4',
	122: 'swift',
	123: 'fsharp-dotnet',
	124: 'exchangeif',
	125: 'bash-busybox',
	126: 'mines',
	127: null, // 'base'
   // Row 10 End
   // Row 11 Begin
	132: 'arcyou',
	133: 'braintwist',
	134: 'gs2',
	135: 'ed',
	136: 'emojicode',
	137: 'octave',
	138: 'cy',
	139: 'moo',
	140: 'spl',
   // Row 11 End
   // Row 12 Begin
	145: 'js-rhino',
	146: 'cobol',
	147: 'hanoi_stack',
	148: 'sqlite3',
	149: 'wake',
	150: 'bots',
	151: 'lua',
	152: 'verilog',
   // Row 12 End
   // Row 13 Begin
	159: 'apl',
	160: 'ruby0.49',
	161: 'pxem',
	162: 'serenity',
	163: 'perl6',
	164: 'rail',
	165: 'cubix',
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
