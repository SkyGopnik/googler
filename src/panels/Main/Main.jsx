import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
  Panel,
  Title,
  Button,
  ActionSheet,
  ActionSheetItem,
  IOS,
  platform
} from '@vkontakte/vkui';

import Icon28StoryOutline from '@vkontakte/icons/dist/28/story_outline';
import Icon28ShareOutline from '@vkontakte/icons/dist/28/share_outline';
import Icon28LinkOutline from '@vkontakte/icons/dist/28/link_outline';

import declNum from '../../functions/decl_num.jsx';
import getRandomInt from '../../functions/get_random_int.jsx';
import queryGet from '../../functions/query_get.jsx';

import './Main.scss';

import image from '../../img/bg-1.jpg';

const osname = platform();

export default class extends React.Component {
  constructor() {
    super();

    const phrases = [
      'Даже моя бабуля набрала больше!',
      'Мы ничего не видели'
    ];

    this.state = {
      phrases: phrases,
      phraseId: getRandomInt(0, phrases.length)
    };

    this.shareWall = this.shareWall.bind(this);
  }

  shareWall() {
    const { score } = this.props;

    bridge.sendPromise(
      'VKWebAppShowWallPostBox',
      {
        'message': `🔥 Я набрал(а) ${score.now} ${declNum(score.now, ['правильный ответ', 'правильных ответа', 'правильных ответов'])} в игре Гуглер 🔥 \n👇🏻 Попробуй обогнать меня!`,
        'attachments': 'https://vk.com/app7591808'
      }
    );
  }

  shareLink() {
    bridge.sendPromise(
      'VKWebAppShare',
      {
        'link': 'https://vk.com/app7591808'
      }
    );
  }

  render() {
    const {
      id,
      score,
      changeView,
      changePopout,
      onPanelChange
    } = this.props;
    const { phrases, phraseId } = this.state;

    return (
      <Panel id={id}>
        <img className="bg" src={image} alt="" />
        <div className="content">
          <div />
          <div className="stat-wrapper">
            <Title className="title" level="1" weight="semibold">{phrases[phraseId]}</Title>
            <div className="stat">
              <Title level="3" weight="regular">Ваш счёт</Title>
              <Title level="2" weight="bold">{score.now}</Title>
            </div>
            <div className="stat">
              <Title level="3" weight="regular">Рекорд</Title>
              <Title level="2" weight="bold">{score.record}</Title>
            </div>
          </div>
          <div className="buttons">
            <Button
              size="l"
              mode="commerce"
              onClick={() => changeView('game')}
            >
              Начать заново!
            </Button>
            <Button
              size="l"
              data-to="ranking"
              onClick={onPanelChange}
            >
              Рейтинг
            </Button>
            <Button
              size="l"
              mode="overlay_secondary"
              onClick={() => changePopout(
                <ActionSheet onClose={() => changePopout(null)}>
                  {/*<ActionSheetItem before={<Icon28StoryOutline />} autoclose>*/}
                  {/*  В истории*/}
                  {/*</ActionSheetItem>*/}
                  <ActionSheetItem
                    onClick={this.shareWall}
                    before={<Icon28ShareOutline />}
                    autoclose
                  >
                    На стене
                  </ActionSheetItem>
                  {queryGet('vk_platform') !== 'desktop_web' && (
                    <ActionSheetItem
                      onClick={this.shareLink}
                      before={<Icon28LinkOutline />}
                      autoclose
                    >
                      В личных сообщениях
                    </ActionSheetItem>
                  )}
                  {osname === IOS && <ActionSheetItem autoclose mode="cancel">Отменить</ActionSheetItem>}
                </ActionSheet>
              )}
            >
              Поделиться
            </Button>
          </div>
        </div>
      </Panel>
    );
  }
}
