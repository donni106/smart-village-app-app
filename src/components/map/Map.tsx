import _upperFirst from 'lodash/upperFirst';
import React, { useContext, useRef } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import MapView, { LatLng, MAP_TYPES, Marker, Polyline, Region, UrlTile } from 'react-native-maps';

import { colors, device, Icon, normalize } from '../../config';
import { imageHeight, imageWidth } from '../../helpers';
import { SettingsContext } from '../../SettingsProvider';
import { MapMarker } from '../../types';
import { RegularText } from '../Text';

type Props = {
  geometryTourData?: LatLng[];
  isMaximizeButtonVisible?: boolean;
  isMultipleMarkersMap?: boolean;
  isMyLocationButtonVisible?: boolean;
  locations?: MapMarker[];
  mapCenterPosition?: { latitude: number; longitude: number };
  mapStyle?: StyleProp<ViewStyle>;
  onMapPress?: ({ nativeEvent }: { nativeEvent?: any }) => void;
  onMarkerPress?: (arg0?: string) => void;
  onMaximizeButtonPress?: () => void;
  onMyLocationButtonPress?: () => void;
  selectedMarker?: string;
  showsUserLocation?: boolean;
  style?: StyleProp<ViewStyle>;
  updatedRegion?: Region;
};

const MARKER_ICON_SIZE = normalize(40);

const MapIcon = ({
  iconColor,
  iconName = 'location',
  iconSize = MARKER_ICON_SIZE
}: {
  iconColor?: string;
  iconName?: string;
  iconSize?: number;
}) => {
  const MarkerIcon = Icon[_upperFirst(iconName) as keyof typeof Icon];

  return <MarkerIcon color={iconColor} size={iconSize} />;
};

/* eslint-disable complexity */
export const Map = ({
  geometryTourData,
  isMaximizeButtonVisible = false,
  isMultipleMarkersMap = false,
  isMyLocationButtonVisible = false,
  locations,
  mapCenterPosition,
  mapStyle,
  onMapPress,
  onMarkerPress,
  onMaximizeButtonPress,
  onMyLocationButtonPress,
  selectedMarker,
  showsUserLocation,
  style,
  updatedRegion
}: Props) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { zoomLevelForMaps = {}, locationService = {} } = settings;
  const zoom = isMultipleMarkersMap
    ? zoomLevelForMaps.multipleMarkers
    : zoomLevelForMaps.singleMarker;

  const refForMapView = useRef<MapView>(null);
  // LATITUDE_DELTA handles the zoom, see: https://github.com/react-native-maps/react-native-maps/issues/2129#issuecomment-457056572
  const LATITUDE_DELTA = zoom || 0.0922;
  // example for longitude delta: https://github.com/react-native-maps/react-native-maps/blob/0.30.x/example/examples/DisplayLatLng.js#L18
  const LONGITUDE_DELTA = LATITUDE_DELTA * (device.width / (device.height / 2));

  let initialRegion: Region = {
    latitude: 0,
    longitude: 0,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA
  };

  if (mapCenterPosition) {
    initialRegion = {
      ...initialRegion,
      ...mapCenterPosition
    };
  }

  if (locations?.[0]?.position?.latitude && locations[0]?.position?.longitude) {
    initialRegion = {
      ...initialRegion,
      latitude: locations[0].position.latitude,
      longitude: locations[0].position.longitude
    };
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        initialRegion={initialRegion}
        region={updatedRegion}
        mapType={device.platform === 'android' ? MAP_TYPES.NONE : MAP_TYPES.STANDARD}
        onPress={onMapPress}
        ref={refForMapView}
        rotateEnabled={false}
        showsUserLocation={showsUserLocation ?? !!locationService}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        style={[stylesForMap().map, mapStyle]}
        userLocationPriority="balanced"
        mapPadding={{
          top: 0,
          right: 0,
          bottom: -normalize(30),
          left: 0
        }}
        legalLabelInsets={{
          top: 0,
          right: 0,
          bottom: normalize(10),
          left: 0
        }}
      >
        <UrlTile
          doubleTileSize={device.platform === 'android'}
          urlTemplate="https://tile-server.sva-services.customer.planetary-quantum.net/tile/{z}/{x}/{y}.png"
          shouldReplaceMapContent={device.platform === 'ios'}
        />
        {!!geometryTourData?.length && (
          <Polyline
            coordinates={geometryTourData}
            strokeWidth={2}
            strokeColor={colors.primary}
            zIndex={1}
          />
        )}
        {locations?.map((marker, index) => {
          const isActiveMarker = selectedMarker && marker.id === selectedMarker;

          return (
            <Marker
              centerOffset={marker.iconAnchor || { x: 0, y: -(MARKER_ICON_SIZE / 2) }}
              coordinate={marker.position}
              identifier={marker.id}
              key={`${index}-${marker.id}`}
              onPress={() => onMarkerPress?.(marker.id)}
              zIndex={isActiveMarker ? 1010 : 1}
            >
              {!!marker.iconName &&
              marker.iconName != 'ownLocation' &&
              marker.iconName != 'location' ? (
                <>
                  <MapIcon
                    iconColor={
                      marker.iconBackgroundColor
                        ? isActiveMarker
                          ? marker.iconColor
                          : marker.iconBackgroundColor
                        : isActiveMarker
                        ? colors.accent
                        : undefined
                    }
                  />
                  <View
                    style={[
                      styles.mapIconOnLocationMarker,
                      isActiveMarker ? styles.mapIconOnLocationMarkerActive : undefined,
                      !!marker.iconBackgroundColor && {
                        backgroundColor: isActiveMarker
                          ? marker.iconColor
                          : marker.iconBackgroundColor
                      }
                    ]}
                  >
                    <MapIcon
                      iconColor={
                        marker.iconColor
                          ? isActiveMarker
                            ? colors.surface
                            : marker.iconColor
                          : colors.surface
                      }
                      iconName={marker.iconName}
                      iconSize={MARKER_ICON_SIZE / 3.25}
                    />
                  </View>
                </>
              ) : (
                <MapIcon
                  iconColor={
                    selectedMarker && marker.id === selectedMarker ? colors.accent : undefined
                  }
                  iconName={marker.iconName}
                />
              )}
            </Marker>
          );
        })}
      </MapView>
      {isMaximizeButtonVisible && (
        <TouchableOpacity style={styles.maximizeMapButton} onPress={onMaximizeButtonPress}>
          <Icon.ExpandMap size={normalize(18)} />
        </TouchableOpacity>
      )}
      {isMyLocationButtonVisible && (
        <TouchableOpacity style={styles.myLocationButton} onPress={onMyLocationButtonPress}>
          <Icon.GPS size={normalize(18)} />
        </TouchableOpacity>
      )}
      {device.platform === 'android' && (
        <View style={styles.logoContainer}>
          <RegularText smallest>© OpenStreetMap</RegularText>
        </View>
      )}
    </View>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flex: 1,
    justifyContent: 'center'
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    bottom: 0,
    height: normalize(30),
    justifyContent: 'center',
    left: normalize(13),
    position: 'absolute',
    width: normalize(100)
  },
  mapIconOnLocationMarker: {
    backgroundColor: colors.primary,
    left: MARKER_ICON_SIZE / 2.9,
    position: 'absolute',
    top: MARKER_ICON_SIZE / 4.2
  },
  mapIconOnLocationMarkerActive: {
    backgroundColor: colors.accent
  },
  maximizeMapButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 50,
    bottom: normalize(15),
    height: normalize(48),
    justifyContent: 'center',
    opacity: 0.6,
    position: 'absolute',
    right: normalize(15),
    width: normalize(48),
    zIndex: 1
  },
  myLocationButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 50,
    top: normalize(15),
    height: normalize(48),
    justifyContent: 'center',
    opacity: 0.6,
    position: 'absolute',
    right: normalize(30),
    width: normalize(48),
    zIndex: 1
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
// the map should have the same aspect ratio as images in portrait and a full width on landscape.
// we need to call the default styles in a method to ensure correct defaults for image aspect ratio,
// which could be overwritten by server global settings. otherwise (as default prop) the style
// would be set before the overwriting occurred.
const stylesForMap = () => {
  return StyleSheet.create({
    map: {
      alignSelf: 'center',
      height: imageHeight(imageWidth()),
      width: device.width
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
