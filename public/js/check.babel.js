import '@babel/polyfill';

require('garlicjs');
const api = require('./api.js');

const checkerEl = document.getElementById('checker');
const languageEl = checkerEl.querySelector('.checker-language');
const codeEl = checkerEl.querySelector('.checker-code');
const fileEl = checkerEl.querySelector('.checker-file');
const countEl = checkerEl.querySelector('.checker-count');
const stdinEl = checkerEl.querySelector('.checker-stdin');
const stdoutEl = checkerEl.querySelector('.checker-stdout');
const stderrEl = checkerEl.querySelector('.checker-stderr');
const submitEl = checkerEl.querySelector('.checker-submit');
const alertEl = checkerEl.querySelector('.checker-alert');

const contestId = document
	.querySelector('meta[name=contest-id]')
	.getAttribute('content');

const onSubmit = async () => {
	if (submitEl.disabled) {
		return;
	}

	submitEl.disabled = true;
	alertEl.style.display = 'none';

	const result = await api('POST', `/contests/${contestId}/execution`, {
		language: languageEl.value,
		input: stdinEl.value,
		...(fileEl.files.length > 0
			? {file: fileEl.files[0]}
			: {code: codeEl.value}),
	});

	if (result.error) {
		alertEl.style.display = 'block';
		alertEl.textContent = result.error;
		stdoutEl.value = '';
		stderrEl.value = '';
	} else {
		stdoutEl.value = result.stdout;
		stderrEl.value = result.stderr;
	}

	submitEl.disabled = false;
};

submitEl.addEventListener('click', onSubmit);

for (const eventName of ['input', 'focus', 'paste']) {
	codeEl.addEventListener(eventName, () => {
		countEl.textContent = new TextEncoder().encode(codeEl.value).length;
	});
}

fileEl.addEventListener('change', () => {
	if (fileEl.files.length > 0) {
		codeEl.disabled = true;
	} else {
		codeEl.disabled = false;
	}
});

window.addEventListener('keydown', (event) => {
	if (event.key === 'Enter' && event.ctrlKey) {
		onSubmit();
	}
});
