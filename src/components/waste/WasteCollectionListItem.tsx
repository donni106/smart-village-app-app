import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, Tooltip } from 'react-native-elements';

import { colors, device, Icon, normalize } from '../../config';
import { momentFormat } from '../../helpers';
import { HeadlineText, RegularText } from '../Text';
import { Wrapper, WrapperHorizontal, WrapperRow } from '../Wrapper';

import { Dot } from './WasteCalendarLegendEntry';

export const WasteCollectionListItem = ({ item: groupedItem, options }) => {
  const { groupKey, usedTypes } = options;
  const sectionHeaderTop = momentFormat(groupedItem[0][groupKey], 'dd');
  const sectionHeaderBottom = momentFormat(groupedItem[0][groupKey], 'DD');
  const dotsColors = groupedItem[0].dots.map((dot) => dot.color);

  return (
    <>
      <Wrapper style={styles.cell}>
        <WrapperRow>
          <View style={styles.width15}>
            <RegularText placeholder>{sectionHeaderTop}</RegularText>
            <HeadlineText biggest>{sectionHeaderBottom}</HeadlineText>
          </View>
          <WrapperHorizontal style={styles.width85}>
            {groupedItem.map((item) => (
              <View key={item.listDate}>
                {Object.keys(usedTypes).map(
                  (typeKey) =>
                    usedTypes[typeKey] &&
                    !!dotsColors &&
                    dotsColors.includes(usedTypes[typeKey].color) && (
                      <View key={usedTypes[typeKey].label}>
                        <WrapperRow style={styles.container}>
                          <Dot color={usedTypes[typeKey].color} />
                          {usedTypes[typeKey].color !== usedTypes[typeKey].selected_color && (
                            <Dot color={usedTypes[typeKey].selected_color} />
                          )}
                          <RegularText> {usedTypes[typeKey].label} </RegularText>
                          {item.note && (
                            <Tooltip
                              backgroundColor={colors.darkText}
                              containerStyle={{ height: 'auto' }}
                              overlayColor={colors.shadowRgba}
                              popover={<RegularText lightest>{item.note}</RegularText>}
                              withOverlay={device.platform === 'android'}
                              withPointer
                            >
                              <Icon.Info size={normalize(15)} />
                            </Tooltip>
                          )}
                        </WrapperRow>
                      </View>
                    )
                )}
              </View>
            ))}
          </WrapperHorizontal>
        </WrapperRow>
      </Wrapper>
      <WrapperHorizontal>
        <Divider />
      </WrapperHorizontal>
    </>
  );
};

const styles = StyleSheet.create({
  cell: {
    backgroundColor: colors.surface
  },
  container: {
    marginBottom: normalize(8),
    alignItems: 'center'
  },
  width15: {
    width: '15%'
  },
  width85: {
    width: '85%'
  }
});
