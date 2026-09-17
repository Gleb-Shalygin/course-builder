import type { User } from '@/types/User';

export interface AppPageProps {
    auth: {
        user: User | null;
    };
    title?: string;
    [key: string]: unknown;
}
