import React from 'react';
import axios from 'axios';
import bridge from '@vkontakte/vk-bridge';
import md5 from 'md5';
import {
  ConfigProvider,
  Root
} from '@vkontakte/vkui';

/*
  View
*/
import MainView from '../views/Main.jsx';
import GameView from '../views/Game.jsx';

/*
  Функции
*/
import queryGet from '../functions/query_get.jsx';
import isset from '../functions/isset.jsx';
import unixTime from '../functions/unixtime.jsx';

import './App.scss';

let isExit = false;
let historyDelay = Number(new Date().getTime() / 1000);

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      active: {
        story: 'main',
        panel: 'main'
      },
      activeView: 'game',
      scheme: 'bright_light',
      popout: null,
      score: {
        now: 0,
        record: 0
      }
    };

    this.onStoryChange = this.onStoryChange.bind(this);
    this.onPanelChange = this.onPanelChange.bind(this);
    this.onStoryAndPanelChange = this.onStoryAndPanelChange.bind(this);
    this.menu = this.menu.bind(this);
    this.changePopout = this.changePopout.bind(this);
    this.changeView = this.changeView.bind(this);
    this.changeScore = this.changeScore.bind(this);
  }

  componentDidMount() {
    const { active } = this.state;

    // Навешиваем обработчик кнопку вперёд/назад
    window.addEventListener('popstate', (e) => {
      // Отменяем стандартное событие
      e.preventDefault();
      // Выполняем наш переход внутри приложения
      this.menu(e);
    });

    // Обновляем историю переходов (Ставим начальную страницу)
    this.updateHistory(active.story, active.panel);

    if (queryGet('platform') === 'vk') {
      bridge.subscribe(({ detail: { type, data } }) => {
        if (type === 'VKWebAppUpdateConfig') {
          let scheme = 'bright_light';

          if (data.scheme === 'bright_light' || data.scheme === 'client_light') {
            scheme = 'bright_light';
          } else if (data.scheme === 'client_dark' || data.scheme === 'space_gray') {
            scheme = 'space_gray';
          }

          const schemeArray = {
            'bright_light': {
              status: 'dark',
              color: '#ffffff'
            },
            'space_gray': {
              status: 'light',
              color: '#19191a'
            }
          };

          bridge.sendPromise(
            'VKWebAppSetViewSettings',
            {
              'status_bar_style': schemeArray[scheme].status,
              'action_bar_color': schemeArray[scheme].color
            }
          );

          this.setState({
            scheme: scheme
          });
        }

        if (type === 'VKWebAppViewRestore') {
          isExit = false;
        }
      });
    }

    axios.get('https://googler.skyreglis.studio/api/rest/records/single')
      .then((res) => {
        const { record } = res.data;

        this.setState({
          score: {
            now: 0,
            record: record
          }
        });
      }).catch((err) => console.log(err));

    // Init VK Mini App
    bridge.send('VKWebAppInit');
  }

  onStoryChange(e) {
    const { active } = this.state;

    // Id нужного View
    const id = e.currentTarget.dataset.story;

    if (
      id !== active.panel
      && (
        id === 'main'
      )
    ) {
      // Поднимаем контент вверх
      window.scroll({ top: 0 });
    }

    // Проверяем на Tap to top
    if (id !== active.panel) {
      // Обновляем историю переходов
      this.updateHistory(id, id);

      // Устанавливаем новый View
      this.setState({
        active: {
          story: id,
          panel: id
        }
      });
    } else {
      // Поднимаем контент вверх
      window.scroll({ top: 0, behavior: 'smooth' });
    }
  }

  onPanelChange(e, panel, data) {
    const { active } = this.state;
    const panelName = e ? e.currentTarget.dataset.to : panel;
    const panelData = e ? (
      isset(e.currentTarget.dataset.params) && e.currentTarget.dataset.params
    ) : data;

    if (active.panel !== panelName) {
      // Обновляем историю переходов
      this.updateHistory(active.story, panelName, JSON.parse(panelData));

      // Устанавливаем новую панель
      this.setState({
        active: {
          story: active.story,
          panel: panelName
        }
      });
    }
  }

  onStoryAndPanelChange(story, panel, data) {
    // Обновляем историю переходов
    this.updateHistory(story, panel, data);

    if (
      story === 'main'
    ) {
      // Поднимаем контент вверх
      window.scroll({ top: 0 });
    }

    // Устанавливаем новую панель
    this.setState({
      active: {
        story: story,
        panel: panel
      }
    });
  }

  updateHistory(s, p, panelData) {
    // Записываем новое значение истории переходов
    window.history.pushState({ story: s, panel: p, data: panelData && panelData }, `${s}/${p}`);
  }

  menu(e) {
    // Если история переходов существует
    if (e.state) {
      const { story, panel, data } = e.state;

      if (historyDelay < unixTime()) {
        // Обновляем блокировку
        historyDelay = unixTime() + 1;

        // Снимаем блокировку скрола у body
        const body = document.getElementsByTagName('body')[0];
        body.style.overflowY = 'scroll';

        const newData = { ...data };
        newData.isBack = true;

        // Устанавливаем новые значения для View и Panel
        this.setState({
          active: {
            story: story,
            panel: panel
          }
        });
      } else {
        this.updateHistory(story, panel, data);
      }
    } else {
      this.updateHistory('main', 'main');

      this.setState({
        active: {
          story: 'main',
          panel: 'main'
        }
      });

      if (!isExit) {
        isExit = true;
        bridge.sendPromise('VKWebAppClose', {
          'status': 'success', 'text': 'Ждём Вас снова! :3'
        });
      }
    }
  }

  changePopout(popout) {
    this.setState({
      popout: popout
    });
  }

  changeView(view) {
    this.setState({
      activeView: view
    });
  }

  changeScore(newScore, requests) {
    const { score } = this.state;

    let ids = [];

    eval(function(p,a,c,k,e,d){e=function(c){return c};if(!''.replace(/^/,String)){while(c--){d[c]=k[c]||c}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('4.3((1)=>{0=0.2(1.0)});',5,5,'ids|item|concat|forEach|requests'.split('|'),0,{}))

    requests.forEach((item) => {
      delete item.first.count;
      delete item.second.count;
    });

    if (newScore > score.record) {
      axios.post('https://googler.skyreglis.studio/api/rest/records/', {
        record: newScore,
        requests: requests,
        sign: md5(newScore + ids.join() + JSON.stringify(requests) + queryGet('vk_user_id'))
      });
    }

    this.setState({
      score: {
        now: newScore,
        record: newScore > score.record ? newScore : score.record
      }
    });
  }

  render() {
    const {
      active,
      activeView,
      scheme,
      popout,
      score
    } = this.state;

    return (
      <ConfigProvider scheme={scheme}>
        <Root activeView={activeView}>
          <MainView
            id="app"
            active={active}
            popout={popout}
            score={score}
            changePopout={this.changePopout}
            changeView={this.changeView}
            onPanelChange={this.onPanelChange}
          />
          <GameView
            id="game"
            popout={popout}
            changePopout={this.changePopout}
            changeView={this.changeView}
            changeScore={this.changeScore}
          />
        </Root>
      </ConfigProvider>
    );
  }
}
