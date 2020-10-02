import React from 'react';
import axios from 'axios';
import {
  Button,
  Panel,
  Title,
  PopoutWrapper
} from '@vkontakte/vkui';

import Icon28DoneOutline from '@vkontakte/icons/dist/28/done_outline';

import AnimatedNumber from '../../components/AnimatedNumber.jsx';

import './Game.scss';

let timer;

function decode(text) {
  var textLetter, keyLetter, result = "", conv = decode ? -1 : 1;

  eval(function(p,a,c,k,e,d){e=function(c){return c.toString(36)};if(!''.replace(/^/,String)){while(c--){d[c.toString(a)]=k[c]||c.toString(a)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('e(2=1=0;2<7.8;2++,1++){d(1>=\'6 5 4\'.8)1=0;c+=b.a(7.3(2)+9*\'6 5 4\'.3(1))}',15,15,'|keyLetter|textLetter|charCodeAt|top|is|googler|text|length|conv|fromCharCode|String|result|if|for'.split('|'),0,{}))

  return result;
}

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      currentRequestIndex: 1,
      requests: [],
      firstRequest: null,
      secondRequest: null,
      requestHistory: [],
      score: 0
    };

    this.getRandomRequest = this.getRandomRequest.bind(this);
    this.handleBtn = this.handleBtn.bind(this);
  }

  componentDidMount() {
    axios.get('https://googler.skyreglis.studio/api/rest/requests/random?limit=10')
      .then((res) => {
        const requests = res.data;
        const newRequestsArray = [];

        requests.forEach((item) => {
          const img = new Image();
          img.src = `https://cloudskyreglis.ru/files/${item.image}`;

          newRequestsArray.push({
            id: item.id,
            name: item.name,
            count: Number(decode(item.count)),
            image: item.image
          });
        });

        this.setState({
          requests: newRequestsArray,
          firstRequest: newRequestsArray[0],
          secondRequest: newRequestsArray[1]
        });
      }).catch((err) => console.log(err));
  }

  componentWillUnmount() {
    clearTimeout(timer);
  }

  getRandomRequest() {
    const { requests } = this.state;

    axios.get(`https://googler.skyreglis.studio/api/rest/requests/random?limit=5&lastId=${requests[requests.length - 1].id}`)
      .then((res) => {
        const newRequestsArray = [];

        res.data.forEach((item) => {
          const img = new Image();
          img.src = `https://cloudskyreglis.ru/files/${item.image}`;

          newRequestsArray.push({
            id: item.id,
            name: item.name,
            count: Number(decode(item.count)),
            image: item.image
          });
        });

        const newRequests = requests.concat(newRequestsArray);

        this.setState({
          requests: newRequests
        });
      }).catch((err) => console.log(err));
  }

  handleBtn(type) {
    const {
      changePopout,
      changeView,
      changeScore
    } = this.props;
    const {
      currentRequestIndex,
      requests,
      firstRequest,
      secondRequest,
      requestHistory,
      score
    } = this.state;

    const checkCount = type === 'more' ? (
      firstRequest.count < secondRequest.count
    ) : firstRequest.count > secondRequest.count;

    if (checkCount) {
      changePopout(
        <PopoutWrapper alignY="center" alignX="center" hasMask={false}>
          <div className="ScreenIcon">
            <Icon28DoneOutline width={44} height={44} />
          </div>
        </PopoutWrapper>
      );

      timer = setTimeout(() => {
        changePopout(null);
      }, 500);

      const secondId = currentRequestIndex + 1;

      if (requests.length - 5 === secondId) {
        this.getRandomRequest();
      }

      const newRequestHistory = requestHistory;
      newRequestHistory.push({
        ids: [firstRequest.id, secondRequest.id],
        first: firstRequest,
        second: secondRequest,
        type: type
      });

      this.setState({
        currentRequestIndex: secondId,
        score: score + 1,
        firstRequest: { ...secondRequest },
        secondRequest: requests[secondId],
        requestHistory: newRequestHistory
      });
    } else {
      changeScore(score, requestHistory);
      changeView('app');
    }
  }

  render() {
    const { id } = this.props;
    const {
      firstRequest,
      secondRequest,
      score
    } = this.state;

    return (
      <Panel id={id}>
        <div className="content">
          <div className="score">
            <Title level="2" weight="medium">
              Счёт: {score}
            </Title>
          </div>
          {firstRequest && (
            <div className="image">
              <div className="query-stat">
                <Title level="1" weight="bold">{firstRequest.name}</Title>
                <Title level="2" weight="medium">имеет</Title>
                <Title className="stat" level="2" weight="bold">
                  <AnimatedNumber
                    value={firstRequest.count}
                    duration={1}
                  />
                </Title>
                <Title level="3" weight="medium">запросов в месяц</Title>
              </div>
              <img src={`https://cloudskyreglis.ru/files/${firstRequest.image}`} alt="" />
            </div>
          )}
          {secondRequest && (
            <div className="image">
              <div className="query-stat">
                <Title level="1" weight="bold">{secondRequest.name}</Title>
                <Title level="2" weight="medium">имеет</Title>
                <div className="buttons">
                  <Button
                    size="l"
                    mode="commerce"
                    onClick={() => this.handleBtn('more')}
                  >
                    Больше
                  </Button>
                  <Button
                    size="l"
                    mode="destructive"
                    onClick={() => this.handleBtn('less')}
                  >
                    Меньше
                  </Button>
                </div>
                <Title level="3" weight="medium">запросов в месяц</Title>
              </div>
              <img src={`https://cloudskyreglis.ru/files/${secondRequest.image}`} alt="" />
            </div>
          )}
        </div>
      </Panel>
    );
  }
}
