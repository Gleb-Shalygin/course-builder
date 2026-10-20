export interface RegisterData {
    email: string;
    name: string;
    password: string;
    password_confirmation: string;
    date_of_birth: string | null;
    gender: 'male' | 'female' | undefined;
}

