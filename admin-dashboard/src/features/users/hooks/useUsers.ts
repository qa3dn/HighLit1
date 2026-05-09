import { useEffect, useState } from 'react';
import { usersService } from '../services/usersService';
import type { User, CreateUserPayload } from '../services/usersService';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersService.getAll();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (payload: CreateUserPayload) => {
    try {
      setError(null);
      await usersService.create(payload);
      await fetchUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create user';
      setError(msg);
      throw new Error(msg);
    }
  };

  const updateUser = async (id: number, payload: Partial<CreateUserPayload>) => {
    try {
      setError(null);
      await usersService.update(id, payload);
      await fetchUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update user';
      setError(msg);
      throw new Error(msg);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      setError(null);
      await usersService.delete(id);
      await fetchUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete user';
      setError(msg);
      throw new Error(msg);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, createUser, updateUser, deleteUser, refetch: fetchUsers };
};
