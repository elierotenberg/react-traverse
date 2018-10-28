const path = require('path');

require('babel-register')({
  only: ['config'],
  presets: [path.resolve('./config/babel/node/dev')],
  retainLines: true,
});
require('./config/gulp');
