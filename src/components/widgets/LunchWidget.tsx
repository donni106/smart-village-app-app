import moment from 'moment';
import React, { useCallback, useContext } from 'react';
import { useQuery } from 'react-apollo';

import { colors, consts, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { useRefreshTime } from '../../hooks';
import { useHomeRefresh } from '../../hooks/HomeRefresh';
import { lunch } from '../../icons';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { WidgetProps } from '../../types';
import { DefaultWidget } from './DefaultWidget';

export const LunchWidget = ({ navigation, text }: WidgetProps) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const refreshTime = useRefreshTime('lunch-widget', consts.REFRESH_INTERVALS.ONCE_PER_HOUR);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  const currentDate = moment().format('YYYY-MM-DD');

  const variables = {
    dateRange: [currentDate, currentDate]
  };

  const { data, refetch } = useQuery(getQuery(QUERY_TYPES.LUNCHES), {
    fetchPolicy,
    variables,
    skip: !refreshTime
  });

  const onPress = useCallback(
    () => navigation.navigate('Lunch', { title: text ?? texts.widgets.lunch }),
    [navigation, text]
  );

  useHomeRefresh(refetch);

  return (
    <DefaultWidget
      icon={lunch(colors.primary)}
      count={data?.[QUERY_TYPES.LUNCHES]?.length}
      onPress={onPress}
      text={text ?? texts.widgets.lunch}
    />
  );
};
