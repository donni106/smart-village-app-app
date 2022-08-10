import { useFocusEffect } from '@react-navigation/native';
import { DeviceEventEmitter } from 'expo-modules-core';
import React, { useCallback, useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import {
  SafeAreaViewFlex,
  VolunteerConversationsSection,
  VolunteerHeaderProfile,
  VolunteerHomeSection,
  WrapperRow
} from '../../components';
import { colors, consts, normalize, texts } from '../../config';
import { VOLUNTEER_PERSONAL_REFRESH_EVENT } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';

const { ROOT_ROUTE_NAMES } = consts;

const NAVIGATION = {
  CALENDAR_MY_INDEX: {
    name: ScreenName.VolunteerIndex,
    params: {
      title: texts.volunteer.calendarMy,
      query: QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY,
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  CALENDAR_NEW: {
    name: ScreenName.VolunteerForm,
    params: {
      title: 'Termin eintragen',
      query: QUERY_TYPES.VOLUNTEER.CALENDAR,
      queryVariables: {},
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  CONVERSATIONS_INDEX: {
    name: ScreenName.VolunteerIndex,
    params: {
      title: texts.volunteer.conversations,
      query: QUERY_TYPES.VOLUNTEER.CONVERSATIONS,
      queryOptions: {
        refetchInterval: 5000
      },
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  CONVERSATION_NEW: {
    name: ScreenName.VolunteerForm,
    params: {
      title: texts.volunteer.conversationStart,
      query: QUERY_TYPES.VOLUNTEER.CONVERSATION,
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  GROUPS_MY_INDEX: {
    name: ScreenName.VolunteerIndex,
    params: {
      title: texts.volunteer.groupsMy,
      query: QUERY_TYPES.VOLUNTEER.GROUPS_MY,
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  GROUP_NEW: {
    name: ScreenName.VolunteerForm,
    params: {
      title: 'Gruppe/Verein erstellen',
      query: QUERY_TYPES.VOLUNTEER.GROUP,
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  TASKS_INDEX: {
    name: ScreenName.VolunteerIndex,
    params: {
      title: 'Meine Aufgaben',
      query: QUERY_TYPES.VOLUNTEER.TASKS,
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  }
};

export const VolunteerPersonalScreen = ({ navigation }: any) => {
  const refreshPersonal = useCallback(() => {
    // this will trigger the onRefresh functions provided to the `useVolunteerRefresh` hook
    // in other components.
    DeviceEventEmitter.emit(VOLUNTEER_PERSONAL_REFRESH_EVENT);
  }, []);

  useFocusEffect(refreshPersonal);

  useEffect(
    () =>
      navigation.setOptions({
        headerRight: () => (
          <WrapperRow style={styles.headerRight}>
            <VolunteerHeaderProfile navigation={navigation} style={styles.icon} />
          </WrapperRow>
        )
      }),
    [navigation]
  );

  return (
    <SafeAreaViewFlex>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refreshPersonal}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        <VolunteerHomeSection
          linkTitle="Alle meine Gruppen und Vereine anzeigen"
          buttonTitle="Gruppe/Verein erstellen"
          navigateLink={() => navigation.navigate(NAVIGATION.GROUPS_MY_INDEX)}
          navigateButton={() => navigation.navigate(NAVIGATION.GROUP_NEW)}
          navigate={() => navigation.navigate(NAVIGATION.GROUPS_MY_INDEX)}
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.GROUPS_MY}
          sectionTitle="Meine Gruppen und Vereine"
          showLink
          showButton
          isRandom
        />
        <VolunteerHomeSection
          linkTitle="Alle meine Termine anzeigen"
          buttonTitle="Termin eintragen"
          navigateLink={() => navigation.navigate(NAVIGATION.CALENDAR_MY_INDEX)}
          navigateButton={() => navigation.navigate(NAVIGATION.CALENDAR_NEW)}
          navigate={() => navigation.navigate(NAVIGATION.CALENDAR_MY_INDEX)}
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY}
          sectionTitle="Mein Kalender"
        />
        {/* <DataListSection
          linkTitle="Alle Aufgaben anzeigen"
          loading={false}
          navigateLink={() => navigation.navigate(NAVIGATION.TASKS_INDEX)}
          navigate={() => navigation.navigate(NAVIGATION.TASKS_INDEX)}
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.TASKS}
          sectionData={myTasks()}
          sectionTitle="Meine Aufgaben"
          showLink
        /> */}
        <VolunteerConversationsSection
          linkTitle="Alle Nachrichten anzeigen"
          buttonTitle={texts.volunteer.conversationStart}
          navigateLink={() => navigation.navigate(NAVIGATION.CONVERSATIONS_INDEX)}
          navigateButton={() => navigation.navigate(NAVIGATION.CONVERSATION_NEW)}
          navigate={() => navigation.navigate(NAVIGATION.CONVERSATIONS_INDEX)}
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.CONVERSATIONS}
          sectionTitle="Mein Postfach"
          showLink
          showButton
        />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    alignItems: 'center',
    paddingRight: normalize(7)
  },
  icon: {
    paddingHorizontal: normalize(10)
  }
});