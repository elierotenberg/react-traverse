import React from 'react';

import traverse from './traverse';
import wrapRender from './wrapRender';

export function transformComponentsInNode(node, transformComponent) {
  return traverse(node, {
    ComponentElement(path) {
      const { type, props } = path.node;
      return React.createElement(transformComponent(type), props);
    },
  });
}

const transformComponentsMemo = new WeakMap();
export default function transformComponents(transformComponent) {
  if(!transformComponentsMemo.has(transformComponent)) {
    transformComponentsMemo.set(transformComponent, new WeakMap());
  }
  const transformComponentMemo = transformComponentsMemo.get(transformComponent);
  return (type) => {
    if(typeof type === 'string') {
      return type;
    }
    if(!transformComponentMemo.has(type)) {
      transformComponentMemo.set(
        type,
        transformComponent(
          wrapRender(
            (node) => transformComponentsInNode(
              node,
              (childType) => transformComponents(transformComponent)(childType),
            ),
          )(type),
        ),
      );
    }
    return transformComponentMemo.get(type);
  };
}
