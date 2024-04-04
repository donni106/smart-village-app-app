import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { ProfileMember } from '../types';

export const PROFILE_AUTH_TOKEN = 'PROFILE_AUTH_TOKEN';
const PROFILE_CURRENT_USER = 'PROFILE_CURRENT_USER';

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

export const storeProfileUserData = (userData?: ProfileMember) => {
  if (userData) {
    AsyncStorage.setItem(PROFILE_CURRENT_USER, JSON.stringify(userData));
  } else {
    AsyncStorage.removeItem(PROFILE_CURRENT_USER);
  }
};

export const profileUserData = async (): Promise<{
  currentUserData: ProfileMember | null;
}> => {
  let currentUserData = null;

  // The reason for the problem of staying in SplashScreen that occurs after the application is
  // updated on the Android side is the inability to obtain the token here.
  // For this reason, try/catch is used here and the problem of getting stuck in SplashScreen is solved.
  try {
    currentUserData = await AsyncStorage.getItem(PROFILE_CURRENT_USER);
    currentUserData = JSON.parse(currentUserData as string);
  } catch {
    // Token deleted here so that it can be recreated
    await AsyncStorage.removeItem(PROFILE_CURRENT_USER);
  }

  return { currentUserData };
};
