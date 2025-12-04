import api from './api';
import { LoginCredentials, RegisterData, AuthResponse } from '../types';

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        // Mock login for demo purposes
        await new Promise(resolve => setTimeout(() => resolve(true), 1000)); // Simulate network delay

        if (credentials.email.toLowerCase().includes('admin')) {
            return {
                user: {
                    id: 'admin_1',
                    email: credentials.email,
                    firstName: 'Admin',
                    lastName: 'User',
                    role: 'ADMIN',
                    createdAt: new Date().toISOString(),
                },
                token: 'mock_admin_token',
            };
        }

        if (credentials.email.toLowerCase().includes('b2b') || credentials.email.toLowerCase().includes('vendor') || credentials.email.toLowerCase().includes('client')) {
            return {
                user: {
                    id: 'b2b_1',
                    email: credentials.email,
                    firstName: 'Vendor',
                    lastName: 'User',
                    role: 'B2B',
                    company: 'Acme Corp',
                    createdAt: new Date().toISOString(),
                },
                token: 'mock_b2b_token',
            };
        }

        if (credentials.email.toLowerCase().includes('recruiter')) {
            return {
                user: {
                    id: 'recruiter_1',
                    email: credentials.email,
                    firstName: 'Jane',
                    lastName: 'Smith',
                    role: 'RECRUITER',
                    company: 'TechCorp',
                    createdAt: new Date().toISOString(),
                },
                token: 'mock_recruiter_token',
            };
        }

        return {
            user: {
                id: 'user_1',
                email: credentials.email,
                firstName: 'John',
                lastName: 'Doe',
                role: 'CANDIDATE',
                createdAt: new Date().toISOString(),
            },
            token: 'mock_candidate_token',
        };
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    logout: async (): Promise<void> => {
        // Optional: Call backend logout endpoint
        // await api.post('/auth/logout');
    },

    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    updateProfile: async (data: any) => {
        const response = await api.put('/users/profile', data);
        return response.data;
    },
};
