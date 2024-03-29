import PrettyError from 'pretty-error';

export const pe = new PrettyError();
pe.appendStyle({
  // this is a simple selector to the element that says 'Error'
  'pretty-error > header > title > kind': {
    // which we can hide:
    // display: 'none',
    marginLeft: 1,
  },

  // the 'colon' after 'Error':
  'pretty-error > header > colon': {
    // we hide that too:
    display: 'none',
  },

  // our error message
  'pretty-error > header > message': {
    // let's change its color:
    color: 'bright-white',

    // we can use black, red, green, yellow, blue, magenta, cyan, white,
    // grey, bright-red, bright-green, bright-yellow, bright-blue,
    // bright-magenta, bright-cyan, and bright-white

    // we can also change the background color:
    // background: 'cyan',
    background: 'cyan',
    marginLeft: 1,

    // it understands paddings too!
    // padding: '0 1', // top/bottom left/right
  },

  // each trace item ...
  'pretty-error > trace > item': {
    // ... can have a margin ...
    marginLeft: 4,

    // ... and a bullet character!
    bullet: '"  <grey>•</grey>"',

    // Notes on bullets:
    //
    // The string inside the quotation mark gets used as the character
    // to show for the bullet point.
    //
    // You can set its color/background color using tags.
    //
    // This example sets the background color to white, and the text color
    // to cyan, the character will be a hyphen with a space character
    // on each side:
    // example: '"<bg-white><cyan> - </cyan></bg-white>"'
    //
    // Note that we should use a margin of 3, since the bullet will be
    // 3 characters long.
  },

  'pretty-error > trace > item > header > pointer > file': {
    color: 'bright-cyan',
  },

  'pretty-error > trace > item > header > pointer > colon': {
    color: 'cyan',
    padding: '0 0',
  },

  'pretty-error > trace > item > header > pointer > line': {
    color: 'bright-cyan',
    padding: '0 0',
  },

  'pretty-error > trace > item > header > what': {
    color: 'bright-white',
    padding: '0 0',
  },

  'pretty-error > trace > item > footer > addr': {
    // display: 'none',
    color: 'grey',
    padding: '0 0',
  },
  'pretty-error > trace > item > footer > extra': {
    display: 'none',
  },
});
pe.skipPackage('rxjs', '@nestjs]/core');
pe.skipNodeFiles();

pe.skip((traceLine) => {
  if (String(traceLine.file).startsWith('node:')) {
    return true;
  }
  if (String(traceLine.shortenedPath).startsWith('node:')) {
    return true;
  }
  if (String(traceLine.shortenedAddr).includes('[@nestjs]/core')) {
    return true;
  }
  return false;
});
