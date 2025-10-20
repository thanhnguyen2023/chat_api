import { User } from "./User.type";

export interface Message {
  message_id: number;
  content: string;
  created_at: string;
  sender: Pick<User, "user_id" | "username" | "avatar_url">;
}
// {
//                         "user_id": 4,
//                         "username": "diana",
//                         "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana"
//                     }
