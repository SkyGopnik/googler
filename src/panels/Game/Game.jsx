import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
  Button,
  Panel,
  Title,
  getClassName,
  platform,
  Placeholder
} from '@vkontakte/vkui';

import Icon28ArrowUpOutline from '@vkontakte/icons/dist/28/arrow_up_outline';
import Icon28ArrowDownOutline from '@vkontakte/icons/dist/28/arrow_down_outline';
import Icon28GhostSimleOutline from '@vkontakte/icons/dist/28/ghost_simle_outline';

import AnimatedNumber from '../../components/AnimatedNumber.jsx';
import Logo from '../../components/Logo.jsx';
import PatternScore from '../../components/PatternScore.jsx';

import queryGet from '../../functions/query_get.jsx';
import getRandomInt from '../../functions/get_random_int.jsx';

import {
  game,
  randomRequests,
  checkRequest,
  checkUserGroupMember
} from '../../api/api.js';

import './Game.scss';

const osname = platform();

let timer;
let loadingTimer;

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      firstRequest: null,
      secondRequest: null,
      score: 0,
      loading: false,
      shadowVisible: false,
      scoreVisible: false,
      isScoreShown: false,
      error: false,
      middleVisible: false,
      isMiddleShown: false,
      middleType: 'ads'
    };

    this.firstMount = this.firstMount.bind(this);
    this.handleBtn = this.handleBtn.bind(this);
    this.endGame = this.endGame.bind(this);
    this.continueGame = this.continueGame.bind(this);
  }

  componentDidMount() {
    try {
      checkUserGroupMember((isMember) => {
        console.log(isMember);
        if (!isMember) {
          this.setState({
            middleType: getRandomInt(0, 100) > 60 ? 'ads' : 'group'
          });
        }
      });
    } catch (e) {
      console.log(e);
    }

    this.firstMount();
  }

  componentWillUnmount() {
    clearTimeout(timer);
    clearTimeout(loadingTimer);
  }

  firstMount() {
    const {
      isStartScreen,
      changeStartScreen
    } = this.props;

    if (isStartScreen) {
      setTimeout(() => changeStartScreen(false), 500);
    }

    try {
      game((params) => {
        console.log(params);
        try {
          randomRequests((requests) => {
            console.log('randomRequests');
            const newRequestsArray = [];

            requests.forEach((item) => {
              const img = new Image();
              img.src = `https://cloudskyreglis.ru/files/${item.image}`;

              newRequestsArray.push({
                id: item.id,
                name: item.name,
                image: item.image
              });
            });

            this.setState({
              error: false,
              firstRequest: requests[0],
              secondRequest: requests[1]
            });
            console.log(requests);
          }, 2, true);
        } catch (e) {
          this.setState({
            error: true
          });
        }
      }, 'start');
    } catch (e) {
      this.setState({
        error: true
      });
    }
  }

  handleBtn(type) {
    const {
      changeView,
      changeScore,
      mainScore
    } = this.props;
    const {
      firstRequest,
      secondRequest,
      score,
      isMiddleShown,
      middleType
    } = this.state;

    this.setState({
      loading: true
    });

    loadingTimer = setTimeout(() => {
      this.setState({
        loading: false
      });
    }, 15000);

    checkRequest((valid, oldRequests) => {
      if (valid) {
        bridge.send('VKWebAppTapticNotificationOccurred', { 'type': 'success' });

        timer = setTimeout(() => {
          this.setState({
            shadowVisible: true
          });

          timer = setTimeout(() => {
            this.setState({
              shadowVisible: false
            });
          }, 500);

          randomRequests((requests) => {
            if (score + 1 > mainScore.record) {
              this.setState({
                scoreVisible: true
              });

              setTimeout(() => {
                this.setState({
                  scoreVisible: false,
                  isScoreShown: true
                });
              }, 1500);
            }

            this.setState({
              score: score + 1,
              firstRequest: oldRequests[1],
              secondRequest: requests[0],
              loading: false
            });
          }, 1);
        }, 100);
      } else {
        bridge.send('VKWebAppTapticNotificationOccurred', { 'type': 'error' });

        this.setState({
          loading: false,
          secondRequest: oldRequests[1]
        });

        timer = setTimeout(() => {
          const platform = queryGet('reglis_platform') === 'vk' ? queryGet('vk_platform') : queryGet('platform');

          if (
            !isMiddleShown
            && (
              (
                middleType === 'ads'
                && (
                  platform === 'mobile_android'
                  || platform === 'mobile_iphone'
                  || platform === 'mobile_android_messenger'
                  || platform === 'mobile_iphone_messenger'
                  || platform === 'html5_ios'
                  || platform === 'html5_android'
                )
              )
              || (middleType === 'group')
            )
          ) {
            this.setState({
              middleVisible: true
            });
          } else {
            game((params) => {
              console.log(params);
              changeScore(params.score);
              changeView('app');
            }, 'end');
          }
        }, 1500);
      }
    }, firstRequest.id, secondRequest.id, type);
  }

  async continueGame() {
    const {
      secondRequest,
      middleType
    } = this.state;

    this.setState({
      loading: true
    });

    loadingTimer = setTimeout(() => {
      this.setState({
        loading: false
      });
    }, 15000);

    randomRequests((requests) => {
      if (middleType === 'ads') {
        bridge.send('VKWebAppShowNativeAds', { ad_format: 'reward' });

        this.setState({
          middleVisible: false,
          isMiddleShown: true,
          loading: false
        });

        this.setState({
          firstRequest: { ...secondRequest },
          secondRequest: requests[0],
          loading: false
        });
      } else if (middleType === 'group') {
        bridge.sendPromise('VKWebAppJoinGroup', { group_id: 191809582 })
          .then(() => {
            this.setState({
              middleVisible: false,
              isMiddleShown: true,
              loading: false
            });

            this.setState({
              firstRequest: { ...secondRequest },
              secondRequest: requests[0],
              loading: false
            });
          });
      }
    }, 1);
  }

  endGame() {
    const {
      changeView,
      changeScore
    } = this.props;

    game((params) => {
      console.log(params);
      changeScore(params.score);
      changeView('app');
    }, 'end');
  }

  render() {
    const { id } = this.props;
    const {
      firstRequest,
      secondRequest,
      score,
      shadowVisible,
      loading,
      scoreVisible,
      isScoreShown,
      error,
      middleVisible,
      isMiddleShown,
      middleType
    } = this.state;

    return (
      <Panel id={id}>
        {!error ? (
          <>
            <div className={scoreVisible && !isScoreShown ? 'new-score new-score-visible' : 'new-score'}>
              <div className="text">
                <Title level="1" weight="bold">Новый рекорд!</Title>
                <div className="number">{score}</div>
              </div>
              <PatternScore className="pattern" />
            </div>
            <div className={middleVisible && !isMiddleShown ? 'middleware middleware-visible' : 'middleware'}>
              <div className="mid-content">
                <div className="text">
                  <Title level="1" weight="semibold">А вот и не угадал!</Title>
                  <Title className="description" level="3" weight="regular">
                    {middleType === 'ads' ? 'Хотел(а) побить рекорд? Не расстраивайся, можно посмотреть короткую рекламу и продолжить играть.' : 'Хотел(а) побить рекорд? Не расстраивайся, можно подписаться на наше сообщество и продолжить играть. Тебе не сложно, а нам приятно.'}
                  </Title>
                </div>
                <div className="buttons">
                  <Button
                    mode="commerce"
                    size="xl"
                    onClick={() => this.continueGame()}
                    disabled={loading}
                    stretched
                  >
                    Продолжить раунд
                  </Button>
                  <Button
                    className="end"
                    mode="tertiary"
                    size="xl"
                    onClick={() => this.endGame()}
                    stretched
                  >
                    Завершить раунд
                  </Button>
                </div>
              </div>
            </div>
            <div className="content">
              <div className={!shadowVisible ? 'shadow' : 'shadow shadow-visible'}>
                <div className="shadow-left" />
                <div className="shadow-right" />
              </div>
              <div className="score">
                <Title level="2" weight="regular">
                  Счёт: {score}
                </Title>
              </div>
              {firstRequest && (
                <div className={`image ${getClassName('first-image', osname)}`} style={{ backgroundImage: `url(https://cloudskyreglis.ru/files/${firstRequest.image})` }}>
                  <div className="query-stat">
                    <Title level="1" weight="semibold">{firstRequest.name}</Title>
                    <Title level="2" weight="regular">{firstRequest.wordForm === 0 ? 'имеет' : 'имеют'}</Title>
                    <Title className="stat" level="2" weight="regular">
                      <AnimatedNumber
                        value={firstRequest.count}
                        duration={1}
                      />
                    </Title>
                    <Title level="2" weight="regular">запросов в месяц</Title>
                  </div>
                </div>
              )}
              <div className="separator">
                <Logo className={loading ? 'logo logo-animate' : 'logo'} />
                <div className="first" />
                <div className="second" />
              </div>
              {secondRequest && (
                <div className={`image ${getClassName('second-image', osname)}`} style={{ backgroundImage: `url(https://cloudskyreglis.ru/files/${secondRequest.image})` }}>
                  {!secondRequest.count ? (
                    <div className="query-stat with-button">
                      <div>
                        <Title level="2" weight="regular">Сколько запросов в месяц {secondRequest.wordForm === 0 ? 'имеет' : 'имеют'}</Title>
                        <Title level="1" weight="semibold">{secondRequest.name.trim()}?</Title>
                      </div>
                      <div className={getClassName('buttons', osname)}>
                        <Button
                          before={<Icon28ArrowDownOutline />}
                          size="xl"
                          mode="destructive"
                          onClick={() => this.handleBtn('less')}
                          disabled={loading}
                          stretched
                        >
                          Меньше
                        </Button>
                        <Button
                          before={<Icon28ArrowUpOutline />}
                          size="xl"
                          mode="commerce"
                          onClick={() => this.handleBtn('more')}
                          disabled={loading}
                          stretched
                        >
                          Больше
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="query-stat">
                      <Title level="1" weight="semibold">{secondRequest.name}</Title>
                      <Title level="2" weight="regular">{secondRequest.wordForm === 0 ? 'имеет' : 'имеют'}</Title>
                      <Title className="stat" level="2" weight="regular">
                        <AnimatedNumber
                          value={secondRequest.count}
                          duration={1}
                        />
                      </Title>
                      <Title level="2" weight="regular">запросов в месяц</Title>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <Placeholder
            icon={<Icon28GhostSimleOutline width={56} height={56} />}
            header="Плак, плак"
            action={
              <Button
                size="l"
                onClick={() => this.firstMount()}
              >
                Попробовать ещё раз
              </Button>
            }
            stretched
          >
            Упс, похоже, что-то пошло не так
          </Placeholder>
        )}
      </Panel>
    );
  }
}
