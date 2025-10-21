import { MessageDto } from "../dtos/Message.dto";

export type GetMessageInConversation = {
  data: {
    messages: MessageDto;
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      per_page: number;
      has_more: boolean;
    };
  };
};

