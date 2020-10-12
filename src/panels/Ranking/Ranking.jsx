import React from 'react';
import bridge from '@vkontakte/vk-bridge';
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
  Placeholder,
  Button,
  FixedLayout,
  Tabs,
  TabsItem, Separator
} from '@vkontakte/vkui';

import { Swipeable } from 'react-swipeable';

import Icon24Back from '@vkontakte/icons/dist/24/back';

import Icon28GhostSimleOutline from '@vkontakte/icons/dist/28/ghost_simle_outline';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';

import queryGet from '../../functions/query_get.jsx';
import { ranking } from '../../api/api';

import './Ranking.scss';

const osname = platform();

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      list: null,
      own: null,
      error: false
    };

    this.getRankingList = this.getRankingList.bind(this);
    this.getFriendsRankingList = this.getFriendsRankingList.bind(this);
  }

  componentDidMount() {
    this.getRankingList();
  }

  async getFriendsRankingList() {
    bridge.sendPromise('VKWebAppGetAuthToken', {
      app_id: Number(queryGet('vk_app_id')),
      scope: 'friends'
    }).then((authInfo) => {
      console.log(authInfo);
      bridge.sendPromise(
        'VKWebAppCallAPIMethod',
        {
          method: 'friends.get',
          request_id: 'random',
          params: {
            v: '5.124',
            access_token: authInfo.access_token
          }
        }
      ).then((userList) => {
        console.log(userList);
        this.getRankingList(userList.response.items);
      });
    });
  }

  async getRankingList(friends) {
    try {
      ranking((ranking) => {
        this.setState({
          list: ranking.list,
          own: ranking.own,
          error: false,
          activeTab: friends ? 'friends' : 'all'
        });
      }, friends, 50);
    } catch (e) {
      this.setState({
        error: true,
        activeTab: friends ? 'friends' : 'all'
      });
    }
  }

  render() {
    const { id } = this.props;
    const {
      list,
      own,
      error,
      activeTab
    } = this.state;

    return (
      <Panel id={id}>
        <PanelHeader
          left={
            <PanelHeaderButton onClick={() => window.history.back()}>
              {osname === IOS ? <Icon28ChevronBack /> : <Icon24Back />}
            </PanelHeaderButton>
          }
          separator={false}
        >
          Рейтинг
        </PanelHeader>
        <Tabs>
          <TabsItem
            onClick={() => this.getRankingList()}
            selected={activeTab === 'all'}
          >
            Общий
          </TabsItem>
          <TabsItem
            onClick={() => this.getFriendsRankingList()}
            selected={activeTab === 'friends'}
          >
            Друзья
          </TabsItem>
        </Tabs>
        <Separator />
        <Swipeable
          className="ranking-swiper"
          onSwipedRight={() => window.history.back()}
        >
          <Div>
            {!error ? (
              list !== null ? (
                list.length !== 0 ? (
                  list.map((item, index) => (
                    <div className="user-wrapper" key={`user-ranking-item-${index}`}>
                      <div className="top-number">{own.user_id === String(item.id) ? 'Вы' : (index + 1)}</div>
                      <SimpleCell
                        target="_blank"
                        href={`https://vk.com/id${item.id}`}
                        before={<Avatar size={48} src={item.photo_100} />}
                        description={`Рекорд: ${item.record}`}
                        multiline
                      >
                        {item.first_name} {item.last_name}
                      </SimpleCell>
                    </div>
                  ))
                ) : (
                  <Placeholder
                    icon={<Icon28GhostSimleOutline width={56} height={56} />}
                    header="Рейтинг пользователей"
                  >
                    Ой, похоже, тут пустовато
                  </Placeholder>
                )
              ) : (
                <Div>
                  <Spinner />
                </Div>
              )
            ) : (
              <Placeholder
                icon={<Icon28GhostSimleOutline width={56} height={56} />}
                header="Плак, плак"
                action={
                  <Button
                    size="l"
                    onClick={() => this.getRankingList()}
                  >
                    Попробовать ещё раз
                  </Button>
                }
              >
                Ой, верните интернет, без него грустно
              </Placeholder>
            )}
          </Div>
        </Swipeable>
        {own && (
          <FixedLayout vertical="bottom">
            <Div className="user-record">
              <div className="user-wrapper">
                {own.position > 50 && (
                  <div className="top-number no-width">~{own.position}</div>
                )}
                <SimpleCell
                  target="_blank"
                  href={`https://vk.com/id${own.user_id}`}
                  before={<Avatar size={48} src={own.photo} />}
                  description={`Рекорд: ${own.record}`}
                  multiline
                >
                  {own.first_name} {own.last_name}
                </SimpleCell>
              </div>
            </Div>
          </FixedLayout>
        )}
      </Panel>
    );
  }
}
