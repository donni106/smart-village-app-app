export type CreateUserData = {
  birthDate: string;
  firstName: string;
  imageUri: string;
  lastName: string;
  phone: string;
};

export type UpdateUserData = CreateUserData & { userId: string };

export type User = {
  birthDate: string;
  firstName: string;
  imageUri: string;
  lastName: string;
  phone: string;
  userId?: string;
  verified: boolean;
};

export type UserWithId = User & { userId: string };
