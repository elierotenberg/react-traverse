const { describe, it } = global;
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import should from 'should/as-function';

import traverse from '..';

describe('traverse', () => {
  it('capitalize all text', () => {
    class Foo extends React.Component {
      static propTypes = {
        children: React.PropTypes.node,
      };
      render() {
        return (
          <div>
            <span>{'Foo:'}</span><span>{this.props.children}</span>
          </div>
        );
      }
    }
    function Bar(props) {
      return (
        <div>
          <span>{'Bar:'}</span><span>{props.children}</span>
        </div>
      );
    }
    Bar.propTypes = {
      children: React.PropTypes.node,
    };
    const original = (
      <ul>
        <li>{'foo'}</li>
        <li>{'Bar'}</li>
        <li>{'BAZ'}</li>
        <li>{'buZZ'}</li>
        <li>
          <Foo>{'bazZ'}</Foo>
          <Bar>{'fozZ'}</Bar>
        </li>
        <li>
          <div>{1}</div>
        </li>
      </ul>
    );
    const traversed = traverse(original, {
      Text(path) {
        if (typeof path.node === 'string') {
          return path.node.toUpperCase();
        }
        return path.node;
      },
    });
    const expected = (
      <ul>
        <li>{'FOO'}</li>
        <li>{'BAR'}</li>
        <li>{'BAZ'}</li>
        <li>{'BUZZ'}</li>
        <li>
          <div>
            <span>{'Foo:'}</span><span>{'BAZZ'}</span>
          </div>
          <div>
            <span>{'Bar:'}</span><span>{'FOZZ'}</span>
          </div>
        </li>
        <li>
          <div>{1}</div>
        </li>
      </ul>
    );
    should(ReactDOMServer.renderToStaticMarkup(traversed)).be.exactly(
      ReactDOMServer.renderToStaticMarkup(expected),
    );
  });
});
