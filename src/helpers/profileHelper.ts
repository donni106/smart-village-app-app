import * as SecureStore from 'expo-secure-store';

const PROFILE_AUTH_TOKEN = 'PROFILE_AUTH_TOKEN';

export const storeProfileAuthToken = (authToken?: string) => {
  if (authToken) {
    SecureStore.setItemAsync(PROFILE_AUTH_TOKEN, authToken);
  } else {
    SecureStore.deleteItemAsync(PROFILE_AUTH_TOKEN);
  }
};

export const profileAuthToken = async () => {
  let authToken = null;

  // The reason for the problem of staying in SplashScreen that occurs after the application is
  // updated on the Android side is the inability to obtain the token here.
  // For this reason, try/catch is used here and the problem of getting stuck in SplashScreen is solved.
  try {
    authToken = await SecureStore.getItemAsync(PROFILE_AUTH_TOKEN);
  } catch {
    // Token deleted here so that it can be recreated
    SecureStore.deleteItemAsync(PROFILE_AUTH_TOKEN);
  }

  return authToken;
};
