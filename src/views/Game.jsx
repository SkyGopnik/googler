import React from 'react';

/*
  Панели
*/
import GamePanel from '../panels/Game/Game.jsx';

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
      popout,
      changePopout,
      changeView,
      changeScore
    } = this.props;

    return (
      <ViewLight
        id={id}
        activePanel="game"
        popout={popout}
        panelList={[
          {
            id: 'game',
            component: GamePanel,
            props: {
              changePopout,
              changeView,
              changeScore
            }
          }
        ]}
      />
    );
  }
}
