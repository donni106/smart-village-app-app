import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, StyleSheet, View } from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
import { Calendar } from 'react-native-calendars';
import { ScrollView, TouchableOpacity } from 'react-native';

import {
  Button,
  HeaderLeft,
  LoadingContainer,
  NoTouchDay,
  RegularText,
  SafeAreaViewFlex,
  WasteCalendarLegend,
  Wrapper,
  WrapperWithOrientation
} from '../components';
import { colors, device, normalize, texts } from '../config';
import { useQuery } from 'react-apollo';
import { getQuery, QUERY_TYPES } from '../queries';
import { useRefreshTime } from '../hooks';
import { graphqlFetchPolicy, setupLocales } from '../helpers';
import { NetworkContext } from '../NetworkProvider';
import { getInAppPermission, showPermissionRequiredAlert } from '../pushNotifications';
import { renderArrow } from '../components';

const dotSize = 6;

setupLocales();

const getMarkedDates = (types, streetData) => {
  let markedDates = {};

  const wasteLocationTypes = streetData?.[QUERY_TYPES.WASTE_ADDRESSES]?.[0]?.wasteLocationTypes;

  if (wasteLocationTypes && types) {
    wasteLocationTypes.forEach((wasteLocationType) => {
      // only add marked dates for known types
      if (!types[wasteLocationType.wasteType]) {
        return;
      }

      const { color, selected_color: selectedColor } = types[wasteLocationType.wasteType];
      wasteLocationType?.listPickUpDates?.forEach((date) => {
        markedDates[date] = {
          dots: [...(markedDates[date]?.dots ?? []), { color, selectedColor }]
        };
      });
    });
  }

  const today = moment().format('YYYY-MM-DD');

  // highlight today
  markedDates[today] = {
    ...(markedDates[today] ?? {}),
    selected: true,
    selectedColor: colors.lighterPrimary
  };

  return markedDates;
};

// show streets that contain the string in it
// return empty list on an exact match (except for capitalization)
const filterStreets = (currentInputValue, streetData) => {
  if (currentInputValue === '') return [];

  return streetData
    ?.filter((street) =>
      getStreetString(street).toLowerCase().includes(currentInputValue.toLowerCase())
    )
    .filter((street) => getStreetString(street) !== currentInputValue)
    .slice(0, 5);
};

const getStreetString = (item) => {
  return `${item.street} (${item.zip} ${item.city})`;
};

export const WasteCollectionScreen = ({ navigation }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [inputValue, setInputValue] = useState('');
  const [selectedStreetId, setSelectedStreetId] = useState();

  const addressesRefreshTime = useRefreshTime('waste-addresses');
  const typesRefreshTime = useRefreshTime('waste-types');
  const streetRefreshTime = useRefreshTime(`waste-${selectedStreetId}`);

  const addressesFetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime: addressesRefreshTime
  });

  const streetFetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime: streetRefreshTime
  });

  const typesFetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime: typesRefreshTime
  });

  const { data, loading } = useQuery(getQuery(QUERY_TYPES.WASTE_ADDRESSES), {
    fetchPolicy: addressesFetchPolicy,
    skip: !addressesRefreshTime
  });

  const { data: typesData, loading: typesLoading } = useQuery(
    getQuery(QUERY_TYPES.PUBLIC_JSON_FILE),
    {
      variables: { name: 'wasteTypes' },
      fetchPolicy: typesFetchPolicy,
      skip: !typesRefreshTime
    }
  );

  // only query if we have a street selected
  const { data: streetData } = useQuery(getQuery(QUERY_TYPES.WASTE_STREET), {
    variables: { ids: selectedStreetId },
    fetchPolicy: streetFetchPolicy,
    skip: !streetRefreshTime || !selectedStreetId
  });

  const addressesData = data?.wasteAddresses;

  let parsedTypesData;
  try {
    if (typesData?.publicJsonFile?.content) {
      parsedTypesData = JSON.parse(typesData.publicJsonFile.content);
    }
  } catch (error) {
    console.warn(error, data);
  }

  let usedTypes = {};
  streetData?.[QUERY_TYPES.WASTE_ADDRESSES]?.[0]?.wasteLocationTypes?.forEach(
    (wasteLocationType) => {
      if (parsedTypesData?.[wasteLocationType.wasteType])
        usedTypes[wasteLocationType.wasteType] = parsedTypesData?.[wasteLocationType.wasteType];
    }
  );

  const renderSuggestion = useCallback(
    ({ item }) => (
      <TouchableOpacity
        onPress={() => {
          setInputValue(getStreetString(item));
          Keyboard.dismiss();
        }}
      >
        <Wrapper>
          <RegularText>{getStreetString(item)}</RegularText>
        </Wrapper>
      </TouchableOpacity>
    ),
    [setInputValue]
  );

  const goToReminder = useCallback(async () => {
    const locationData = {
      city: streetData?.wasteAddresses?.[0]?.city,
      street: streetData?.wasteAddresses?.[0]?.street,
      zip: streetData?.wasteAddresses?.[0]?.zip
    };

    const navigate = () =>
      navigation.navigate('WasteReminder', { wasteTypes: usedTypes, locationData });

    const inAppPushPermission = await getInAppPermission();
    if (inAppPushPermission) {
      navigate();
    } else {
      showPermissionRequiredAlert(navigate);
    }
  }, [navigation, usedTypes, streetData]);

  useEffect(() => {
    if (!addressesData) {
      return;
    }

    const item = addressesData.find(
      (street) => getStreetString(street).toLowerCase() === inputValue.toLowerCase()
    );

    setSelectedStreetId(item?.id);
  }, [addressesData, inputValue, setSelectedStreetId]);

  if (loading || typesLoading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const filteredStreets = filterStreets(inputValue, addressesData);

  return (
    <SafeAreaViewFlex>
      <ScrollView keyboardShouldPersistTaps="handled">
        <WrapperWithOrientation>
          <Autocomplete
            containerStyle={styles.autoCompleteContainer}
            data={filteredStreets}
            defaultValue={inputValue}
            disableFullscreenUI
            onChangeText={(text) => setInputValue(text)}
            placeholder="Straße"
            renderItem={renderSuggestion}
            style={styles.autoCompleteInput}
            listStyle={styles.autoCompleteList}
          />
          <View style={styles.topMarginContainer}>
            <Calendar
              dayComponent={NoTouchDay}
              markedDates={getMarkedDates(parsedTypesData, streetData)}
              markingType="multi-dot"
              renderArrow={renderArrow}
              theme={{
                todayTextColor: colors.primary,
                dotStyle: {
                  borderRadius: dotSize / 2,
                  height: dotSize,
                  width: dotSize
                }
              }}
            />
            <WasteCalendarLegend data={usedTypes} />
          </View>
          {!selectedStreetId && (
            <Wrapper>
              <RegularText center>{texts.wasteCalendar.hint}</RegularText>
            </Wrapper>
          )}
          {!!streetData && !!usedTypes && (
            <Wrapper>
              <Button title={texts.wasteCalendar.configureReminder} onPress={goToReminder} />
            </Wrapper>
          )}
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  autoCompleteContainer:
    device.platform === 'android'
      ? {
          alignSelf: 'center',
          flex: 1,
          position: 'absolute',
          top: 0,
          width: '100%',
          zIndex: 1
        }
      : {},
  autoCompleteInput: {
    color: colors.darkText,
    fontFamily: 'titillium-web-regular',
    fontSize: normalize(16),
    padding: normalize(8)
  },
  autoCompleteList: {
    margin: 0
  },
  topMarginContainer:
    device.platform === 'android'
      ? {
          marginTop: normalize(44)
        }
      : {}
});

WasteCollectionScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: <HeaderLeft navigation={navigation} />
  };
};

WasteCollectionScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
