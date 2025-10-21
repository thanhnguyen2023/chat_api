import React, { useEffect, useState } from "react";
import { useUserStore } from "@/stores/UserStore";
import { useAPI } from "@/hooks/useApi";

import { useLocation } from "react-router-dom";
import { GetInfoApi } from "@/types/api/User.api";

// không là context gì cả , chỉ là component 
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser, clearUser , isAuthenticated} = useUserStore();
  const { get, setToken } = useAPI();
  const [loading, setLoading] = useState(true);

  console.log('AuthContext.tsx');
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setToken(token);
        const res: GetInfoApi = await get("/api/auth/me");
        setUser({ ...res.data.user, isAuthenticated: true });
      } catch (error) {
        clearUser();
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [isAuthenticated]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return <>{children}</>;
};
