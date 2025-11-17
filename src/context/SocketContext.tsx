import { useUserStore } from "@/stores/UserStore";
import { configSocket } from "@/utils/socket";
import { createContext, ReactNode, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { toast } from "sonner";

interface SocketContextType {
  socket: Socket | undefined;
  setSocket: (socket: Socket | undefined) => void;
}
export const SocketContext = createContext<SocketContextType | undefined>(
  undefined
);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { access_token } = useUserStore();
  const s = configSocket(access_token);
  const [socket, setSocket] = useState<Socket>(s);

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => {
      console.log("Socket connected:", s.id);
    });

    socket.on("ping", (data) => {
      console.log("socket ping:", data);
    });

    return () => {
      socket.disconnect();
    };
  }, [access_token]);

  return (
    <SocketContext.Provider value={{ socket, setSocket }}>
      {children}
    </SocketContext.Provider>
  );
};
