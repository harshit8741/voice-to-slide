// API utility functions for making HTTP requests to the backend

import axios from 'axios';
import { 
  LoginCredentials, 
  SignupCredentials, 
  AuthResponse, 
  User,
  GenerateSlidesRequest,
  GenerateSlidesResponse,
  PresentationWithSlides,
  Presentation
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Simple cache for API responses
let userCache: { user: User; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Auth API functions
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/register', credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    // Check cache first
    if (userCache && Date.now() - userCache.timestamp < CACHE_DURATION) {
      return userCache.user;
    }
    
    const response = await api.get('/api/auth/me');
    
    // Update cache
    userCache = {
      user: response.data,
      timestamp: Date.now()
    };
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    userCache = null; // Clear cache on logout
  },
};

// User API functions
export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/api/users');
    return response.data;
  },
};

// Slides API functions
export const slidesApi = {
  generateSlides: async (request: GenerateSlidesRequest): Promise<GenerateSlidesResponse> => {
    const response = await api.post('/api/slides/generate', request);
    return response.data;
  },

  generateSlidesFromAudio: async (audioFile: File, title?: string): Promise<GenerateSlidesResponse & { transcription: string }> => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    if (title) {
      formData.append('title', title);
    }

    const response = await api.post('/api/audio-to-slides', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  generateSlidesFromYoutube: async (youtubeUrl: string, title?: string): Promise<GenerateSlidesResponse & { transcription: string; videoInfo: Record<string, unknown> }> => {
    const response = await api.post('/api/audio-to-slides', {
      youtubeUrl,
      title,
    });
    return response.data;
  },

  getPresentation: async (id: string): Promise<PresentationWithSlides> => {
    const response = await api.get(`/api/slides/${id}`);
    return response.data;
  },

  getUserPresentations: async (): Promise<Presentation[]> => {
    const response = await api.get('/api/slides');
    return response.data;
  },

  deletePresentation: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/api/slides/${id}`);
    return response.data;
  },

  exportToPptx: async (id: string, options?: { theme?: string; author?: string }): Promise<Blob> => {
    const response = await api.post(`/api/slides/${id}/export`, options || {}, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      }
    });
    return response.data;
  },

  getThemes: async (): Promise<{ themes: Array<{ key: string; name: string; preview: { name: string; background: string; titleColor: string; textColor: string; accentColor: string } }> }> => {
    const response = await api.get('/api/slides/themes');
    return response.data;
  },
};

export default api;