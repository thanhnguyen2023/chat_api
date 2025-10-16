import { useUserStore } from "@/stores/UserStore";
import { Navigate, useLocation } from "react-router-dom";
import React from "react";

type Props = { children: React.ReactNode };

const ProtectedRoute = ({ children }: Props) => {
  const { isAuthenticated } = useUserStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
