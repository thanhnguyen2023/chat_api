export interface User {
  user_id: number;
  username: string;
  email: string;
  avatar_url: string;
  status: string;
  created_at: string;
}

export interface UserState extends User {
  access_token: string;
  isAuthenticated: boolean;
  setUser: (user: Partial<UserState>) => void;
  clearUser: () => void;
}

export interface LoginApiRespone {
  data: User;
  message: string;
  token: string;
  expires_in: string;
}
