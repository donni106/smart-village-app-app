import { StackScreenProps } from '@react-navigation/stack';
import React, { memo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Card } from 'react-native-elements';

import { Icon, colors, normalize } from '../../config';
import { imageHeight, imageWidth } from '../../helpers';
import { QUERY_TYPES } from '../../queries';
import { TVoucherItem } from '../../types';
import { Image } from '../Image';
import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';

import { Discount } from './Discount';

export const VoucherListItem = memo(
  ({
    navigation,
    horizontal,
    item
  }: {
    navigation: StackScreenProps<any>;
    horizontal: boolean;
    item: TVoucherItem;
  }) => {
    const {
      discountType,
      id,
      // TODO: update this code when the image is added on the server
      image = { uri: 'https://picsum.photos/500/300' },
      params,
      quota,
      routeName: name,
      subtitle,
      title
    } = item;

    return (
      <Touchable onPress={() => navigation && navigation.push(name, params)} disabled={!navigation}>
        <Card containerStyle={styles.container}>
          {!!image?.uri && (
            <Image
              source={{ uri: image.uri }}
              style={stylesWithProps({ horizontal }).image}
              containerStyle={styles.imageContainer}
              borderRadius={5}
            />
          )}

          {!!discountType && (
            <Discount discount={discountType} query={QUERY_TYPES.VOUCHERS} id={id} />
          )}

          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <View>
              {!!title && <BoldText small>{title}</BoldText>}

              {!!subtitle && <RegularText small>{subtitle}</RegularText>}
            </View>

            <Icon.ArrowRight color={colors.darkText} size={normalize(24)} />
          </View>
        </Card>
      </Touchable>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.transparent,
    borderWidth: 0,
    margin: 0,
    padding: normalize(14),
    ...Platform.select({
      android: {
        elevation: 0
      },
      ios: {
        shadowColor: colors.transparent
      }
    })
  },
  imageContainer: {
    alignSelf: 'center'
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesWithProps = ({ horizontal }: { horizontal: boolean }) => {
  let width = imageWidth();

  if (horizontal) {
    // image width should be only 70% when rendering horizontal cards
    width = width * 0.7;
  }

  const maxWidth = width - 2 * normalize(14); // width of an image minus paddings

  return StyleSheet.create({
    contentContainer: {
      width: maxWidth
    },
    image: {
      marginBottom: normalize(7),
      height: imageHeight(maxWidth),
      width: maxWidth
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
