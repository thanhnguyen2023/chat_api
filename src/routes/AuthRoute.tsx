import React, { useEffect, useState } from "react";
import { useUserStore } from "@/stores/UserStore";
import { useAPI } from "@/hooks/useApi";

import { useNavigate } from "react-router-dom";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser, clearUser } = useUserStore();
  const { get, setToken } = useAPI();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        navigate("/login");
        return;
      }

      try {
        setToken(token);
        const res = await get("/api/auth/me");

        setUser({
          ...res.data.user,
          isAuthenticated: true,
          access_token: token,
        });
      } catch {
        clearUser();
        localStorage.removeItem("token");
        setLoading(false);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
};
