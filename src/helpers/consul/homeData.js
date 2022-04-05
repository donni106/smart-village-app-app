import { ScreenName } from '../../types';
import { QUERY_TYPES } from '../../queries';
import { texts } from '../../config';

const query = QUERY_TYPES.CONSUL;
const text = texts.consul.homeScreen;

export const homeData = [
  {
    title: text.general,
    data: [
      {
        routeName: ScreenName.ConsulIndexScreen,
        params: {
          title: text.debates,
          query: query.DEBATES,
          queryVariables: { limit: 15, order: 'name_ASC', category: text.debates },
          rootRouteName: ScreenName.ConsulHomeScreen
        },
        subtitle: null,
        title: text.debates
      },
      {
        routeName: ScreenName.ConsulIndexScreen,
        params: {
          title: text.proposals,
          query: query.PROPOSALS,
          queryVariables: { limit: 15, order: 'name_ASC', category: text.proposals },
          rootRouteName: ScreenName.ConsulHomeScreen
        },
        subtitle: null,
        title: text.proposals
      },
      {
        routeName: ScreenName.ConsulIndexScreen,
        params: {
          title: text.voting,
          query: query.POLLS,
          queryVariables: { filter: 'current' },
          rootRouteName: ScreenName.ConsulHomeScreen
        },
        subtitle: null,
        title: text.voting
      }
    ]
  },
  {
    title: text.personal,
    data: [
      { routeName: { name: null }, params: {}, subtitle: null, title: text.debates },
      { routeName: { name: null }, params: {}, subtitle: null, title: text.proposals },
      { routeName: { name: null }, params: {}, subtitle: null, title: text.voting }
    ]
  },
  {
    title: text.account,
    data: [
      {
        routeName: ScreenName.ConsulUserSettingsScreen,
        params: {
          title: text.settings,
          query: null,
          queryVariables: { limit: 15, order: 'name_ASC', category: text.settings },
          rootRouteName: ScreenName.ConsulHomeScreen
        },
        subtitle: null,
        title: text.settings
      },
      { routeName: { name: null }, params: {}, subtitle: null, title: text.logout }
    ]
  }
];
