import { nanoid } from "nanoid"
import { useEffect, useState, useContext } from "react";
import { SocketContext } from "./socketConnection";

export default function HomePage({setopenPrompt, RoomID, setRoomID, setMain}){

    const {socket, connectSocket} = useContext(SocketContext);

    useEffect(()=>{
        console.log(RoomID);
    }, [RoomID]);

    function handleRandom(){
        const userID = nanoid(6);
        const socketConnection = connectSocket();
        if(socketConnection){
            socketConnection.emit("random", userID, 2);
            socketConnection.on("randomFound", (ID)=>{
                setRoomID(ID);
                setMain("game");
            })
        }
    }
    return(
        <div>
            <h1>Welcome to the Game!!!!</h1>
            <button onClick={()=> setopenPrompt(true)}>Join with Friend</button>
            <button onClick={handleRandom}>Join with Random</button>
        </div>
    )
}

