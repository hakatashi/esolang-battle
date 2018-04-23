/* eslint-env browser */
const Nightmare = require('nightmare');
const assert = require('assert');

module.exports = ({id, code, stdin}) => {
	assert(typeof id === 'string');
	assert(typeof code === 'string');
	assert(typeof stdin === 'string');
	assert(id.match(/^\d+$/));
	assert(code.length < 10000);

	if (process.env.NODE_ENV !== 'production') {
		return Promise.resolve({
			href: 'http://pyth.tryitonline.net/#code=aXoy&input=MTEwMA',
			stdout: '',
		});
	}

	const nightmare = Nightmare({show: false});

	let result = null;

	// Unlambdaのインタプリタがおかしいので特殊処理
	if (id === '115') {
		code += stdin;
		stdin = '';
	}

	return (
		nightmare
			.goto('https://ideone.com/')
			// Wait for the load
			.wait(() => document.readyState === 'complete')
			// Select the language
			.click(`.lang[data-id="${id}"]`)
			// Wait the sample code is inserted automatically
			.wait(
				() => document.querySelector('#insert-loader').style.display === 'none'
			)
			// Show the more option
			.click('.more-options-more')
			.wait('input#syntax')
			// Check if the syntax highlight is eanbled
			.evaluate(() => document.querySelector('input#syntax').checked)
			.then((checked) => {
				if (!checked) {
					return Promise.resolve();
				}

				// Turn off the syntax highlight
				return nightmare.click('input#syntax');
			})
			.then(() => nightmare
			// Empty the code
				.insert('textarea#file')
			// Fill the code
				.insert('textarea#file', code)
			// Show the stdin field
				.click('button#button-input')
				.wait('textarea#input')
			// Empty the stdin
				.insert('textarea#input')
			// Fill the stdin
				.insert('textarea#input', stdin)
			// Submit
				.click('button#Submit')
			// Wait for thepage load
				.wait('pre#output-text')
			// Wait for the timeout
				.wait(5000)
			// Get the result
				.evaluate(() => ({
					href: location.href,
					stdout: document.querySelector('pre#output-text').textContent,
				})))
			.then((values) => {
				result = values;
				// Finish
				return nightmare.end();
			})
			.then(() => result)
	);
};
