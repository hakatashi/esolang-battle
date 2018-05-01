const qs = require('querystring');

module.exports = async (method, endpoint, params = {}) => {
	const url = `/api${endpoint}`;

	if (method === 'GET') {
		const res = await fetch(`${url}?${qs.encode(params)}`, {
			method: 'GET',
			credentials: 'include',
		});
		return res.json();
	} else if (method === 'POST') {
		const csrfToken = document
			.querySelector('meta[name=csrf-token]')
			.getAttribute('content');

		const form = new FormData();
		for (const param of Object.keys(params)) {
			const value = params[param];

			if (value instanceof HTMLInputElement) {
				form.append(param, value.files[0]);
			} else {
				form.append(param, value);
			}
		}

		form.append('_csrf', csrfToken);

		const res = await fetch(url, {
			method: 'POST',
			body: form,
			credentials: 'include',
		});
		return res.json();
	}

	return Promise.reject(new Error('method unknown'));
};
