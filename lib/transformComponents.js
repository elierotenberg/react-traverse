import React from 'react';

import traverse from './traverse';
import wrapRender from './wrapRender';

export function transformComponentsInNode(node, transformComponent) {
  return traverse(node, {
    ComponentElement(path) {
      const { attributes, type, props } = path.node;

      /**
      * React and Preact both handle how they store "Children" in a slightly
      * different way.
      *
      * Preact adds them to node.children, while React stores them inside of the attributes object
      **/
      if (attributes) {
          // if attributes exist and it doesnt have children, check to see if
          // their defined on the node (which will be the case with preact)
          attributes.children = attributes.children || path.node.children;
      }

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
      if(React.isValidElement(type)) {
        transformComponentMemo.set(
          type,
          React.createElement(transformComponents(transformComponent)(() => type)),
        );
      }
      else {
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
    }
    return transformComponentMemo.get(type);
  };
}
