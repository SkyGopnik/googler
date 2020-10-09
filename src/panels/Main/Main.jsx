import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
  Panel,
  Title,
  Button,
  ActionSheet,
  ActionSheetItem,
  IOS,
  platform,
  Footer,
  Link,
  PromoBanner
} from '@vkontakte/vkui';

import Icon28ShareOutline from '@vkontakte/icons/dist/28/share_outline';
import Icon28LinkOutline from '@vkontakte/icons/dist/28/link_outline';
import Icon28PollSquareOutline from '@vkontakte/icons/dist/28/poll_square_outline';
import Icon28ChatsOutline from '@vkontakte/icons/dist/28/chats_outline';
import Icon28Users3Outline from '@vkontakte/icons/dist/28/users_3_outline';

import Logo from '../../components/Logo.jsx';
import Pattern from '../../components/Pattern.jsx';
import GroupBanner from '../../components/GroupBanner/GroupBanner.jsx';

import declNum from '../../functions/decl_num.jsx';
import queryGet from '../../functions/query_get.jsx';

import './Main.scss';

const osname = platform();

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      promoBanner: null
    };

    this.shareWall = this.shareWall.bind(this);
  }

  componentDidMount() {
    bridge.send('VKWebAppGetAds')
      .then((banner) => {
        this.setState({
          promoBanner: banner
        });
      });
  }

  getPhrase(score) {
    let phrase = 'Крутота!';

    if (score === 0) {
      phrase = 'Ты лучше 0 игроков :c';
    } else if (score === 1) {
      phrase = 'Даже моя бабуля набрала больше!';
    } else if (score === 2) {
      phrase = 'Мы ничего не видели';
    } else if (
      score === 3
      || score === 4
    ) {
      phrase = 'В следующий раз повезёт';
    } else if (
      score === 5
      || score === 6
    ) {
      phrase = 'Давай ещё раз, мы верим, что ты можешь лучше';
    } else if (
      score === 7
      || score === 8
    ) {
      phrase = 'Молодец, ты неплохо отвечаешь';
    } else if (
      score === 9
      || score === 10
    ) {
      phrase = 'Неплохой результат, мы гордимся тобой';
    } else if (score > 10 && score < 14) {
      phrase = 'Да как ты это делаешь?!';
    } else if (score > 13 && score < 18) {
      phrase = 'Да ты профи!';
    } else if (score > 17 && score < 21) {
      phrase = 'Ты, случайно, не гугл?';
    } else if (score > 20 && score < 24) {
      phrase = 'Ты сверхчеловек!';
    } else if (score > 23 && score < 27) {
      phrase = 'Твой друг Алиса?';
    } else if (score > 27) {
      phrase = 'Перестань пользоваться гуглом';
    }

    return phrase;
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
      onPanelChange,
      isStartScreen
    } = this.props;
    const { promoBanner } = this.state;

    return (
      <Panel id={id}>
        <div className="bg">
          <Logo className="logo" />
        </div>
        <div className="content">
          <div className="buttons-with-stat">
            <div className="stat-block">
              {isStartScreen ? (
                <>
                  <Title className="header-title" level="1" weight="bold">Что гуглят больше?</Title>
                  <div className="stat">
                    <div className="item">
                      <Title level="3" weight="regular">Твой рекорд</Title>
                      <Title className="stat-num" level="1" weight="regular">{score.record}</Title>
                    </div>
                    {/*<div className="item">*/}
                    {/*  <Title level="3" weight="regular">Место в рейтинге</Title>*/}
                    {/*  <Title className="stat-num" level="1" weight="regular">213</Title>*/}
                    {/*</div>*/}
                  </div>
                </>
              ) : (
                score.now < score.record ? (
                  <>
                    <Title className="header-title" level="1" weight="bold">{this.getPhrase(score.now)}</Title>
                    <div className="stat">
                      <div className="item">
                        <Title level="3" weight="regular">Счёт</Title>
                        <Title className="stat-num" level="1" weight="regular">{score.now}</Title>
                      </div>
                      <div className="item">
                        <Title level="3" weight="regular">Рекорд</Title>
                        <Title className="stat-num" level="1" weight="regular">{score.record}</Title>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Title className="header-title" level="1" weight="bold">{this.getPhrase(score.now)}</Title>
                    <div className="stat">
                      <div className="item">
                        <Title level="3" weight="regular">Новый рекорд!</Title>
                        <Title className="stat-num" level="1" weight="regular">{score.record}</Title>
                      </div>
                    </div>
                  </>
                )
              )}
              <Pattern className="pattern" />
            </div>
            {isStartScreen ? (
              <div className="buttons">
                <Button
                  size="l"
                  mode="commerce"
                  stretched
                  onClick={() => changeView('game')}
                >
                  Начать игру!
                </Button>
                <Button
                  before={<Icon28PollSquareOutline />}
                  size="l"
                  mode="overlay_outline"
                  stretched
                  data-to="ranking"
                  onClick={onPanelChange}
                >
                  Рейтинг
                </Button>
                <div className="buttons-group" style={{ display: 'flex' }}>
                  <Button
                    before={<Icon28ChatsOutline />}
                    size="l"
                    mode="overlay_outline"
                    stretched
                    href="https://vk.me/join/AJQ1d/E8nBabv9DfXT9Pmnhs"
                    target="_blank"
                  >
                    Беседа
                  </Button>
                  <Button
                    before={<Icon28Users3Outline />}
                    size="l"
                    mode="overlay_outline"
                    stretched
                    href="https://vk.com/club191809582"
                    target="_blank"
                  >
                    Группа
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="buttons">
                  <Button
                    size="l"
                    mode="commerce"
                    stretched
                    onClick={() => changeView('game')}
                  >
                    Начать заново
                  </Button>
                  <div className="buttons-group" style={{ display: 'flex' }}>
                    <Button
                      before={<Icon28PollSquareOutline />}
                      size="l"
                      mode="overlay_outline"
                      stretched
                      data-to="ranking"
                      onClick={onPanelChange}
                    >
                      Рейтинг
                    </Button>
                    <Button
                      before={<Icon28ShareOutline />}
                      size="l"
                      mode="overlay_outline"
                      stretched
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
                  {promoBanner && (
                    <PromoBanner
                      className="promo-banner"
                      bannerData={promoBanner}
                      onClose={() => this.setState({ promoBanner: null })}
                    />
                  )}
                </div>
              </>
            )}
            <Footer>Сделано с <span style={{ color: 'var(--destructive)' }}>❤</span> от <Link href="https://vk.com/club191809582" target="_blank">SkyReglis Studio</Link></Footer>
          </div>
        </div>
      </Panel>
    );
  }
}
