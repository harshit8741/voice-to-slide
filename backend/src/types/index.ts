// TypeScript type definitions for the backend

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  user?: SafeUser;
  token?: string;
  message?: string;
}

export interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string | null;
  authProvider: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  message: string;
  status: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
}