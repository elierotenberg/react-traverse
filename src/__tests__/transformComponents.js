import React from 'react';
import ReactDOMServer from 'react-dom/server';
import sha1 from 'sha1';
import should from 'should/as-function';

import traverse, { transformComponents, wrapRender } from '..';

const { describe, it } = global;

describe('transformComponents', () => {
  describe('replaces divs with spans', () => {
    function replaceDivsWithSpansInNode(node) {
      return traverse(node, {
        DOMElement(path) {
          if (path.node.type !== 'div') {
            return path.defaultTraverse();
          }
          return React.createElement(
            'span',
            path.node.props,
            ...path.traverseChildren(),
          );
        },
      });
    }

    const replaceDivsWithSpansInComponent = wrapRender(
      replaceDivsWithSpansInNode,
    );

    it('replaces in stateless components', () => {
      function Foo() {
        return <div className="foo"><span>{'foo'}</span></div>;
      }

      const TransformedFoo = transformComponents(
        replaceDivsWithSpansInComponent,
      )(Foo);
      const actual = <TransformedFoo />;
      const expected = <span className="foo"><span>{'foo'}</span></span>;
      should(ReactDOMServer.renderToStaticMarkup(actual)).be.exactly(
        ReactDOMServer.renderToStaticMarkup(expected),
      );
    });

    it('replaces in stateful components', () => {
      class Foo extends React.Component {
        render() {
          return <div className="foo"><span>{'foo'}</span></div>;
        }
      }

      const TransformedFoo = transformComponents(
        replaceDivsWithSpansInComponent,
      )(Foo);
      const actual = <TransformedFoo />;
      const expected = <span className="foo"><span>{'foo'}</span></span>;
      should(ReactDOMServer.renderToStaticMarkup(actual)).be.exactly(
        ReactDOMServer.renderToStaticMarkup(expected),
      );
    });

    it('replaces in nested stateless components', () => {
      function Bar() {
        return <div className="bar">{'bar'}</div>;
      }

      function Foo() {
        return <div className="foo"><Bar /></div>;
      }

      const TransformedFoo = transformComponents(
        replaceDivsWithSpansInComponent,
      )(Foo);
      const actual = <TransformedFoo />;
      const expected = (
        <span className="foo">
          <span className="bar">
            {'bar'}
          </span>
        </span>
      );
      should(ReactDOMServer.renderToStaticMarkup(actual)).be.exactly(
        ReactDOMServer.renderToStaticMarkup(expected),
      );
    });

    it('replaces in nested stateful components', () => {
      class Bar extends React.Component {
        render() {
          return <div className="bar">{'bar'}</div>;
        }
      }

      class Foo extends React.Component {
        render() {
          return <div className="foo"><Bar /></div>;
        }
      }

      const TransformedFoo = transformComponents(
        replaceDivsWithSpansInComponent,
      )(Foo);
      const actual = <TransformedFoo />;
      const expected = (
        <span className="foo">
          <span className="bar">
            {'bar'}
          </span>
        </span>
      );
      should(ReactDOMServer.renderToStaticMarkup(actual)).be.exactly(
        ReactDOMServer.renderToStaticMarkup(expected),
      );
    });

    it('replaces in nested mixed stateless and stateful components', () => {
      function Bar() {
        return <div className="bar">{'bar'}</div>;
      }

      class Foo extends React.Component {
        render() {
          return <div className="foo"><Bar /></div>;
        }
      }

      const TransformedFoo = transformComponents(
        replaceDivsWithSpansInComponent,
      )(Foo);
      const actual = <TransformedFoo />;
      const expected = (
        <span className="foo">
          <span className="bar">
            {'bar'}
          </span>
        </span>
      );
      should(ReactDOMServer.renderToStaticMarkup(actual)).be.exactly(
        ReactDOMServer.renderToStaticMarkup(expected),
      );
    });

    it('replaces in complex components nested in a ReactElement', () => {
      function Bar() {
        return <div className="bar">{'bar'}</div>;
      }

      class Foo extends React.Component {
        render() {
          return <div className="foo"><Bar /></div>;
        }
      }

      const actual = transformComponents(replaceDivsWithSpansInComponent)(
        <div className="wrapper">
          <Foo />
        </div>,
      );
      const expected = (
        <span className="wrapper">
          <span className="foo">
            <span className="bar">
              {'bar'}
            </span>
          </span>
        </span>
      );
      should(ReactDOMServer.renderToStaticMarkup(actual)).be.exactly(
        ReactDOMServer.renderToStaticMarkup(expected),
      );
    });

    it('decorates mixed stateless and stateful components', () => {
      function Bar() {
        return <div className="bar">{'bar'}</div>;
      }

      @transformComponents(replaceDivsWithSpansInComponent)
      class TransformedFoo extends React.Component {
        render() {
          return <div className="foo"><Bar /></div>;
        }
      }

      const actual = <TransformedFoo />;
      const expected = (
        <span className="foo">
          <span className="bar">
            {'bar'}
          </span>
        </span>
      );
      should(ReactDOMServer.renderToStaticMarkup(actual)).be.exactly(
        ReactDOMServer.renderToStaticMarkup(expected),
      );
    });
  });

  describe('hashes all classNames', () => {
    const HASH_LENGTH = 10;

    function hashClassName(hashKey) {
      return className => sha1(`${className}:${hashKey}`).slice(0, HASH_LENGTH); // eslint-disable-line new-cap
    }

    function hashAllClassNamesInNode(hashKey) {
      return node =>
        traverse(node, {
          DOMElement(path) {
            if (typeof path.node.props.className !== 'string') {
              return path.defaultTraverse();
            }
            const nextProps = Object.assign({}, path.node.props);
            nextProps.className = path.node.props.className
              .split(' ')
              .map(hashClassName(hashKey))
              .join(' ');
            return React.cloneElement(
              path.node,
              nextProps,
              ...path.traverseChildren(),
            );
          },
        });
    }

    function createTransformComponent(hashKey) {
      return wrapRender(hashAllClassNamesInNode(hashKey));
    }

    it('hashes all classNames correctly', () => {
      const hashKey = 'foobar';

      function Bar() {
        return <div className="bar">{'bar'}</div>;
      }

      @transformComponents(createTransformComponent(hashKey))
      class Foo extends React.Component {
        render() {
          return (
            <div className="foo">
              <span className="foo-bar bar-foo">
                <Bar />
              </span>
            </div>
          );
        }
      }

      const actual = <Foo />;
      const expected = (
        <div className={hashClassName(hashKey)('foo')}>
          <span
            className={`${hashClassName(hashKey)('foo-bar')} ${hashClassName(hashKey)('bar-foo')}`}
          >
            <div className={hashClassName(hashKey)('bar')}>
              {'bar'}
            </div>
          </span>
        </div>
      );
      should(ReactDOMServer.renderToStaticMarkup(actual)).be.exactly(
        ReactDOMServer.renderToStaticMarkup(expected),
      );
    });
  });
});
