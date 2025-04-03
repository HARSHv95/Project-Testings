import { io } from "socket.io-client"
import { nanoid } from "nanoid"
import { useEffect, useState } from "react";

export default function HomePage({setopenPrompt, RoomUsers, setRoomUsers, setMain}){

    useEffect(()=>{
        console.log(RoomUsers);
    }, [RoomUsers]);

    function handleRandom(){
        const userID = nanoid(6);
        console.log(userID);
        const socket = io("http://localhost:3000");

        socket.emit("random", userID, 2);

        socket.on("randomFound", (usersArray)=>{
            setRoomUsers(usersArray);
            setMain("game");
        });

    }
    return(
        <div>
            <h1>Welcome to the Game!!!!</h1>
            <button onClick={()=> setopenPrompt(true)}>Join with Friend</button>
            <button onClick={handleRandom}>Join with Random</button>
        </div>
    )
}

