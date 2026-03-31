import React from 'react';

import { texts } from '../config';
import { useOtaUpdate } from '../hooks';

import { OtaUpdateBanner } from './OtaUpdateBanner';

export const OtaUpdateManager = () => {
  const { dismissBanner, isBannerVisible, isReloading, reloadUpdate } = useOtaUpdate();

  return (
    <OtaUpdateBanner
      actionLabel={texts.otaUpdateAlert.updateNow}
      closeLabel={texts.close}
      description={texts.otaUpdateAlert.updateMessage}
      isReloading={isReloading}
      onDismiss={dismissBanner}
      onPress={reloadUpdate}
      title={texts.otaUpdateAlert.updateTitle}
      visible={isBannerVisible}
    />
  );
};
