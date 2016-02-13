const { describe, it } = global;
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import should from 'should/as-function';

import traverse, { wrapRender } from '..';

describe('wrapRender', () => {
  function wrapFoo(node) {
    return traverse(node, {
      DOMElement(path) {
        const nextProps = Object.assign({}, path.node.props);
        if(nextProps.className === 'foo') {
          nextProps.className = `${nextProps.className} foo-wrapped`;
        }
        return React.cloneElement(
          path.node,
          nextProps,
          ...path.traverseChildren(),
        );
      },
    });
  }

  it('wraps stateless components', () => {
    function Foo() {
      return <div className='foo'><span>{'foo'}</span></div>;
    }

    const WrappedFoo = wrapRender(wrapFoo)(Foo);

    const actual = <WrappedFoo />;
    const expected = <div className='foo foo-wrapped'><span>{'foo'}</span></div>;
    should(ReactDOMServer.renderToStaticMarkup(actual)).be.exactly(ReactDOMServer.renderToStaticMarkup(expected));
  });

  it('wraps stateful components', () => {
    class Foo extends React.Component {
      render() {
        return <div className='foo'><span>{'foo'}</span></div>;
      }
    }

    const WrappedFoo = wrapRender(wrapFoo)(Foo);

    const actual = <WrappedFoo />;
    const expected = <div className='foo foo-wrapped'><span>{'foo'}</span></div>;
    should(ReactDOMServer.renderToStaticMarkup(actual)).be.exactly(ReactDOMServer.renderToStaticMarkup(expected));
  });

  it('decorates stateful components', () => {
    @wrapRender(wrapFoo)
    class WrappedFoo extends React.Component {
      render() {
        return <div className='foo'><span>{'foo'}</span></div>;
      }
    }

    const actual = <WrappedFoo />;
    const expected = <div className='foo foo-wrapped'><span>{'foo'}</span></div>;
    should(ReactDOMServer.renderToStaticMarkup(actual)).be.exactly(ReactDOMServer.renderToStaticMarkup(expected));
  });
});
