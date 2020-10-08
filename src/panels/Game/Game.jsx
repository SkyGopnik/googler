import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
  Button,
  Panel,
  Title,
  getClassName,
  platform
} from '@vkontakte/vkui';

import Icon28DoneOutline from '@vkontakte/icons/dist/28/done_outline';
import Icon28ArrowUpOutline from '@vkontakte/icons/dist/28/arrow_up_outline';
import Icon28ArrowDownOutline from '@vkontakte/icons/dist/28/arrow_down_outline';

import AnimatedNumber from '../../components/AnimatedNumber.jsx';
import Logo from '../../components/Logo.jsx';

import { game, randomRequests, checkRequest } from '../../api/api.js';

import './Game.scss';

const osname = platform();

let timer;

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      firstRequest: null,
      secondRequest: null,
      score: 0,
      loading: false,
      shadowVisible: false
    };

    this.handleBtn = this.handleBtn.bind(this);
  }

  componentDidMount() {
    const { isStartScreen, changeStartScreen } = this.props;

    if (isStartScreen) {
      setTimeout(() => changeStartScreen(false), 500);
    }

    game((params) => {
      console.log(params);
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
          firstRequest: requests[0],
          secondRequest: requests[1]
        });
        console.log(requests);
      }, 2, true);
    }, 'start');
  }

  componentWillUnmount() {
    clearTimeout(timer);
  }

  handleBtn(type) {
    // TODO: Переписать рейтинг на WSS
    // TODO: Реализовать панель проигрыша по дизайну из фигмы
    // TODO: Реализовать промежуточную панель по дизайну из фигмы
    const {
      changeView,
      changeScore
    } = this.props;
    const {
      firstRequest,
      secondRequest,
      score
    } = this.state;

    this.setState({
      loading: true
    });

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
          game((params) => {
            console.log(params);
            changeScore(params.score);
            changeView('app');
          }, 'end');
        }, 1500);
      }
    }, firstRequest.id, secondRequest.id, type);
  }

  render() {
    const { id } = this.props;
    const {
      firstRequest,
      secondRequest,
      score,
      shadowVisible,
      loading
    } = this.state;

    return (
      <Panel id={id}>
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
                      stretched
                    >
                      Меньше
                    </Button>
                    <Button
                      before={<Icon28ArrowUpOutline />}
                      size="xl"
                      mode="commerce"
                      onClick={() => this.handleBtn('more')}
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
      </Panel>
    );
  }
}
