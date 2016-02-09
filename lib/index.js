import 'babel-polyfill';
import Promise from 'bluebird';
const __DEV__ = process && process.env && process.env.NODE_ENV === 'development';
Promise.config({
  warnings: __DEV__,
  longStackTraces: __DEV__,
  cancellation: true,
});

import traverse from './traverse';
import transformComponents from './transformComponents';

export { transformComponents };
export default traverse;
