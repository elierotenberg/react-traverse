import 'babel-polyfill';
import Promise from 'bluebird';
const __DEV__ = process && process.env && process.env.NODE_ENV === 'development';
Promise.config({
  warnings: __DEV__,
  longStackTraces: __DEV__,
  cancellation: true,
});

import traverse from './traverse';

export default traverse;
