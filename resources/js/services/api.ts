import axios, { type AxiosInstance, type AxiosError } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

export default api;

export type ApiError = AxiosError<{
    message?: string;
    errors?: Record<string, string[]>;
}>;

