const API_BASE = 'http://localhost:8000/api/v1/companies';

export interface Company {
  id: number;
  name: string;
  industry: string;
  size: string;
  email: string;
  website: string;
  employee_count: number;
  created_at: string;
}

export interface CreateCompanyPayload {
  name: string;
  industry: string;
  size: string;
  email: string;
  website: string;
  description: string;
}

export const companiesService = {
  async getAll(): Promise<Company[]> {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error(`Failed to fetch companies: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.results) ? data.results : data;
  },

  async create(payload: CreateCompanyPayload): Promise<Company> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(JSON.stringify(error));
    }
    return res.json();
  },

  async update(id: number, payload: Partial<CreateCompanyPayload>): Promise<Company> {
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
    if (!res.ok) throw new Error(`Failed to delete company: ${res.status}`);
  },
};
