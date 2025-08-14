// TypeScript interfaces for the application

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string | null;
  authProvider: string;
  createdAt: string;
  updatedAt: string;
}

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
  user?: User;
  token?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface FormFieldError {
  message: string;
}

export interface Slide {
  id: string;
  presentationId: string;
  title: string;
  bulletPoints: string[];
  keyTakeaway?: string | null;
  imageIdea?: string | null;
  slideOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Presentation {
  id: string;
  title: string;
  transcription: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PresentationWithSlides extends Presentation {
  slides: Slide[];
}

export interface GenerateSlidesRequest {
  transcription: string;
  title?: string;
}

export interface GenerateSlidesResponse {
  message: string;
  presentation: PresentationWithSlides;
}