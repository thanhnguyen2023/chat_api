// entity gốc từ db
export interface User {
  user_id: number;
  username: string;
  full_name?: string;
  gender?: string;
  is_private?: false;
  bio?: string;
  password: string;
  email: string;
  avatar_url: string;
  status: string;
  created_at: string;
}
