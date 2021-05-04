const langsData = require('../langs.json');

const languages = {
	// squares
	0: '',
	1: 'ppap',
	2: 'aheui',
	3: 'cpp-compile-time-clang',
	4: 'tex',
	5: '',
	6: '',
	7: 'bash-busybox',
	8: 'compile-time-typescript',
	9: 'jq',
	10: 'ocaml',
	11: '',

	// hexagons
	12: 'perl',
	13: 'befunge98',
	14: 'fernando',
	15: 'starry',
	16: 'produire',
	17: 'php',
	18: 'fish',
	19: 'mao',

	// octagons
	20: 'whitespace',
	21: 'node',
	22: 'c-gcc',
	23: 'python3',
	24: 'ruby',
	25: 'brainfuck-esotope',
};

module.exports = Array(26)
	.fill()
	.map((_, index) => {
		if (index === 0 || index === 11) {
			return {
				type: 'base',
				team: 0,
			};
		}

		if (index === 5 || index === 6) {
			return {
				type: 'base',
				team: 1,
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
