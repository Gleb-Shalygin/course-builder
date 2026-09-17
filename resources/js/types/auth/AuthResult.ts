export interface AuthResult {
    success: boolean;
    errors?: Record<string, string[]>;
    message?: string;
}
