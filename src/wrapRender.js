import React from 'react';

import isStatelessComponent from './isStatelessComponent';

const wrapRenderMemo = new WeakMap();
export default function wrapRender(transformNode) {
  if (!wrapRenderMemo.has(transformNode)) {
    wrapRenderMemo.set(transformNode, new WeakMap());
  }
  const memo = wrapRenderMemo.get(transformNode);
  return type => {
    if (!memo.has(type)) {
      memo.set(
        type,
        (() => {
          if (isStatelessComponent(type)) {
            const klass = class extends React.Component {
              render() {
                return transformNode(type(this.props));
              }
            };

            klass.displayName = type.displayName || type.name;
            klass.propTypes = type.propTypes;
            return klass;
          }
          return class extends type {
            render() {
              return transformNode(super.render());
            }
          };
        })()
      );
    }
    return memo.get(type);
  };
}
