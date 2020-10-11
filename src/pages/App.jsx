import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
  ConfigProvider,
  Root,
  ModalRoot,
  ModalCard
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

import { userAuth, record } from '../api/api.js';

import NoConnectionGif from '../img/no-connection.gif'; // Гифка - нет соединения

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
      activeView: 'app',
      scheme: 'bright_light',
      popout: null,
      score: {
        now: 0,
        record: 0
      },
      activeModal: null,
      modalContent: null,
      modalHistory: [],
      renderApp: false,
      isStartScreen: true
    };

    this.modalBack = () => {
      console.log('back');
      const { modalHistory } = this.state;
      // Снимаем блокировку скрола у body
      const body = document.getElementsByTagName('body')[0];
      body.style.overflowY = 'scroll';

      this.setActiveModal(modalHistory[modalHistory.length - 2]);
    };

    this.onStoryChange = this.onStoryChange.bind(this);
    this.onPanelChange = this.onPanelChange.bind(this);
    this.onStoryAndPanelChange = this.onStoryAndPanelChange.bind(this);
    this.menu = this.menu.bind(this);
    this.changePopout = this.changePopout.bind(this);
    this.changeView = this.changeView.bind(this);
    this.changeScore = this.changeScore.bind(this);
    this.changeStartScreen = this.changeStartScreen.bind(this);
    this.setActiveModal = this.setActiveModal.bind(this);
  }

  componentDidMount() {
    userAuth((valid) => {
      console.log('userAuth');
      if (valid) {
        record((record) => {
          this.setState({
            score: {
              now: 0,
              record: record
            },
            renderApp: true
          });
        });
      } else {
        console.log(valid);
      }
    });

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

  setActiveModal(activeModal, params) {
    console.log('open');
    const { modalHistory } = this.state;

    activeModal = activeModal || null;
    let newModalHistory = modalHistory ? [...modalHistory] : [];

    console.log(newModalHistory);
    if (activeModal === null) {
      newModalHistory = [];
      console.log('test1');
    } else if (newModalHistory.indexOf(activeModal) !== -1) {
      newModalHistory = newModalHistory.splice(0, newModalHistory.indexOf(activeModal) + 1);
      console.log('test2');
    } else {
      // Блокируем скрол у body
      const body = document.getElementsByTagName('body')[0];
      body.style.overflowY = 'hidden';

      newModalHistory.push(activeModal);
      console.log('test3');
    }

    this.setState({
      activeModal: activeModal,
      modalHistory: newModalHistory,
      modalContent: params
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

  changeScore(newScore) {
    const { score } = this.state;

    this.setState({
      score: {
        now: newScore,
        record: newScore > score.record ? newScore : score.record
      }
    });
  }

  async changeStartScreen(param) {
    this.setState({
      isStartScreen: param
    });
  }

  render() {
    const {
      active,
      activeView,
      scheme,
      popout,
      score,
      renderApp,
      isStartScreen,
      activeModal,
      modalContent
    } = this.state;
    const modal = (
      <ModalRoot
        activeModal={activeModal}
        onClose={this.modalBack}
      >
        <ModalCard
          id="connections-lost"
          onClose={this.modalBack}
          icon={<img width={90} height={70} src={NoConnectionGif} alt="Нет соединения" />}
          header="Потеряно интернет соединение"
          caption="Возможно, это связано с отсутствием интернет-соединения у Вашего устройства. Попробуйте перезагрузить устройство, маршрутизатор и приложение."
          actions={[{
            title: 'Попробовать ещё раз',
            mode: 'primary',
            action: () => modalContent.update()
          }]}
        />
      </ModalRoot>
    );

    if (renderApp) {
      return (
        <ConfigProvider scheme={scheme}>
          <Root activeView={activeView}>
            <MainView
              id="app"
              modal={modal}
              active={active}
              popout={popout}
              score={score}
              isStartScreen={isStartScreen}
              changePopout={this.changePopout}
              changeView={this.changeView}
              onPanelChange={this.onPanelChange}
              setActiveModal={this.setActiveModal}
            />
            <GameView
              id="game"
              modal={modal}
              popout={popout}
              isStartScreen={isStartScreen}
              mainScore={score}
              changeStartScreen={this.changeStartScreen}
              changePopout={this.changePopout}
              changeView={this.changeView}
              changeScore={this.changeScore}
              setActiveModal={this.setActiveModal}
            />
          </Root>
        </ConfigProvider>
      );
    }

    return null;
  }
}
