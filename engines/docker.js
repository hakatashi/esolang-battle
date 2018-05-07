/* eslint-env browser */
const Docker = require('dockerode');
const assert = require('assert');
const concatStream = require('concat-stream');
const Promise = require('bluebird');
const path = require('path');
const tmp = require('tmp');
const shellescape = require('shell-escape');
const {getCodeLimit} = require('../controllers/utils.js');
const fs = Promise.promisifyAll(require('fs'));

const docker = new Docker();

const memoryLimit = 512 * 1024 * 1024;

class MemoryLimitExceededError extends Error {
	constructor(...args) {
		super(...args);
		this.name = 'MemoryLimitExceededError';
	}
}

module.exports = async ({id, code, stdin}) => {
	assert(typeof id === 'string');
	assert(Buffer.isBuffer(code));
	assert(typeof stdin === 'string');
	assert(code.length <= getCodeLimit(id));
	assert(stdin.length < 10000);

	const {tmpPath, cleanup} = await new Promise((resolve, reject) => {
		tmp.dir({unsafeCleanup: true}, (error, dTmpPath, dCleanup) => {
			if (error) {
				reject(error);
			} else {
				resolve({tmpPath: dTmpPath, cleanup: dCleanup});
			}
		});
	});

	const stdinPath = path.join(tmpPath, 'INPUT');

	let filename = 'CODE';
	if (id === 'd-dmd') {
		filename = 'CODE.d';
	} else if (id === 'c-gcc') {
		filename = 'CODE.c';
	} else if (id === 'concise-folders' || id === 'pure-folders') {
		filename = 'CODE.tar';
	} else if (id === 'cmd') {
		filename = 'CODE.bat';
	} else if (id === 'nadesiko') {
		filename = 'CODE.nako3';
	}

	const codePath = path.join(tmpPath, filename);

	await Promise.all([
		fs.writeFileAsync(stdinPath, stdin),
		fs.writeFileAsync(codePath, code),
	]);

	let container = null;

	try {
		// eslint-disable-next-line init-declarations
		let stderrWriter, stdoutWriter;

		const stdoutPromise = new Promise((resolve) => {
			stdoutWriter = concatStream((stdout) => {
				resolve(stdout);
			});
		});

		const stderrPromise = new Promise((resolve) => {
			stderrWriter = concatStream((stderr) => {
				resolve(stderr);
			});
		});

		const dockerVolumePath = (() => {
			if (path.sep === '\\') {
				return tmpPath.replace('C:\\', '/c/').replace(/\\/g, '/');
			}

			return tmpPath;
		})();

		const containerPromise = (async () => {
			container = await docker.createContainer({
				Hostname: '',
				User: '',
				AttachStdin: false,
				AttachStdout: true,
				AttachStderr: true,
				Tty: false,
				OpenStdin: false,
				StdinOnce: false,
				Env: null,
				Cmd: [
					'sh',
					'-c',
					`${shellescape(['script', `/volume/${filename}`])} < /volume/INPUT`,
				],
				Image: `esolang/${id}`,
				Volumes: {
					'/volume': {},
				},
				VolumesFrom: [],
				HostConfig: {
					Binds: [`${dockerVolumePath}:/volume:ro`],
					Memory: memoryLimit,
				},
			});

			const stream = await container.attach({
				stream: true,
				stdout: true,
				stderr: true,
			});

			container.modem.demuxStream(stream, stdoutWriter, stderrWriter);
			stream.on('end', () => {
				stdoutWriter.end();
				stderrWriter.end();
			});

			await container.start();
			await container.wait();
			const data = await container.inspect();
			await container.remove();
			return data;
		})();

		const runner = Promise.all([
			stdoutPromise,
			stderrPromise,
			containerPromise,
		]);

		const executionStart = Date.now();
		const [stdout, stderr, containerData] = await runner.timeout(10000);
		const executionEnd = Date.now();

		cleanup();

		return {
			stdout: Buffer.isBuffer(stdout) ? stdout : Buffer.alloc(0),
			stderr: Buffer.isBuffer(stderr) ? stderr : Buffer.alloc(0),
			duration: executionEnd - executionStart,
			...(containerData.State.OOMKilled
				? {
					error: new MemoryLimitExceededError(
						`Memory limit of ${memoryLimit} bytes exceeded`
					),
				  }
				: {}),
		};
	} catch (error) {
		if (container) {
			await container.kill().catch((e) => {
				console.error('error:', e);
			});
			await container.remove().catch((e) => {
				console.error('error:', e);
			});
		}
		throw error;
	}
};
