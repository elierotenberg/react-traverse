require('weakmap-polyfill');

const __DEV__ = process && process.env && process.env.NODE_ENV === 'development';

import isStatelessComponent from './isStatelessComponent';
import traverse from './traverse';
import transformComponents from './transformComponents';
import wrapRender from './wrapRender';

export {
  isStatelessComponent,
  transformComponents,
  wrapRender,
};
export default traverse;
