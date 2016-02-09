import React from 'react';

function kindOf(node) {
  if(node === null || node === void 0 || typeof node === 'boolean') {
    return 'Empty';
  }
  if(typeof node === 'string' || typeof node === 'number') {
    return 'Text';
  }
  if(Array.isArray(node)) {
    return 'Fragment';
  }
  const { type } = node;
  if(typeof type === 'string') {
    return 'DOMElement';
  }
  return 'ComponentElement';
}

function defaultTraverse(path) {
  const kind = kindOf(path.node);
  if(kind === 'Empty') {
    return path.node;
  }
  if(kind === 'Text') {
    return path.node;
  }
  if(kind === 'Fragment') {
    return path.node.map(path.traverse);
  }
  return React.cloneElement(
    path.node,
    path.node.props,
    React.Children.toArray(path.node.props.children).map(path.traverse),
  );
}

function traverse(node, visitor) {
  const {
    Empty = defaultTraverse,
    Text = defaultTraverse,
    Fragment = defaultTraverse,
    DOMElement = defaultTraverse,
    ComponentElement = defaultTraverse,
  } = visitor;
  const path = {
    node,
    kindOf,
    defaultTraverse,
    traverse(childNode) {
      return traverse(childNode, visitor);
    },
    visitor,
  };
  if(node === null || node === void 0 || typeof node === 'boolean') {
    return Empty(path); // eslint-disable-line new-cap
  }
  if(typeof node === 'string' || typeof node === 'number') {
    return Text(path); // eslint-disable-line new-cap
  }
  if(Array.isArray(node)) {
    return Fragment(path); // eslint-disable-line new-cap
  }
  const { type } = node;
  if(typeof type === 'string') {
    return DOMElement(path); // eslint-disable-line new-cap
  }
  return ComponentElement(path); // eslint-disable-line new-cap
}

export default traverse;
