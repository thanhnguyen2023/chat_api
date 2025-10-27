
import { GlobalContext } from "@/context/SocketContext";
import { useContext } from "react";

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("Global must be used within a Product Provider");
  }
  return context;
};