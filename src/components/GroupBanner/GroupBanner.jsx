import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
  Group,
  Banner,
  Button
} from '@vkontakte/vkui';

import './GroupBanner.scss';

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      isSub: false
    };

    this.subGroup = this.subGroup.bind(this);
  }

  subGroup() {
    bridge.sendPromise('VKWebAppJoinGroup', { group_id: 191809582 })
      .then(() => {
        this.setState({
          isSub: true
        });
      });
  }

  render() {
    const { isSub } = this.state;

    return (
      <Group separator="hide">
        <Banner
          className="group-banner"
          mode="image"
          size="m"
          header="Понравилось приложение?"
          subheader={<span>Подписывайся на наше сообщество, чтобы быть в курсе всех новостей</span>}
          background={<div className="banner-bg" />}
          actions={
            <Button
              mode="overlay_primary"
              size="l"
              disabled={isSub}
              onClick={() => this.subGroup()}
            >
              Подписаться
            </Button>
          }
        />
      </Group>
    );
  }
}
