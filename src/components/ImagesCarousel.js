import PropTypes from 'prop-types';
import React, { useCallback, useContext, useState } from 'react';
import { Query } from 'react-apollo';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import Carousel from 'react-native-snap-carousel';

import { colors, Icon, normalize } from '../config';
import { graphqlFetchPolicy, imageWidth, isActive, shareMessage } from '../helpers';
import { useRefreshTime } from '../hooks';
import { NetworkContext } from '../NetworkProvider';
import { OrientationContext } from '../OrientationProvider';
import { getQuery } from '../queries';
import { SettingsContext } from '../SettingsProvider';

import { ImagesCarouselItem } from './ImagesCarouselItem';
import { LoadingContainer } from './LoadingContainer';

export const ImagesCarousel = ({ data, navigation, refreshTimeKey, aspectRatio }) => {
  const { dimensions } = useContext(OrientationContext);
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { sliderPauseButton = {} } = settings;
  const {
    horizontalPosition = 'right',
    show: showSliderPauseButton = true,
    size: sizeSliderPauseButton = 25,
    verticalPosition = 'bottom'
  } = sliderPauseButton;
  const refreshTime = useRefreshTime(refreshTimeKey);
  const [isPaused, setIsPaused] = useState(false);
  const [carouselImageIndex, setCarouselImageIndex] = useState(0);

  const fetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime
  });
  const itemWidth = imageWidth();

  const renderItem = useCallback(
    ({ item }) => {
      const { routeName: name, params } = item.picture || {};

      // params are available, but missing `shareContent` and `details`
      // -> we want to add `shareContent` and `details` to the `params`,
      // if we have `queryVariables` with an `id`
      if (name && params?.query && params?.queryVariables?.id) {
        const id = params.queryVariables.id;
        const query = params.query;

        return (
          <Query query={getQuery(query)} variables={{ id }} fetchPolicy={fetchPolicy}>
            {({ data, loading }) => {
              if (loading) {
                return (
                  <LoadingContainer>
                    <ActivityIndicator color={colors.accent} />
                  </LoadingContainer>
                );
              }

              const details = data && data[query];

              if (!details) return null;

              // extend the item.picture with new params data containing shareContent and details
              item.picture = {
                ...item.picture,
                params: {
                  ...params,
                  shareContent: { message: shareMessage(details, query) },
                  details
                }
              };

              return (
                <ImagesCarouselItem
                  navigation={navigation}
                  source={item.picture}
                  message={item.message}
                  containerStyle={styles.imageContainer}
                  aspectRatio={aspectRatio}
                  refreshInterval={item.refreshInterval}
                />
              );
            }}
          </Query>
        );
      }

      return (
        <ImagesCarouselItem
          navigation={navigation}
          source={item.picture}
          message={item.message}
          containerStyle={styles.imageContainer}
          aspectRatio={aspectRatio}
          refreshInterval={item.refreshInterval}
        />
      );
    },
    [navigation, fetchPolicy, aspectRatio]
  );

  // filter data for present items and items with active date/time periods
  const carouselData = data.filter((item) => item && isActive(item));

  // if there is one entry in the data, we do not want to render a whole carousel, we than just
  // need the one item to render
  if (carouselData.length === 1) {
    return renderItem({ item: carouselData[0] });
  }

  return (
    <View>
      {isPaused ? (
        renderItem({ item: carouselData[carouselImageIndex] })
      ) : (
        <Carousel
          data={carouselData}
          renderItem={renderItem}
          sliderWidth={dimensions.width}
          itemWidth={itemWidth}
          inactiveSlideScale={1}
          autoplay
          loop
          autoplayDelay={0}
          autoplayInterval={4000}
          containerCustomStyle={styles.center}
          onScrollIndexChanged={setCarouselImageIndex}
        />
      )}

      {showSliderPauseButton &&
        pauseButton(
          horizontalPosition,
          isPaused,
          setIsPaused,
          sizeSliderPauseButton,
          verticalPosition
        )}
    </View>
  );
};

const pauseButton = (horizontalPosition, isPaused, setIsPaused, size, verticalPosition) => (
  <TouchableOpacity
    style={[
      styles.pauseButton,
      {
        [horizontalPosition]: normalize(12),
        [verticalPosition]: normalize(24),
        borderRadius: normalize(size * 2),
        padding: normalize(size / 2)
      }
    ]}
    onPress={() => setIsPaused(!isPaused)}
  >
    {isPaused ? <Icon.Play size={normalize(size)} /> : <Icon.Pause size={normalize(size)} />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  center: {
    alignSelf: 'center'
  },
  imageContainer: {
    alignSelf: 'center'
  },
  pauseButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.surface,
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 1
  }
});

ImagesCarousel.propTypes = {
  data: PropTypes.array.isRequired,
  navigation: PropTypes.object,
  refreshTimeKey: PropTypes.string,
  aspectRatio: PropTypes.object,
  autoplay: PropTypes.bool
};
