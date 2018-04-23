const request = require('request');
const assert = require('assert');
const qs = require('querystring');

module.exports = ({id, code, stdin}) => {
	assert(typeof id === 'string');
	assert(typeof code === 'string');
	assert(typeof stdin === 'string');
	assert(id.match(/^[\w-]+$/));
	assert(code.length < 10000);

	const url = `http://${id}.tryitonline.net/cgi-bin/backend`;

	if (process.env.NODE_ENV !== 'production') {
		return Promise.resolve({
			href: 'http://pyth.tryitonline.net/#code=aXoy&input=MTEwMA',
			stdout: '',
		});
	}

	return new Promise((resolve, reject) => {
		request.post(
			{
				url,
				headers: {
					'Content-Type': 'text/plain;charset=UTF-8',
				},
				body: qs.encode({
					code,
					input: stdin,
				}),
				timeout: 5000,
			},
			(error, response, body) => {
				if (error) {
					return reject(error);
				}

				if (response.statusCode !== 200) {
					return reject();
				}

				const href = `http://${id}.tryitonline.net/#${qs.encode({
					code: Buffer.from(code).toString('base64'),
					input: Buffer.from(stdin).toString('base64'),
				})}`;

				const stdout = body.toString().replace(/.+?\n/, '');

				resolve({href, stdout});
			}
		);
	});
};
