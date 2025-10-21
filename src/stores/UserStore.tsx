
import { UserState } from "@/types/api/User.api";
import { UserDto } from "@/types/dtos/User.dto";
import { create } from "zustand";

export const useUserStore = create<UserState>((set) => ({
  user_id: null,
  username: null,
  email: null,
  avatar_url: null,
  status: null,
  created_at: null,
  access_token: null, // field này đang hơi thừa , fix sau
  isAuthenticated: false,
  setUser: (user : UserDto) =>
    set((state) => {
      // console.log('---- data set user store' , JSON.stringify(user));
      return {
        ...state,
        ...user,
        isAuthenticated: true,
      };
    }),
  clearUser: () =>  
    set({
      user_id: null,
      username: null,
      email: null,
      avatar_url: null,
      status: null,
      created_at: null,
      access_token: null,
      isAuthenticated: false,
    }),
}));
