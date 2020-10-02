import React from 'react';
// import AnimatedNumber from 'react-animated-number';
import CountUp from 'react-countup';

export default class extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  render() {
    const { value, prefix, duration } = this.props;

    return (
      <CountUp
        start={0}
        end={value}
        duration={duration}
        prefix={prefix}
        delay={0}
        separator=" "
      >
        {({ countUpRef }) => (
          <div>
            <span ref={countUpRef} />
          </div>
        )}
      </CountUp>
    );
  }
}
