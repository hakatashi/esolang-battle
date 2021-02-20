/* eslint-env browser */

const assert = require('assert');
const path = require('path');
const Promise = require('bluebird');
const concatStream = require('concat-stream');
const Docker = require('dockerode');
const shellescape = require('shell-escape');
const tmp = require('tmp');
const fs = Promise.promisifyAll(require('fs'));
const {getCodeLimit, getTimeLimit} = require('../controllers/utils.js');
const langInfos = require('../data/infos.json');

const docker = new Docker();

const memoryLimit = 512 * 1024 * 1024;

class MemoryLimitExceededError extends Error {
	constructor(...args) {
		super(...args);
		this.name = 'MemoryLimitExceededError';
	}
}

module.exports = async ({
	id,
	code,
	stdin,
	trace: traceOption,
	disasm = false,
}) => {
	assert(typeof id === 'string');
	assert(Buffer.isBuffer(code));
	assert(typeof stdin === 'string');
	assert(code.length <= getCodeLimit(id));
	assert(stdin.length < 10000);

	const langInfo = langInfos.find(({slug}) => slug === id);
	const trace = traceOption && langInfo && langInfo.time && langInfo.time <= 10;

	const {tmpPath, cleanup} = await new Promise((resolve, reject) => {
		//tmp.dir({tmpdir: "/home/mizunomidori/", unsafeCleanup: true}, (error, dTmpPath, dCleanup) => {
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
				Env: trace === true ? ['STRACE_OUTPUT_PATH=/volume/strace.log'] : null,
				Cmd: [
					'sh',
					'-c',
					`${shellescape([
						'script',
						...(disasm ? ['-d'] : []),
						`/volume/${filename}`,
					])} < /volume/INPUT`,
				],
				Image: `esolang/${id}`,
				Volumes: {
					'/volume': {},
				},
				VolumesFrom: [],
				HostConfig: {
                                   // TODO Add config
					Binds: [
						//`${dockerVolumePath}:/volume:${trace === true ? 'rw' : 'ro'}`,
						`${dockerVolumePath}:/volume:rw`,
                                        ],
					Memory: memoryLimit,
					...(trace === true ? {CapAdd: ['SYS_PTRACE']} : {}),
				},
                                NetworkDisabled: true,
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
		const [stdout, stderr, containerData] = await runner.timeout(
			getTimeLimit(id),
		);
		const executionEnd = Date.now();

		const tracePath = path.join(tmpPath, 'strace.log');
		const traceLog = trace && (await fs.readFileAsync(tracePath));

		cleanup();

		return {
			stdout: Buffer.isBuffer(stdout) ? stdout : Buffer.alloc(0),
			stderr: Buffer.isBuffer(stderr) ? stderr : Buffer.alloc(0),
			duration: executionEnd - executionStart,
			...(containerData.State.OOMKilled
				? {
					error: new MemoryLimitExceededError(
						`Memory limit of ${memoryLimit} bytes exceeded`,
					),
				  }
				: {}),
			trace: trace ? traceLog : null,
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
