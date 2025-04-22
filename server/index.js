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
        origin : "http://localhost:5174",
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
                            io.to(ID).emit("randomFound" , key)
                        })
                        console.log(key);

                    }
                }
            }
        })

        console.log(users);

        if(!added){
            users[userID] = {id : [socket?.id],
                vacant : "true",
                size : roomSize-1,
                TurnDecide : false
            };

            console.log(users);
            // console.log(userID);
        }
    })

    socket.on("TurnDecide", (key)=>{
        if(!users[key].TurnDecide){
            const random = Math.floor(Math.random() * 2) + 1;

            if(random === 1){
                io.to(users[key].id[0]).emit("YourTurn");
                io.to(users[key].id[1]).emit("OpponentTurn");
            }
            else{
                io.to(users[key].id[1]).emit("YourTurn");
                io.to(users[key].id[0]).emit("OpponentTurn");
            }
            users[key].TurnDecide = true;
            console.log(random, users[key].id[random-1]);
        }
    })

    socket.on("move", (lines, Turn, key)=>{
        users[key].id.forEach((user)=>{
            if(user != socket?.id){
                io.to(user).emit("oppositeMove",lines, Turn)
                console.log(user, lines);
            }
        })
    })

    socket.on("leave", (key)=>{
        users[key]?.id.forEach((user)=>{
            if(socket?.id != user){
                io.to(user).emit("PlayerLeft");
            }
        })
        delete users[key];
        console.log(users);
    })
});

server.listen(3000, ()=>{
    console.log("Server running on port 3000");
})