export type ProfileRegistration = {
  email: string;
  password: string;
  passwordConfirmation: string;
  dataPrivacyCheck: boolean;
};

export type ProfileLogin = {
  email: string;
  password: string;
};
