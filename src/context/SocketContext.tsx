import { useUserStore } from "@/stores/UserStore";
import { configSocket } from "@/utils/socket";
import { createContext, ReactNode, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { toast } from "sonner";

interface GlobalContextType {
  socket: Socket | undefined;
  setSocket: (socket: Socket | undefined) => void;
}
export const GlobalContext = createContext<GlobalContextType | undefined>(
  undefined
);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | undefined>();
  const { user_id, access_token } = useUserStore();
  // console.log("<SocketContext.tsx>: access_ token : ", access_token);
  useEffect(() => {
    const socket = configSocket(access_token);
    socket.connect();

    socket.on("connect", () => {
      setSocket(socket);
      console.log("Socket connected:", socket.id);
    });

    socket.on("ping", (data) => {
      console.log("socket event ping:", data);
    });
    
    socket.on('error' , (data: { message: string }) => {
      toast.error('Error socket: ' , {description : data.message});
    })
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

  return (
    <GlobalContext.Provider value={{ setSocket, socket }}>
      {children}
    </GlobalContext.Provider>
  );
};
