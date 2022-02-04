import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { useQuery } from 'react-apollo';

import { useHomeRefresh } from '../hooks';
import { getQuery } from '../queries';

import { DataListSection } from './DataListSection';

type Props = {
  title: string;
  titleDetail?: string;
  buttonTitle: string;
  fetchPolicy:
    | 'cache-first'
    | 'network-only'
    | 'cache-only'
    | 'no-cache'
    | 'standby'
    | 'cache-and-network';
  navigate: () => void;
  navigation: StackNavigationProp<any>;
  placeholder?: React.ReactElement;
  query: string;
  queryVariables: { limit?: number };
};

export const HomeSection = ({
  buttonTitle,
  title,
  titleDetail,
  fetchPolicy,
  navigate,
  navigation,
  placeholder,
  query,
  queryVariables
}: Props) => {
  const { data, loading, refetch } = useQuery(getQuery(query), {
    variables: queryVariables,
    fetchPolicy
  });

  useHomeRefresh(refetch);

  return (
    <DataListSection
      buttonTitle={buttonTitle}
      limit={queryVariables?.limit}
      loading={loading}
      navigate={navigate}
      navigation={navigation}
      placeholder={placeholder}
      query={query}
      sectionData={data}
      sectionTitle={title}
      sectionTitleDetail={titleDetail}
      showButton
    />
  );
};
