import { UserDto } from "../dtos/User.dto";

export type LoginApiRespone =  {
  data: {
    user: UserDto,
    token: string,
    expires_in: string
    
  };
  message: string;
}

export type GetInfoApi = {
  data: {
    user: UserDto;
  };
};

// type cho State store user (vứt tạm vào đây)
export interface UserState extends UserDto {
  access_token: string;
  isAuthenticated: boolean;
  setUser: (user: Partial<UserState>) => void;
  clearUser: () => void;
}
