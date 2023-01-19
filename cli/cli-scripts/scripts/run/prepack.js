#!/usr/bin/env node
const { run, shell, shellParallel, findBin } = require('@lskjs/cli-utils');

const main = async ({ args, isRoot, ctx } = {}) => {
  if (isRoot) {
    await shellParallel('lsk run prepack', { ctx, args });
    return;
  }
  await shell('rm -rf .release', { ctx, silence: 1 });
  // await shell('lsk run fix --workspace');
  let cmd = findBin('clean-publish');
  cmd += ' --without-publish --temp-dir .release --fields "//, ///, ////, private"';
  await shell(cmd, { ctx });
};

module.exports = run(main);
