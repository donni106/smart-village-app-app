import PropTypes from 'prop-types';
import React, { createContext, useState } from 'react';

export const initialContext = {
  globalSettings: {
    filter: {},
    hdvt: {},
    navigation: 'tab',
    sections: {},
    settings: {},
    waste: {},
    whistleblow: {},
    widgets: []
  },
  listTypesSettings: {},
  locationSettings: {},
  conversationSettings: {}
};

export const SettingsContext = createContext(initialContext);

export const SettingsProvider = ({
  initialGlobalSettings,
  initialListTypesSettings,
  initialLocationSettings,
  initialConversationSettings,
  children
}) => {
  const [globalSettings, setGlobalSettings] = useState(initialGlobalSettings);
  const [listTypesSettings, setListTypesSettings] = useState(initialListTypesSettings);
  const [locationSettings, setLocationSettings] = useState(initialLocationSettings);
  const [conversationSettings, setConversationSettings] = useState(initialConversationSettings);

  return (
    <SettingsContext.Provider
      value={{
        globalSettings,
        setGlobalSettings,
        listTypesSettings,
        setListTypesSettings,
        locationSettings,
        setLocationSettings,
        conversationSettings,
        setConversationSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

SettingsProvider.propTypes = {
  initialGlobalSettings: PropTypes.object.isRequired,
  initialListTypesSettings: PropTypes.object.isRequired,
  initialLocationSettings: PropTypes.object.isRequired,
  initialConversationSettings: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired
};
