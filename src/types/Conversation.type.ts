import { Message } from "./Message.type";
import { User } from "./User.type";

export type Participant = Pick<
  User,
  "user_id" | "username" | "avatar_url" | "status"
>;
export interface Conversation {
  conversation_id: number;
  conversation_name: string;
  is_group: boolean;
  created_at: string;
  participants: Participant[];
  last_message: Message | null;
}

export type ApiConversationRespone = {
  data: {
    conversations: Conversation[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      per_page: number;
    };
  };
};
