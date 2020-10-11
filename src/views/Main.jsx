import React from 'react';

/*
  Панели
*/
import MainPanel from '../panels/Main/Main.jsx';
import RankingPanel from '../panels/Ranking/Ranking.jsx';

// Компоненты
import ViewLight from '../components/ViewLight.jsx';

export default class extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  render() {
    const {
      id,
      active,
      score,
      popout,
      changeView,
      changePopout,
      onPanelChange,
      isStartScreen,
      modal,
      setActiveModal
    } = this.props;

    return (
      <ViewLight
        id={id}
        activePanel={active.panel}
        popout={popout}
        modal={modal}
        panelList={[
          {
            id: 'main',
            component: MainPanel,
            props: {
              score,
              changeView,
              changePopout,
              onPanelChange,
              isStartScreen,
              setActiveModal
            }
          },
          {
            id: 'ranking',
            component: RankingPanel
          }
        ]}
      />
    );
  }
}
