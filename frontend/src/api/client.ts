import axios from 'axios';

const TOKEN_KEY = 'token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
});

// Adds the token to every request, so pages don't have to.
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Expired or invalid token: log out and go back to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && tokenStorage.get()) {
      tokenStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

/** Turns an API error into a message we can show to the user. */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Cannot reach the server. Is the backend running?';
    const message = (error.response.data as { message?: string | string[] })?.message;
    if (Array.isArray(message)) return message.join('. ');
    if (message) return message;
  }
  return 'Something went wrong. Please try again.';
}