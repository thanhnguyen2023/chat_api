import { User } from "./User.type";

export type ErrorAPI = {
  error: {
    message: string;
    details: string[];
  };
};

export type GetInfoApi = {
  data: {
    user: User;
  };
};

export interface LoginApiRespone {
  data: {
    user: User,
    token: string,
    expires_in: string
    
  };
  message: string;
}
