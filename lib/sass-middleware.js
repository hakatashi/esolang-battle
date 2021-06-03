const fs = require('fs');
const path = require('path');
const sass = require('sass');

const cache = new Map();

module.exports = async function renderSass(req, res, next) {
	if (!req.path.endsWith('.css')) {
		return next();
	}

	const file = path.join(process.cwd(), 'public', req.path).replace('.css', '.scss');
	if (!fs.existsSync(file)) {
		return res.status(404).end();
	}

	if (!cache.has(req.path)) {
		const data = sass.renderSync({
			file,
			includePaths: [path.join(process.cwd(), 'node_modules')],
			outputStyle: process.env.NODE_ENV === 'production' ? 'compressed' : 'expanded',
		});

		cache.set(req.path, data);

		fs.watchFile(file, () => {
			cache.delete(req.path);
			fs.unwatchFile(file);
		});
	}

	res.header('content-type', 'text/css');
	res.send(cache.get(req.path).css.toString());
};
