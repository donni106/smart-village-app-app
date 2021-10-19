/* eslint-disable react/prop-types */
import React, { useCallback, useContext } from 'react';

import { consts } from '../config';
import { SettingsContext } from '../SettingsProvider';
import { CardListItem } from '../components/CardListItem';
import { TextListItem } from '../components/TextListItem';
import { QUERY_TYPES } from '../queries';

const { LIST_TYPES } = consts;

const getListType = (query, listTypesSettings) => {
  switch (query) {
    case QUERY_TYPES.POINTS_OF_INTEREST:
    case QUERY_TYPES.TOURS:
      return listTypesSettings[QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS];
    default:
      return listTypesSettings[query];
  }
};

export const useRenderItem = (query, navigation, options = {}) => {
  const { listTypesSettings } = useContext(SettingsContext);

  const listType = getListType(query, listTypesSettings);

  let renderItem;

  switch (listType) {
    case LIST_TYPES.CARD_LIST: {
      renderItem = ({ item }) => (
        <CardListItem navigation={navigation} horizontal={options.horizontal} item={item} />
      );
      break;
    }
    case LIST_TYPES.IMAGE_TEXT_LIST: {
      renderItem = ({ item }) => (
        <TextListItem {...{ navigation, item, noSubtitle: options.noSubtitle, leftImage: true }} />
      );
      break;
    }
    default: {
      renderItem = ({ item }) => (
        <TextListItem {...{ navigation, item, noSubtitle: options.noSubtitle }} />
      );
      break;
    }
  }

  return useCallback(renderItem, [
    query,
    listType,
    navigation,
    options.horizontal,
    options.noSubtitle
  ]);
};
