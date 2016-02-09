import React from 'react';

import traverse from './traverse';

function transformComponentsInNode(node, transformComponent) {
  return traverse(node, {
    ComponentElement(path) {
      const { type, props } = path.node;
      return React.createElement(transformComponent(type), props);
    },
  });
}

const transformComponentsMemo = new WeakMap();
function transformComponents(transformComponent) {
  if(!transformComponentsMemo.has(transformComponent)) {
    transformComponentsMemo.set(transformComponent, new WeakMap());
  }
  const transformComponentMemo = new WeakMap();
  return (type) => {
    if(!transformComponentMemo.has(type)) {
      if(typeof type.prototype.render === 'function') {
        transformComponentMemo.set(type, class extends type {
          render() {
            return transformComponentsInNode(
              super.render(),
              (childType) => transformComponents(transformComponent)(childType),
            );
          }
        });
      }
      else {
        transformComponentMemo.set(type, class extends React.Component {
          static displayName = type.displayName || type.name;
          static propTypes = type.propTypes;
          render() {
            return transformComponentsMemo(
              type(this.props),
              (childType) => transformComponents(transformComponent)(childType),
            );
          }
        });
      }
    }
    return transformComponentMemo.get(type);
  };
}

export default transformComponents;
