react-traverse
==============

`react-traverse` applies the principle of tree traversal to the two kinds of trees present in a React hierarchy:
React **nodes** and React **components**.

### React **node** traversal

`traverse(node, visitor)` transforms a React **nodes** hierarchy into another one
(borrowing its syntax from `babel`). A React node is typically what is returned by a single components `render`
function.

For example, you can replace all `<div>`s with `<span>s`:

```js
const replaceDivsWithSpans = (node) => traverse(node, {
  DOMElement(path) {
    if(path.node.type === 'div') {
      return React.createElement(
        'span',
        path.node.props,
        ...path.traverseChildren(),
      );
    }
    return React.cloneElement(
      path.node,
      path.node.props,
      ...path.traverseChildren(),
    );
  },
});

replaceDivsWithSpans(<div>This is a span.</div>)
// will render as:
<span>This is a div.</span>
```

See the full traversal API below.

### React **components** wrapping

`traverse` is notably useful to decorate custom components (either classes extending `React.Component` or stateless
function components). So there is a simple decorator, `wrapRender(transformNode)(component)`, which does exactly what
it says on the tin.

For example, you can reuse `replaceDivsWithSpans` and wrap a component in it:

```js
class Component extends React.Component {
  render() {
    return <div>This is a span.</div>;
  }
}

const WrappedComponent = wrapRender(replaceDivsWithSpans)(Component);
// <WrappedComponent /> will render as:
<span>This is a span.</span>
```

### React **components** traversal

`transformComponents(transformComponent)` transforms a React **components** hierarchy into another one. Think
higher-higher-order components, or decorators on steroids. A React Component is either a class extending
`React.Component` or a stateless functional render function. Not only does it transform the component class you apply
it two, but also recursively to all the subcomponents.

It combines very well with both `traverse` and `wrapRender`, as you can apply node transforms to the **whole**
Virtual DOM tree, not only component-local parts of it.

For example, you can transform ALL the divs of your app into spans:

```js
class Foo extends React.Component {
  render() {
    return <div>This is foo.</div>;
  }
}

function Bar() {
  return <div>
    This is bar.
    <Foo />
  </div>;
}

const TransformedBar = transformComponents(wrapRender(replaceDivsWithSpans))(Bar);

// <TransformedBar /> will render as:
<span>
  This is bar.
  <span>This is foo.</span>
</span>
```

For convenience, you can use `transformComponents` on components classes (created using `extends React.Component`), on
stateless function components, or directly on React Elements:

```js
const transform = transformComponents(wrapRender(replaceDivsWithSpans));
// decorator
@transform
class Foo extends React.Component { ... }

// stateless function
const Foo = transform(
  () => <div>This is foo.</div>
);

// directly on a ReactElement, eg. in a ReactDOM.render call
ReactDOM.render(transform(
  <div>
    <Foo />
  </div>
));
```

### Node visitor

The following visitor policies are available:

- `Empty`: `null`, `undefined` or boolean
- `Text`: string or number
- `Fragment`: array of React Nodes
- `DOMElement`: non-component elements (`div`, `span`, etc)
- `ComponentElement`: component elements

If a visitor policy is not provided for a given kind, it defaults to a reasonable behaviour:
- `Empty` and `Text` return the original node
- `Fragment` return a new array in which each node has been traversed
- `DOMElement` and `ComponentElement` return a clone element with the same props,
except the children which have also been traversed.

A visitor is passed a single object, `path`, which has the following properties:

- `path.node`: the original node
- `path.kindOf(node)`: a function which returns the kind of node as a string (`Empty`, `Text`, etc)
- `path.traverse(node, visitor = path.visitor)`: a recursive call to the traversal function
- `path.traverseChildren()`: a shortcut to traverse the children of `path.node`
- `path.visitor`: the visitor object for the current traversal

### `transformComponents` memoization

Calls to `transformComponents(transformComponent)(component)` are memoized using a `WeakMap` to avoid allocating
zillions of closures every time the app is rendered. This assumes `transformComponent` itself is pure (stateless) and
`component` is immutable. This should be the case unless you're doing something very wrong.
