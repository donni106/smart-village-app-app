import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { LocationData } from '../../types';
import { BoldText, RegularText } from '../Text';
import { Wrapper } from '../Wrapper';
import { LineEntry } from './LineEntry';
import {
  KeywordSection,
  ModifiedSection,
  OParlPreviewSection,
  WebRepresentation
} from './sections';

type Props = {
  data: LocationData;
  navigation: NavigationScreenProp<never>;
};

const locationTexts = texts.oparl.location;

export const Location = ({ data, navigation }: Props) => {
  const {
    bodies,
    created,
    deleted,
    description,
    // TODO: geoJson,
    keyword,
    locality,
    meeting,
    modified,
    organization,
    papers,
    postalCode,
    room,
    streetAddress,
    subLocality,
    web
  } = data;

  let localityString: string | undefined;

  if (locality) {
    if (subLocality) {
      localityString = `${locality} (${subLocality})`;
    } else {
      localityString = locality;
    }
  } else {
    localityString = subLocality;
  }

  return (
    <Wrapper>
      <>
        <BoldText>{locationTexts.streetAddress}</BoldText>
        <RegularText>{streetAddress}</RegularText>
      </>
      <LineEntry left={locationTexts.postalCode} right={postalCode} />
      <>
        <BoldText>{locationTexts.locality}</BoldText>
        <RegularText>{localityString}</RegularText>
      </>
      <LineEntry left={locationTexts.room} right={room} />
      <OParlPreviewSection data={meeting} header={locationTexts.meeting} navigation={navigation} />
      {!!description && (
        <>
          <BoldText>{locationTexts.description}</BoldText>
          <RegularText>{description}</RegularText>
        </>
      )}
      <OParlPreviewSection data={bodies} header={locationTexts.bodies} navigation={navigation} />
      <OParlPreviewSection
        data={organization}
        header={locationTexts.organization}
        navigation={navigation}
      />
      <OParlPreviewSection data={papers} header={locationTexts.papers} navigation={navigation} />
      <KeywordSection keyword={keyword} />
      <WebRepresentation name={locationTexts.location} navigation={navigation} web={web} />
      <ModifiedSection created={created} deleted={deleted} modified={modified} />
    </Wrapper>
  );
};
