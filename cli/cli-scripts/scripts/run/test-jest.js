#!/usr/bin/env node
const {
  run,
  shell,
  findBin,
  shellParallel,
  getCwdInfo,
} = require('@lskjs/cli-utils');
const { isCI, isDev } = require('@lskjs/env');
const { existsSync } = require('fs');

const main = async ({ isRoot, cwd, ctx, args, log } = {}) => {
  if (isRoot) {
    await shellParallel('lsk run test:jest', { ctx, args });
    return;
  }
  const isProd = !isDev || args.includes('--prod');
  const isWatch = args.includes('--watch');
  const isSilent = args.includes('--silent') || isCI;
  let cmd = findBin('jest');
  const { rootPath } = getCwdInfo({ cwd });
  const jestConfigPath = `${rootPath}/scripts/jest.config.js`;
  if (isProd || isSilent) cmd += ' --silent';
  if (isSilent) cmd += ' --ci';
  if (isWatch) cmd += ' --watch';
  if (jestConfigPath && existsSync(jestConfigPath)) {
    cmd += ` --config ${jestConfigPath}`;
  }
  cmd = `${cmd} --coverage --rootDir ${cwd}`;
  const stdio = isSilent ? ['inherit', 'ignore', 'ignore'] : 'inherit';
  try {
    await shell(cmd, {
      ctx,
      stdio,
    });
  } catch (err) {
    if (!isSilent) throw err;
    log.fatal('test:jest', err);
    // console.error('test:jest', err);
    await shell(cmd, { ctx });
  }
};

module.exports = run(main);
