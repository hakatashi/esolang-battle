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

const contestId = document.querySelector('meta[name=contest-id]').getAttribute('content');

submitEl.addEventListener('click', () => {
	if (submitEl.disabled) {
		return;
	}

	submitEl.disabled = true;

	// api('POST', `/contests/${contestId}/execution`);
});

codeEl.addEventListener('input', () => {
	countEl.textContent = Buffer.from(codeEl.value).length;
});

fileEl.addEventListener('change', () => {
	if (fileEl.files.length > 0) {
		codeEl.disabled = true;
	} else {
		codeEl.disabled = false;
	}
});
