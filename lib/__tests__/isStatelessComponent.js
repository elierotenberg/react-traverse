const { describe, it } = global;
import React from 'react';
import should from 'should/as-function';

import isStatelessComponent from '../isStatelessComponent';

describe('isStatelessComponent', () => {
  function StatelessComponent() {
    return <div />;
  }

  class StatefulComponent extends React.Component {
    render() {
      return <div />;
    }
  }

  it('detects stateless components', () => {
    const { type } = <StatelessComponent />;
    should(isStatelessComponent(type)).be.exactly(true);
  });

  it('detects stateful components', () => {
    const { type } = <StatefulComponent />;
    should(isStatelessComponent(type)).be.exactly(false);
  });
});
