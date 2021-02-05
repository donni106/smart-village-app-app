import React, { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider } from 'react-native-elements';
import { NavigationScreenProp } from 'react-navigation';

import { colors, normalize, texts } from '../../config';
import { formatAddress, shareMessage } from '../../helpers';
import { location } from '../../icons';
import { QUERY_TYPES } from '../../queries';
import { Icon } from '../Icon';
import { BoldText, RegularText } from '../Text';
import { InfoBox, Wrapper } from '../Wrapper';
import { InfoCard } from './InfoCard';

type WebUrl = {
  id: string;
  url: string;
  description?: string;
};

type Contact = {
  email?: string;
  fax?: string;
  phone?: string;
  webUrls: WebUrl[];
};

type Address = {
  addition?: string;
  city?: string;
  kind?: string;
  street?: string;
  zip?: string;
};

type Props = {
  lunchOfferData: {
    id: string;
    text?: string;
    lunchOffers?: { name: string; price: string }[];
    pointOfInterest: {
      id: string;
      addresses?: Address[];
      contact?: Contact;
      name?: string;
      webUrls?: WebUrl[];
    };
    pointOfInterestAttributes?: string;
  };
  navigation: NavigationScreenProp<never>;
};

const parseAttributes = (input?: string) => {
  const attributes = input?.split(',');

  return {
    contactEmail: attributes?.find((item) => item === 'contact.email'),
    contactFax: attributes?.find((item) => item === 'contact.fax'),
    contactPhone: attributes?.find((item) => item === 'contact.phone'),
    contactWebUrls: attributes?.find((item) => item === 'contact.webUrls'),
    webUrls: attributes?.find((item) => item === 'webUrls')
  };
};

const LunchOffer = ({ name, price }: { name: string; price: string }) => (
  <View style={styles.container}>
    <View style={styles.nameContainer}>
      <RegularText accessibilityLabel={`Mittagstisch (Gerichtname): ${name}`}>{name}</RegularText>
    </View>
    <View style={styles.priceContainer}>
      <RegularText accessibilityLabel={`Preis (${name}): ${price}`}>{price}</RegularText>
    </View>
  </View>
);

// eslint-disable-next-line complexity
export const LunchSection = ({ lunchOfferData, navigation }: Props) => {
  const { text, lunchOffers, pointOfInterest, pointOfInterestAttributes } = lunchOfferData;
  const { addresses, contact, name, webUrls } = pointOfInterest;

  const {
    contactEmail,
    contactFax,
    contactPhone,
    contactWebUrls,
    webUrls: withWebUrls
  } = parseAttributes(pointOfInterestAttributes);

  const filteredContact = {
    email: contactEmail ? contact?.email : undefined,
    fax: contactFax ? contact?.fax : undefined,
    phone: contactPhone ? contact?.phone : undefined,
    webUrls: contactWebUrls ? contact?.webUrls : []
  };

  const openWebScreen = useCallback(
    (webUrl: string) =>
      navigation.navigate({
        routeName: 'Web',
        params: {
          title: 'Ort',
          webUrl
        }
      }),
    [navigation]
  );

  const onPress = useCallback(
    () =>
      navigation.navigate({
        routeName: 'Detail',
        params: {
          title: texts.detailTitles.pointOfInterest,
          query: QUERY_TYPES.POINT_OF_INTEREST,
          queryVariables: { id: `${pointOfInterest.id}` },
          shareContent: {
            message: shareMessage(pointOfInterest, QUERY_TYPES.POINT_OF_INTEREST)
          },
          details: {
            ...pointOfInterest,
            title: pointOfInterest.name
          }
        }
      }),
    [navigation]
  );

  if (!lunchOffers?.length && !text?.length) {
    return null;
  }

  const address = formatAddress(addresses?.find((address: Address) => address.kind === 'default'));

  return (
    <Wrapper>
      {/*
      TODO: Logo
      {!!dataProvider?.logo?.url && <Logo source={{ uri: dataProvider.logo.url }} />} */}
      {(!!address || !!name) && (
        <TouchableOpacity accessibilityLabel="Anbieterinformationen (Taste)" onPress={onPress}>
          <InfoBox style={styles.addressContainer}>
            <Icon xml={location(colors.primary)} style={styles.margin} />
            <View style={styles.address}>
              {!!name && <BoldText primary>{name}</BoldText>}
              {!!address && <RegularText primary>{address}</RegularText>}
            </View>
          </InfoBox>
        </TouchableOpacity>
      )}
      <InfoCard
        contact={filteredContact}
        openWebScreen={openWebScreen}
        webUrls={withWebUrls ? webUrls : undefined}
      />
      <RegularText />
      {!!text && (
        <>
          <RegularText>{text}</RegularText>
          <RegularText />
        </>
      )}
      {!!lunchOffers && (
        <>
          {lunchOffers.map((item, index) => (
            <LunchOffer key={index} name={item.name} price={item.price} />
          ))}
        </>
      )}
      <Divider style={styles.divider} />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  address: {
    flexDirection: 'column'
  },
  addressContainer: {
    alignItems: 'center'
  },
  container: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.darkText,
    paddingVertical: normalize(4)
  },
  divider: {
    backgroundColor: colors.darkText
  },
  margin: {
    marginRight: normalize(10)
  },
  nameContainer: {
    flexShrink: 1
  },
  priceContainer: {
    marginLeft: normalize(14)
  }
});
