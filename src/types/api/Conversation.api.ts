import { ConversationDto } from "../dtos/Conversation.dto";

export type ApiConversationRespone = {
  data: {
    conversations: ConversationDto[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      per_page: number;
    };
  };
};
