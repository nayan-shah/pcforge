export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  savedBuilds: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token?: string;
}
