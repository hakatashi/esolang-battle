const langsData = require('../langs.json');

const languages = [
	'reversed-c',
	'iwashi',
	'standback',
	'multi-reader',
	'copos-rb',
	'golfish',
	'moo',
	'codemania',
	'bots',
	'floating',
	'picfunge',
	'hanoi_stack',
	'exchangeif',
	'unicue',
];

module.exports = languages
	.map((language) => {
		const langDatum = langsData.find((lang) => lang.slug === language);

		return {
			type: 'language',
			slug: language,
			name: langDatum ? langDatum.name : '',
			link: langDatum ? langDatum.link : '',
		};
	})
	.concat([
		{
			type: 'base',
			team: 0,
		},
		{
			type: 'base',
			team: 1,
		},
		{
			type: 'base',
			team: 2,
		},
		{
			type: 'base',
			team: 3,
		},
		{
			type: 'base',
			team: 4,
		},
	]);
