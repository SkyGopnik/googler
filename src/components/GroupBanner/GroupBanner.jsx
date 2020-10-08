import React from 'react';
import {
  Group,
  Banner,
  Button
} from '@vkontakte/vkui';

import './GroupBanner.scss';

export default class extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  render() {
    return (
      <Group separator="hide">
        <Banner
          className="group-banner"
          mode="image"
          size="m"
          header="Понравилось приложение?"
          subheader={<span>Подписывайся на наше сообщество, чтобы быть вкурсе всех новостей</span>}
          background={<div className="banner-bg" />}
          actions={<Button mode="overlay_primary" size="l">Подписаться</Button>}
        />
      </Group>
    );
  }
}
