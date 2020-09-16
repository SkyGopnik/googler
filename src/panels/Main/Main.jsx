import React from 'react';
import {
  Panel, Title
} from '@vkontakte/vkui';

export default class extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  render() {
    const {
      id
    } = this.props;

    return (
      <Panel id={id} centered>
        <Title level="1" weight="semibold" style={{ marginBottom: 16 }}>Упс, не повезло</Title>
        <Title level="3" weight="regular">Ваш рекорд</Title>
        <Title level="2" weight="bold" style={{ marginBottom: 16 }}>0</Title>
        <Title level="3" weight="regular">Текущий счёт</Title>
        <Title level="2" weight="bold" style={{ marginBottom: 16 }}>0</Title>
      </Panel>
    );
  }
}
