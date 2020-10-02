import React from 'react';
import {
  Panel,
  PanelHeader,
  PanelHeaderButton,
  platform,
  IOS,
  Spinner,
  Div,
  SimpleCell,
  Avatar,
  List
} from '@vkontakte/vkui';

import Icon24Back from '@vkontakte/icons/dist/24/back';

import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import axios from 'axios';

import './Ranking.scss';

const osname = platform();

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      list: null
    };
  }

  componentDidMount() {
    axios.get('https://googler.skyreglis.studio/api/rest/ranking')
      .then((res) => {
        this.setState({
          list: res.data
        });
      }).catch((err) => console.log(err));
  }

  render() {
    const { id } = this.props;
    const { list } = this.state;

    return (
      <Panel id={id} centered={list === null}>
        <PanelHeader
          left={
            <PanelHeaderButton onClick={() => window.history.back()}>
              {osname === IOS ? <Icon28ChevronBack /> : <Icon24Back />}
            </PanelHeaderButton>
          }
        >
          Рейтинг
        </PanelHeader>
        {list !== null ? (
          <List>
            {list.map((item, index) => (
              <SimpleCell
                key={`user-ranking-item-${index}`}
                target="_blank"
                href={`https://vk.com/id${item.id}`}
                before={<Avatar size={48} src={item.photo_100} />}
                description={`Рекорд: ${item.record}`}
              >
                {item.first_name} {item.last_name}
              </SimpleCell>
            ))}
          </List>
        ) : (
          <Div>
            <Spinner />
          </Div>
        )}
      </Panel>
    );
  }
}
