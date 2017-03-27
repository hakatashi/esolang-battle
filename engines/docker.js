/* eslint-env browser */
const Docker = require('dockerode');
const assert = require('assert');
const concatStream = require('concat-stream');
const Promise = require('bluebird');
const path = require('path');
const tmp = require('tmp');
const shellescape = require('shell-escape');
const fs = Promise.promisifyAll(require('fs'));

const docker = new Docker();

module.exports = ({ id, code, stdin }) => {
  assert(typeof id === 'string');
  assert(Buffer.isBuffer(code));
  assert(typeof stdin === 'string');
  assert(code.length < 10000);
  assert(stdin.length < 10000);

  return new Promise((resolve, reject) => {
    tmp.dir({ unsafeCleanup: true }, (error, tmpPath, cleanup) => {
      if (error) {
        reject(error);
      } else {
        resolve({ tmpPath, cleanup });
      }
    });
  }).then((info) => {
    const { tmpPath, cleanup } = info;
    const stdinPath = path.join(tmpPath, 'INPUT');
    const codePath = path.join(tmpPath, id === 'c-gcc' ? 'CODE.c' : 'CODE');

    return Promise.all([
      fs.writeFileAsync(stdinPath, stdin),
      fs.writeFileAsync(codePath, code),
    ]).then(() => {
      let stdoutWriter;

      const stdoutPromise = new Promise((resolve) => {
        stdoutWriter = concatStream((stdout) => {
          resolve(stdout);
        });
      });

      let stderrWriter;

      const stderrPromise = new Promise((resolve) => {
        stderrWriter = concatStream((stderr) => {
          resolve(stderr);
        });
      });

      let container;

      const dockerVolumePath = (() => {
        if (path.sep === '\\') {
          return tmpPath.replace('C:\\', '/c/').replace(/\\/g, '/');
        }

        return tmpPath;
      })();

      const containerPromise = docker.createContainer({
        Hostname: '',
        User: '',
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: false,
        OpenStdin: false,
        StdinOnce: false,
        Env: null,
        Cmd: ['bash', '-c', `${shellescape([id, id === 'c-gcc' ? '/volume/CODE.c' : '/volume/CODE'])} < /volume/INPUT`],
        Image: 'hakatashi/esolang-box',
        Volumes: {
          '/volume': {}
        },
        VolumesFrom: [],
        HostConfig: {
          Binds: [`${dockerVolumePath}:/volume:ro`],
        },
      }).then((cont) => {
        container = cont;
        return container.attach({
          stream: true,
          stdout: true,
          stderr: true,
        });
      }).then((stream) => {
        container.modem.demuxStream(stream, stdoutWriter, stderrWriter);
        stream.on('end', () => {
          stdoutWriter.end();
          stderrWriter.end();
        });

        return container.start();
      })
      .then(() => container.wait())
      .then(() => container.remove());

      const runner = Promise.all([stdoutPromise, stderrPromise, containerPromise]);

      return runner.timeout(5000).then(([stdout, stderr]) => {
        cleanup();
        return {
          stdout: Buffer.isBuffer(stdout) ? stdout : Buffer.alloc(0),
          stderr: Buffer.isBuffer(stderr) ? stderr : Buffer.alloc(0),
        };
      }).catch(Promise.TimeoutError, (error) => {
        container.kill().then(() => container.remove()).then(() => Promise.reject(error));
      });
    });
  });
};
