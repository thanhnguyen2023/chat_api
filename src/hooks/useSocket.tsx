import { SocketContext } from "@/context/SocketContext";
import { useContext } from "react";

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("Global must be used within a Product Provider");
  }
  return context;
};
