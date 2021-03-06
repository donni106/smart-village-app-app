import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { FlatList, NavigationScreenProp } from 'react-navigation';

import {
  DropdownSelect,
  HeaderLeft,
  RegularText,
  SafeAreaViewFlex,
  Wrapper
} from '../../components';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { OParlPreviewComponent } from '../../components/oParl';
import { colors, normalize, texts } from '../../config';
import { useOParlQuery } from '../../hooks';
import {
  simpleOrganizationListQuery,
  organizationMembershipQuery,
  personListQuery
} from '../../queries/OParl';
import {
  OrganizationListData,
  OrganizationPeopleData,
  OrganizationPreviewData,
  PersonPreviewData
} from '../../types';

type Props = {
  navigation: NavigationScreenProp<never>;
};

const pageSize = 30;

const [organizationMembersQuery, organizationMembersQueryName] = organizationMembershipQuery;
const [orgaListQuery, orgaListQueryName] = simpleOrganizationListQuery;
const [personQuery, personQueryName] = personListQuery;

const useDropdownData = (orgaData?: { [organizationMembersQueryName]: OrganizationListData[] }) => {
  const [dropdownData, setDropdownData] = useState<
    Array<{ value: string; id: string; selected?: boolean }>
  >([{ value: texts.oparl.personList.chooseAnOrg, id: '', selected: true }]);

  useEffect(() => {
    const organizations =
      orgaData?.[organizationMembersQueryName].filter((org) => org.membership?.length) ?? [];
    const newData = [{ value: texts.oparl.personList.chooseAnOrg, id: '', selected: true }];
    newData.push(
      ...organizations.map((value: OrganizationPreviewData) => ({
        value: value.name ?? value.shortName ?? value.id,
        id: value.id,
        selected: false
      }))
    );
    setDropdownData(newData);
  }, [orgaData, setDropdownData]);

  return [dropdownData, setDropdownData] as const;
};

const useListData = (
  organization?: OrganizationPeopleData,
  personData?: { [personQueryName]: PersonPreviewData[] }
) => {
  const [listData, setListData] = useState<PersonPreviewData[]>([]);

  useEffect(() => {
    const persons = personData?.[personQueryName] ?? [];

    if (organization) {
      setListData(
        organization.membership
          ?.map((membership) => membership.person)
          .filter<PersonPreviewData>(
            // we filter out the undefined values here, so the result is an array of PersonPreviews
            (person): person is PersonPreviewData => !!person && !person.deleted
          ) ?? []
      );
    } else {
      setListData((persons ?? []).filter((person: PersonPreviewData) => !person.deleted));
    }
  }, [organization, personData, setListData]);

  return listData;
};

export const OParlPersonsScreen = ({ navigation }: Props) => {
  const [fetchingMore, setFetchingMore] = useState(false);
  const [finished, setFinished] = useState(false);
  const { data: orgaListData, loading: orgaListLoading, error: orgaListError } = useOParlQuery<{
    [orgaListQueryName]: OrganizationListData[];
  }>(orgaListQuery);

  const {
    data: personData,
    loading: personLoading,
    error: personError,
    fetchMore: personFetchMore
  } = useOParlQuery<{
    [personQueryName]: PersonPreviewData[];
  }>(personQuery, { variables: { pageSize } });

  const [dropdownData, setDropdownData] = useDropdownData(orgaListData);

  const organizations = orgaListData?.[orgaListQueryName] ?? [];

  const selectedDropdownEntry = dropdownData?.find((entry) => entry.selected)?.id;

  const selectedOrganization = selectedDropdownEntry?.length
    ? organizations?.find(
        (singleOrg: OrganizationPreviewData) => singleOrg.id === selectedDropdownEntry
      )
    : undefined;

  const { data: orgaData, loading: orgaLoading, error: orgaError } = useOParlQuery<{
    [organizationMembersQueryName]: OrganizationPeopleData[];
  }>(organizationMembersQuery, {
    variables: { id: selectedOrganization?.id },
    skip: !selectedOrganization?.id
  });

  const listData = useListData(orgaData?.[organizationMembersQueryName][0], personData);

  const onEndReached = async () => {
    if (fetchingMore) return;

    setFetchingMore(true);
    await personFetchMore({
      variables: { pageSize, offset: personData?.[personQueryName]?.length },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.[personQueryName].length) {
          setFinished(true);
          return prev;
        }
        return Object.assign({}, prev, {
          [personQueryName]: [...prev[personQueryName], ...fetchMoreResult[personQueryName]]
        });
      }
    });
    setFetchingMore(false);
  };

  if (orgaListLoading) {
    return <LoadingSpinner loading />;
  }

  if (!!personError || !!orgaError || !!orgaListError) {
    return (
      <SafeAreaViewFlex>
        <Wrapper>
          <RegularText center>{texts.errors.unexpected}</RegularText>
        </Wrapper>
      </SafeAreaViewFlex>
    );
  }

  return (
    <SafeAreaViewFlex>
      <FlatList
        data={listData}
        renderItem={({ item }) => (
          <OParlPreviewComponent data={item} key={item.id} navigation={navigation} />
        )}
        ListHeaderComponent={
          <Wrapper>
            <DropdownSelect
              data={dropdownData}
              searchPlaceholder="Suche"
              showSearch
              searchInputStyle={styles.searchInput}
              setData={setDropdownData}
            />
          </Wrapper>
        }
        onEndReachedThreshold={1.5}
        onEndReached={onEndReached}
        // this does currently not work as intended, until we upgrade our apollo client dependency
        // as of now the fetchmore function does not set the loading state to true
        ListFooterComponent={
          <LoadingSpinner loading={personLoading || orgaLoading || (!finished && fetchingMore)} />
        }
      />
    </SafeAreaViewFlex>
  );
};

OParlPersonsScreen.navigationOptions = ({ navigation }: Props) => {
  return {
    headerLeft: <HeaderLeft navigation={navigation} />
  };
};

const styles = StyleSheet.create({
  searchInput: {
    borderColor: colors.borderRgba,
    borderWidth: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    color: colors.darkText,
    fontFamily: 'titillium-web-regular',
    fontSize: normalize(16),
    justifyContent: 'space-between',
    lineHeight: normalize(22),
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(12)
  }
});
