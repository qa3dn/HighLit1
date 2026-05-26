import client from '../../services/client';

export interface BackendUser {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'COMPANY';
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: BackendUser;
}

export async function login(email: string, password: string) {
  const { data } = await client.post<LoginResponse>('/auth/login', { email, password });
  return data;
}
