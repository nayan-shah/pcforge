import apiClient from './axios';
import { AuthResponse, User } from '../types/auth';

export interface UpdateProfilePayload {
  name: string;
  avatar?: string;
}

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const response = await apiClient.put<AuthResponse>('/auth/profile', payload);
  return response.data.user;
}

export async function updatePassword(payload: UpdatePasswordPayload): Promise<void> {
  await apiClient.put('/auth/password', payload);
}
