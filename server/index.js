const express = require("express");
const app = express();
const {Server} = require("socket.io");
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
    cors : {
        origin : "http://localhost:5173",
        methods : ["GET", "POST"],
    }
});

let users = {};

io.on("connection", (socket)=>{
    console.log(socket?.id);

    socket.on("random" , (userID, roomSize)=>{
        let added = false;
        Object.entries(users).forEach(([key, value])=>{
            console.log("Hello")
            let {id, vacant , size} = value
            if(vacant && !added){
                if(Array.isArray(id)){
                    const idFind = id.find(ID=> ID === socket?.id)
                    if(!idFind){
                        users[key].id.push(socket?.id);
                        users[key].size = size-1;
                        if(users[key].size === 0)users[key].vacant = false;
                        added = true;
                        id.forEach((ID)=>{
                            io.to(ID).emit("randomFound" ,id)
                        })
                        console.log(id);
                    }
                }
            }
        })

        console.log(users);

        if(!added){
            users[userID] = {id : [socket?.id],
                vacant : "true",
                size : roomSize-1
            };

            console.log(users);
            // console.log(userID);
        }
    })

    socket.on("turn", (RoomUsers, Turn)=>{
        RoomUsers.forEach((user)=>{
            if(user != socket?.id)io.to(user).emit("YourTurn", Turn)
        })
    })
});

server.listen(3000, ()=>{
    console.log("Server running on port 3000");
})