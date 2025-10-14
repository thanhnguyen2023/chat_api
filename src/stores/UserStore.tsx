import { UserState } from "@/types/User.type";
import { create } from "zustand";

export const useUserStore = create<UserState>((set) => ({
  user_id: null,
  username: null,
  email: null,
  avatar_url: null,
  status: null,
  created_at: null,
  access_token: null,
  isAuthenticated: false,
  setUser: (user) =>
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
