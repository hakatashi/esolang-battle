const langsData = require('../langs.json');

const languages = [
	'node',
	'Hoge Fuga Fugo Piyopiyo',
	'piyo',
	'foo',
	'bar',
	'poo',
	'piyo',
	'foo',
	'bar',
	'poo',
];

module.exports = languages.map((language) => {
	const langDatum = langsData.find((lang) => lang.slug === language);

	return {
		type: 'language',
		slug: language,
		name: language, // langDatum ? langDatum.name : '',
		link: language, // langDatum ? langDatum.link : '',
	};
}).concat([
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
