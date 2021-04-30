const langsData = require('../langs.json');

const languages = {
	0: 'c-gcc',
	1: 'c-gcc',
	2: 'c-gcc',
	3: 'c-gcc',
	4: 'c-gcc',
	5: 'c-gcc',
	6: 'c-gcc',
	7: 'c-gcc',
	8: 'c-gcc',
	9: 'c-gcc',
	10: 'c-gcc',
	11: 'c-gcc',
	12: 'c-gcc',
	13: 'c-gcc',
	14: 'c-gcc',
	15: 'c-gcc',
	16: 'c-gcc',
	17: 'c-gcc',
	18: 'c-gcc',
	19: 'c-gcc',
	20: 'c-gcc',
	21: 'c-gcc',
	22: 'c-gcc',
	23: 'c-gcc',
	24: 'c-gcc',
	25: 'c-gcc',
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
