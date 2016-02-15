const { describe, it } = global;
import React from 'react';
import should from 'should/as-function';

import { isStatelessComponent } from '..';

describe('isStatelessComponent', () => {
  function RegularFunctionComponent() {
    return <div />;
  }

  const ArrowFunctionComponent = () => <div />;

  class ClassComponent extends React.Component {
    render() {
      return <div />;
    }
  }

  it('detects regular functions as stateless components', () => {
    const { type } = <RegularFunctionComponent />;
    should(isStatelessComponent(type)).be.exactly(true);
  });

  it('detects arrow functions as stateless components', () => {
    const { type } = <ArrowFunctionComponent />;
    should(isStatelessComponent(type)).be.exactly(true);
  });

  it('detects classes extending React.Component as stateful components', () => {
    const { type } = <ClassComponent />;
    should(isStatelessComponent(type)).be.exactly(false);
  });
});
