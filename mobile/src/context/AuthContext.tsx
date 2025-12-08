import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/auth.service';
import { User, LoginCredentials, RegisterData } from '../types';
import { STORAGE_KEYS } from '../constants';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStorageData();
    }, []);

    const loadStorageData = async () => {
        try {
            const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
            const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Failed to load auth data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        try {
            const response = await authService.login(credentials);

            setToken(response.token);
            setUser(response.user);

            await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterData) => {
        setIsLoading(true);
        try {
            const response = await authService.register(data);

            setToken(response.token);
            setUser(response.user);

            await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();

            setToken(null);
            setUser(null);

            await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
            await AsyncStorage.removeItem(STORAGE_KEYS.USER);
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                login,
                register,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
