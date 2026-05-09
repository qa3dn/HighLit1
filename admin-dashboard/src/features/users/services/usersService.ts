const API_BASE = 'http://localhost:8000/api/v1/users';
const AUTH_API = 'http://localhost:8000/api/v1/auth';

export type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  rank: string;
  reputation_points: number;
  bio: string;
};

export type CreateUserPayload = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  bio: string;
};

type RegisterPayload = CreateUserPayload & { password: string };

export const usersService = {
  async getAll(): Promise<User[]> {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.results) ? data.results : data;
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const registerPayload: RegisterPayload = { ...payload, password: 'user@123456' };
    const res = await fetch(`${AUTH_API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerPayload),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(JSON.stringify(error));
    }
    const data = await res.json();
    return data.user;
  },

  async update(id: number, payload: Partial<CreateUserPayload>): Promise<User> {
    const res = await fetch(`${API_BASE}/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(JSON.stringify(error));
    }
    return res.json();
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}/`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete user: ${res.status}`);
  },
};
