import ApiClient from './client';
import { OrganizationListResponse } from '../types';

export const opportunities = {
  getAll: async (params?: any) => {
    return ApiClient.get('/api/opportunities', params);
  },

  getById: async (id: string) => {
    return ApiClient.get(`/api/opportunities/${id}`);
  },

  create: async (data: FormData | any) => {
    return ApiClient.post('/api/opportunities', data);
  },

  update: async (id: string, data: any) => {
    return ApiClient.put(`/api/opportunities/${id}`, data);
  },

  delete: async (id: string) => {
    return ApiClient.delete(`/api/opportunities/${id}`);
  },

  // Related
  getOrganizations: async () => {
    return ApiClient.get<OrganizationListResponse>('/api/organizations/users/all');
  }
};
