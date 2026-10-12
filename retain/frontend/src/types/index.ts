// Shared shapes that match what our backend API sends back.

export type Role = 'user' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

// What /auth/signin and /auth/signup return.
export interface AuthResponse {
  token: string;
  user: User;
}