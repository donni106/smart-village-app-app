import { useFocusEffect } from '@react-navigation/native';
import _sortBy from 'lodash/sortBy';
import _uniqBy from 'lodash/uniqBy';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { Divider } from 'react-native-elements';

import { NetworkContext } from '../../NetworkProvider';
import { SettingsContext } from '../../SettingsProvider';
import {
  Button,
  Calendar,
  CalendarListToggle,
  DropdownHeader,
  EmptyMessage,
  ListComponent,
  LoadingContainer,
  OptionToggle,
  RegularText,
  SafeAreaViewFlex,
  Wrapper
} from '../../components';
import { colors, texts } from '../../config';
import { graphqlFetchPolicy, openLink, parseListItemsFromQuery } from '../../helpers';
import { useOpenWebScreen, useVolunteerData } from '../../hooks';
import { QUERY_TYPES, getFetchMoreQuery, getQuery } from '../../queries';

const keyForSelectedValueByQuery = (isLocationFilter) =>
  isLocationFilter ? 'location' : 'categoryId';

const getAdditionalQueryVariables = (selectedValue, isLocationFilter) => {
  const keyForSelectedValue = keyForSelectedValueByQuery(isLocationFilter);
  const additionalQueryVariables = {};

  if (selectedValue) {
    additionalQueryVariables[keyForSelectedValue] = selectedValue;
  }

  return additionalQueryVariables;
};

const hasFilterSelection = (isLocationFilter, queryVariables) => {
  return !!Object.prototype.hasOwnProperty.call(queryVariables, [
    keyForSelectedValueByQuery(isLocationFilter)
  ]);
};

const today = moment().format('YYYY-MM-DD');

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const EventRecords = ({ navigation, route }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { filter = {}, hdvt = {}, settings = {}, sections = {} } = globalSettings;
  const { events: showEventsFilter = true, eventLocations: showEventLocationsFilter = false } =
    filter;
  const { events: showVolunteerEvents = false } = hdvt;
  const { calendarToggle = false } = settings;
  const { eventListIntro } = sections;
  const query = route.params?.query ?? '';
  const [queryVariables, setQueryVariables] = useState(route.params?.queryVariables || {});
  const [refreshing, setRefreshing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [filterByDailyEvents, setFilterByDailyEvents] = useState(
    route.params?.filterByDailyEvents ?? false
  );
  const title = route.params?.title ?? '';
  const showFilter = (route.params?.showFilter ?? true) && showEventsFilter;
  const showFilterByDailyEvents =
    (route.params?.showFilterByDailyEvents ?? showFilter) && !showCalendar;
  const hasDailyFilterSelection = !!queryVariables.dateRange;
  const openWebScreen = useOpenWebScreen(title, eventListIntro?.url);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });

  const { data, loading, fetchMore, refetch, networkStatus } = useQuery(
    getQuery(QUERY_TYPES.EVENT_RECORDS),
    {
      fetchPolicy,
      variables: queryVariables,
      skip: showCalendar
    }
  );

  const { data: eventRecordsAddressesData, loading: eventRecordsAddressesLoading } = useQuery(
    getQuery(QUERY_TYPES.EVENT_RECORDS_ADDRESSES),
    {
      skip: !showEventLocationsFilter
    }
  );

  const { data: eventRecordsCategoriesData, loading: eventRecordsCategoriesLoading } = useQuery(
    getQuery(QUERY_TYPES.EVENT_RECORDS_AND_CATEGORIES),
    {
      skip: !showEventsFilter
    }
  );

  const { data: dataVolunteerEvents, refetch: refetchVolunteerEvents } = useVolunteerData({
    query: QUERY_TYPES.VOLUNTEER.CALENDAR_ALL,
    queryVariables: route.params?.queryVariables,
    queryOptions: { enabled: showVolunteerEvents && !loading },
    isCalendar: true,
    isSectioned: true
  });

  const updateListDataByDropdown = useCallback(
    (selectedValue, isLocationFilter) => {
      if (selectedValue) {
        setQueryVariables((prevQueryVariables) => {
          // remove a refetch key if present, which was necessary for the "- Alle -" selection
          delete prevQueryVariables.refetch;

          return {
            ...prevQueryVariables,
            ...getAdditionalQueryVariables(selectedValue, isLocationFilter)
          };
        });
      } else {
        if (hasFilterSelection(isLocationFilter, queryVariables)) {
          setQueryVariables((prevQueryVariables) => {
            // remove the filter key for the specific query if present, when selecting "- Alle -"
            delete prevQueryVariables[keyForSelectedValueByQuery(isLocationFilter)];

            return { ...prevQueryVariables, refetch: true };
          });
        }
      }
    },
    [query, queryVariables]
  );

  const updateListDataByDailySwitch = useCallback(() => {
    // update switch state as well
    setFilterByDailyEvents((oldSwitchValue) => {
      // if `oldSwitchValue` was false, we now activate the daily filter and set a date range
      if (!oldSwitchValue) {
        setQueryVariables((prevQueryVariables) => {
          // remove a refetch key if present, which was necessary for unselecting daily events
          delete prevQueryVariables.refetchDate;

          // add the filter key for the specific query, when filtering for daily events
          return { ...prevQueryVariables, dateRange: [today, today] };
        });
      } else {
        setQueryVariables((prevQueryVariables) => {
          // remove the filter key for the specific query, when unselecting daily events
          delete prevQueryVariables.dateRange;

          return { ...prevQueryVariables, refetchDate: true };
        });
      }

      return !oldSwitchValue;
    });
  }, [filterByDailyEvents, queryVariables]);

  // apply additional data if volunteer events should be presented and no filter selection is made,
  // because filtered data for category or location has nothing to do with volunteer data
  const additionalData =
    showVolunteerEvents &&
    !hasFilterSelection(false, queryVariables) &&
    !(showEventLocationsFilter && hasFilterSelection(true, queryVariables))
      ? dataVolunteerEvents
      : undefined;

  const listItems = useMemo(() => {
    let parsedListItems = parseListItemsFromQuery(QUERY_TYPES.EVENT_RECORDS, data, undefined, {
      withDate: false,
      withTime: true
    });

    if (additionalData?.length) {
      let filteredAdditionalData;

      if (hasDailyFilterSelection) {
        // filter additionalData on given or current day
        filteredAdditionalData = additionalData.filter(
          (item) => item.listDate === (queryVariables.dateRange?.[0] ?? today)
        );
      }

      parsedListItems.push(...(filteredAdditionalData ?? additionalData));
      parsedListItems = _sortBy(parsedListItems, (item) => item.listDate);
    }

    return parsedListItems;
  }, [additionalData, data, hasDailyFilterSelection, query, queryVariables]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    if (isConnected) {
      await refetch();
      showVolunteerEvents && refetchVolunteerEvents();
    }
    setRefreshing(false);
  }, [isConnected, refetch, refetchVolunteerEvents, setRefreshing, showVolunteerEvents]);

  useFocusEffect(
    useCallback(() => {
      if (isConnected && !showCalendar) {
        refetch();
        showVolunteerEvents && refetchVolunteerEvents();
      }
    }, [isConnected, refetch, refetchVolunteerEvents, showCalendar, showVolunteerEvents])
  );

  const fetchMoreData = () => {
    if (showCalendar) return { data: { [query]: [] } };

    return fetchMore({
      query: getFetchMoreQuery(query),
      variables: {
        ...queryVariables,
        offset: data?.[query]?.length
      },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        if (!fetchMoreResult?.[query]?.length) return prevResult;

        const uniqueData = _uniqBy([...prevResult[query], ...fetchMoreResult[query]], 'id');

        return {
          ...prevResult,
          [query]: uniqueData
        };
      }
    });
  };

  if (!query) return null;

  if (
    // show loading indicator if loading but not if refetching (network status 4 means refetch)
    (!data && loading && networkStatus !== 4) ||
    eventRecordsAddressesLoading ||
    eventRecordsCategoriesLoading
  ) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  return (
    <SafeAreaViewFlex>
      {calendarToggle && !hasDailyFilterSelection && (
        <CalendarListToggle showCalendar={showCalendar} setShowCalendar={setShowCalendar} />
      )}
      <ListComponent
        ListHeaderComponent={
          <>
            {!!eventListIntro && (
              <>
                {!!eventListIntro.introText && (
                  <Wrapper>
                    <RegularText small>{eventListIntro.introText}</RegularText>
                  </Wrapper>
                )}

                {!!eventListIntro.url && !!eventListIntro.buttonTitle && (
                  <Wrapper>
                    <Button
                      onPress={() => openLink(eventListIntro.url, openWebScreen)}
                      title={eventListIntro.buttonTitle}
                    />
                  </Wrapper>
                )}
                <Divider />
              </>
            )}
            {!!showFilter && (
              <>
                {!!eventRecordsCategoriesData && (
                  <DropdownHeader
                    {...{
                      data: eventRecordsCategoriesData,
                      query,
                      queryVariables,
                      updateListData: updateListDataByDropdown
                    }}
                  />
                )}

                {!!eventRecordsAddressesData && (
                  <DropdownHeader
                    {...{
                      data: eventRecordsAddressesData,
                      isLocationFilter: true,
                      query,
                      queryVariables,
                      updateListData: updateListDataByDropdown
                    }}
                  />
                )}

                {showFilterByDailyEvents && (
                  <OptionToggle
                    label={texts.eventRecord.filterByDailyEvents}
                    onToggle={updateListDataByDailySwitch}
                    value={filterByDailyEvents}
                  />
                )}
              </>
            )}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <LoadingContainer>
              <ActivityIndicator color={colors.accent} />
            </LoadingContainer>
          ) : showCalendar ? (
            <Calendar
              isListRefreshing={refreshing}
              query={query}
              queryVariables={queryVariables}
              navigation={navigation}
              additionalData={additionalData}
            />
          ) : (
            <EmptyMessage title={texts.empty.list} showIcon />
          )
        }
        navigation={navigation}
        data={loading || showCalendar ? [] : listItems}
        horizontal={false}
        sectionByDate={!showCalendar}
        query={query}
        queryVariables={queryVariables}
        fetchMoreData={fetchMoreData}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
        showBackToTop
      />
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

EventRecords.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
