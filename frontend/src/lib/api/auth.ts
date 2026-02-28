import ApiClient from './client';

export const auth = {
  login: async (credentials: any) => {
    return ApiClient.post('/api/auth/login', credentials);
  },

  register: async (data: any) => {
    return ApiClient.post('/api/auth/register', data);
  },

  logout: async (refreshToken: string) => {
    return ApiClient.post('/api/auth/logout', { refreshToken });
  },

  forgotPassword: async (email: string) => {
    return ApiClient.post('/api/auth/forgot-password', { email });
  },

  resetPassword: async (data: any) => {
    // data: { email, code, newPassword }
    return ApiClient.post('/api/auth/reset-password', data);
  },

  verifyEmail: async (data: any) => {
    // data: { email, code }
    return ApiClient.post('/api/auth/verify-email', data);
  },

  getMe: async () => {
    return ApiClient.get('/api/auth/me'); // Assuming endpoint exists or users/me
  }
};
