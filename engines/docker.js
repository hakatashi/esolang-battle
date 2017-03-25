/* eslint-env browser */
const Docker = require('dockerode');
const assert = require('assert');
const concatStream = require('concat-stream');
const Promise = require('bluebird');
const path = require('path');
const tmp = require('tmp');
const fs = Promise.promisifyAll(require('fs'));

const docker = new Docker();

module.exports = ({ id, code, stdin }) => {
  assert(typeof id === 'string');
  assert(typeof code === 'string');
  assert(typeof stdin === 'string');
  assert(code.length < 10000);

  return new Promise((resolve, reject) => {
    tmp.dir({ unsafeCleanup: true }, (error, tmpPath, cleanup) => {
      if (error) {
        reject(error);
      } else {
        resolve(tmpPath, cleanup);
      }
    });
  }).then((tmpPath, cleanup) => {
    const stdinPath = path.join(tmpPath, 'INPUT');
    const codePath = path.join(tmpPath, 'CODE');

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
        Cmd: ['bash', '-c', 'cat /volume/INPUT'],
        Image: 'hakatashi/esolang-box',
        Volumes: {
          '/volume': {}
        },
        VolumesFrom: [],
        HostConfig: {
          Binds: [`${tmpPath}:/volume:ro`],
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

      runner.timeout(1000).then(([stdout, stderr, data]) => {
        cleanup();
        console.log({ stdout, stderr, data });
      }).catch(Promise.TimeoutError, (error) => {
        console.error('Timed out');
        console.error(error);
        container.kill().then(() => container.remove());
      });
    });
  });
};
