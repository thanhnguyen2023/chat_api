import { useAPI } from "@/hooks/useApi";
import LoginPage from "@/pages/Login";
import { useUserStore } from "@/stores/UserStore";
import { GetInfoApi } from "@/types/Api.type";
import { User } from "@/types/User.type";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectRoute = ({ children }: ProtectedRouteProps) => {
    const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const { setUser , clearUser} = useUserStore();
  const { get, setToken } = useAPI();
  const token = localStorage.getItem("token");
  console.log('protect route render');
  // useEffect(() => {
  //   const actionRequestToken = async () => { // 
  //     try {
  //       setToken(token); // set token cho headers
  //       const res: GetInfoApi = await get("/api/auth/me");
  //       // console.log("user " + JSON.stringify(res));
  //       setUser({ ...res.data, access_token: null , isAuthenticated:true });
  //     } catch (error : any) {
  //       clearUser();
  //     }
  //   };
  //   actionRequestToken();
  // }, [isAuthenticated ]);

  if (!token || !isAuthenticated) {
    // console.log('không redirect');
    navigate('/login');
    return <></>;
  }
  return <>{children}</>;
};
export default ProtectRoute;
