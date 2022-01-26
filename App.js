import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import * as Sentry from 'sentry-expo';

import { MainApp } from './src';
import { fontConfig, namespace, secrets } from './src/config';

let sentryApi = secrets[namespace].sentryApi;
if (sentryApi?.dsn) {
  Sentry.init({
    dsn: sentryApi.dsn,
    enableNative: false, // NOTE: Native crash reporting is not available with the classic build system (expo build:[ios|android]), but is available via EAS Build.
    // enableInExpoDevelopment: true, // NOTE: Use this to enable temporarily tracking errors in development
    debug: __DEV__ // NOTE: If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
  });
}

const App = () => {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();

    Font.loadAsync(fontConfig)
      .catch((error) => console.warn('An error occurred with loading the fonts', error))
      .finally(() => setFontLoaded(true));
  }, []);

  return fontLoaded ? <MainApp /> : null;
};

export default App;
