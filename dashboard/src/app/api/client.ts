import type { Company } from '../types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listCompanies: (limit = 100) =>
    request<Company[]>(`/companies/?limit=${limit}`),

  getCompany: (domain: string) =>
    request<Company>(`/companies/${encodeURIComponent(domain)}`),

  analyze: (domains: string[]) =>
    request<Company[]>('/analyze/', {
      method: 'POST',
      body: JSON.stringify({ domains }),
    }),

  exportCsvUrl: () => `${BASE}/companies/export/csv`,
};
