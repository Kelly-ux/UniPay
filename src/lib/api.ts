import type { Due, User } from './types';
import type { StudentPayment } from './types';
import { apiClient } from './api-client';

export interface LoginRequest {
  email: string;
  password: string;
  role?: 'student' | 'admin';
  studentId?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const AuthApi = {
  login: (body: LoginRequest) => apiClient.post<LoginResponse, LoginRequest>('/auth/login', body),
  me: (token: string) => apiClient.get<User>('/auth/me', token),
};

export const DuesApi = {
  listDues: (token?: string | null) => apiClient.get<Due[]>('/dues', token || undefined),
  addDue: (data: Omit<Due, 'id'>, token?: string | null) => apiClient.post<Due, Omit<Due, 'id'>>('/dues', data, token || undefined),
  removeDue: (id: string, token?: string | null) => apiClient.delete<void>(`/dues/${id}`, token || undefined),
  listPaymentsForDue: (id: string, token?: string | null) => apiClient.get<StudentPayment[]>(`/dues/${id}/payments`, token || undefined),
  recordPayment: (id: string, token?: string | null) => apiClient.post<StudentPayment, undefined>(`/dues/${id}/pay`, undefined, token || undefined),
};

export const PaymentsApi = {
  listAllPayments: (token?: string | null) => apiClient.get<StudentPayment[]>('/payments', token || undefined),
};

