const ptrace = require('../lib/ptrace.js');
const langs = require('./langs.json');
const {promisify} = require('util');
const fs = require('fs');
const path = require('path');

const traces = new Map();
const times = new Map();

(async () => {
	const files = await promisify(fs.readdir)(process.argv[2]);
	for (const file of files) {
		if (file.endsWith('_hello.log')) {
			const trace = await promisify(fs.readFile)(path.join(process.argv[2], file));
			traces.set(file.split('_').slice(0, -1).join('_'), ptrace.parse(trace.toString()));
		}
		if (file.endsWith('_hello.txt')) {
			const info = await promisify(fs.readFile)(path.join(process.argv[2], file));
			times.set(file.split('_').slice(0, -1).join('_'), parseFloat(info.toString().trim().split(': ')[1]));
		}
	}
	const infos = langs.filter(({name}) => name !== null).map((lang) => ({
		slug: lang.slug,
		execs: traces.get(lang.slug),
		time: times.get(lang.slug),
	}));
	await promisify(fs.writeFile)(path.join(__dirname, 'infos.json'), JSON.stringify(infos, null, '  '));
})();
