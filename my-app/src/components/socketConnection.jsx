import { createContext, useState} from "react";

export const SocketContext = createContext();

export const SocketProvider = ({children})=>{
    const [socket, setsocket] = useState(null);

    const connectSocket = ()=>{
        if(!socket){
            const newSocket = io("http://localhost:3000");
            setsocket(newSocket);
        }
    };

    const disconnectSocket = ()=>{
        if(socket){
            socket.disconnect();
            setsocket(null);
        }
    };

    return(
        <SocketContext.Provider value={{socket, connectSocket, disconnectSocket}}>
            {children}
        </SocketContext.Provider>
    )
}