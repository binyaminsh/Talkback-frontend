export interface LoginResult {
    id: string,
    success: boolean;
    message: string;
    token?: string;
}