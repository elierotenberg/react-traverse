import 'babel-polyfill';
import Promise from 'bluebird';
const __DEV__ =
  process && process.env && process.env.NODE_ENV === 'development';
Promise.config({
  warnings: __DEV__,
  longStackTraces: __DEV__,
  cancellation: true,
});

import isStatelessComponent from './isStatelessComponent';
import traverse from './traverse';
import transformComponents from './transformComponents';
import wrapRender from './wrapRender';

export { isStatelessComponent, transformComponents, wrapRender };
export default traverse;
