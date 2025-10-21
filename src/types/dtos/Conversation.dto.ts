import { Conversation } from "../entites/Conversation";
import { LastMessage } from "./Message.dto";
import { Participant } from "./User.dto";

export type ConversationDto = Conversation & { // nối 2 type lại
  participants: Participant[];
  last_message: LastMessage;
}
