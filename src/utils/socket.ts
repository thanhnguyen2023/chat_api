import { io } from "socket.io-client";
import { server } from "./server";

export function configSocket(token: string = '') {
  try {
    // console.log('<socket.ts> token: ' , token);
    const socket = io(server.baseUrl, { auth: { token: token } , autoConnect:false});
    return socket;
  } catch (error) {
    console.error("Error in utils/socket.ts : ", error);
  }
}
