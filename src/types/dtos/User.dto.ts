import { User } from "../entites/User";

// loại bỏ field password trong entity
export type UserDto =  Pick<User,"user_id" | "username" | "email" | "avatar_url" | "created_at" | "status">

export type Participant = Pick<User,"user_id" | "username" | "avatar_url" | "status">; // type cho conversation

export type Sender =  Pick<User,"user_id" | "username" | "avatar_url"> // type cho field last_message của conversation
