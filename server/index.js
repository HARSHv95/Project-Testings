const express = require("express");
const app = express();
const { Server } = require("socket.io");
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    }
});

let users = {};

io.on("connection", (socket) => {
    console.log(socket?.id);

    socket.on("random", (userID, roomSize, username) => {
        let added = false;
        Object.entries(users).forEach(([key, value]) => {
            console.log("Hello")
            let { id, vacant, size, party } = value
            if (vacant && !added && party === "open") {
                if (value.class === "room") {
                    value.id.push(socket?.id);
                    value.members.push(username);
                    value.size = size - 1;
                    if (value.size === 0) value.vacant = false;
                    added = true;
                    value.id.forEach((ID) => {
                        if (ID !== socket?.id) {
                            io.to(ID).emit("roomupdate", key, 2,value.members);
                        }
                        else {
                            io.to(socket?.id).emit("randomroomFound", key, 2,value.members);
                        }
                    })
                }
                else if (Array.isArray(id)) {
                    const idFind = id.find(ID => ID === socket?.id);
                    if (!idFind) {
                        users[key].id.push(socket?.id);
                        users[key].size = size - 1;
                        if (users[key].size === 0) users[key].vacant = false;
                        added = true;
                        users[key].members.push(username);
                        id.forEach((ID) => {
                            io.to(ID).emit("randomFound", key, users[key].members);
                        });
                        console.log(key);
                    }
                }
            }
        })

        console.log(users);

        if (!added) {
            users[userID] = {
                id: [socket?.id],
                members : [username],
                vacant: "true",
                size: roomSize - 1,
                TurnDecide: false,
                party: "open",
                class: "random"
            };

            console.log(users);
            // console.log(userID);
        }
    })

    socket.on("TurnDecide", (key) => {
        if (!users[key].TurnDecide) {
            const random = Math.floor(Math.random() * 2) + 1;

            if (random === 1) {
                io.to(users[key].id[0]).emit("YourTurn");
                io.to(users[key].id[1]).emit("OpponentTurn");
            }
            else {
                io.to(users[key].id[1]).emit("YourTurn");
                io.to(users[key].id[0]).emit("OpponentTurn");
            }
            users[key].TurnDecide = true;
            console.log(random, users[key].id[random - 1]);
        }
    })

    socket.on("move", (lines, Turn, key) => {
        users[key].id.forEach((user) => {
            if (user != socket?.id) {
                io.to(user).emit("oppositeMove", lines, Turn)
                console.log(user, lines);
            }
        })
    })

    socket.on("leave", (key) => {
        users[key]?.id.forEach((user) => {
            if (socket?.id != user) {
                io.to(user).emit("PlayerLeft");
            }
        })
        delete users[key];
        console.log(users);
    })

    socket.on("create", (RoomID, roomSize, party, username) => {
        let alreadyadded = false;
        Object.entries(users).forEach(([key, value]) => {
            if (key === RoomID) {
                alreadyadded = true;
            }
        })

        if (!alreadyadded) {
            users[RoomID] = {
                id: [socket?.id],
                members: [username],
                vacant: "true",
                size: roomSize - 1,
                TurnDecide: false,
                party: "open",
                class: "room"
            };
            if(!party){
                users[RoomID].party = "close";
            }
            io.to(socket?.id).emit("roomCreated", RoomID, users[RoomID].members);
            console.log(users);
        }
        else {
            io.to(socket?.id).emit("roomAlreadyExists")
        }
    })

    socket.on("FindRoom", (userID, username) => {
        let exist = false;
        Object.entries(users).forEach(([key, value]) => {
            if (key === userID) exist = true;
        })

        if (exist) {
            if (users[userID].vacant === false) {
                io.to(socket?.id).emit("RoomFull", userID);
            }
            else {
                users[userID].id.push(socket?.id);
                users[userID].size = users[userID].size - 1;
                users[userID].vacant = false;
                users[userID].members.push(username);

                console.log(users[userID].id);

                io.to(socket?.id).emit("roomFound", userID, 2, users[userID].members);
                users[userID].id.forEach((user) => {
                    if (user != socket?.id) {
                        io.to(user).emit("roomupdate", userID, 2, users[userID].members);
                    }
                })
            }
        }
    })

    socket.on("gamestart", (ID) => {
        users[ID].id.forEach((user) => {
            if (user != socket?.id) {
                io.to(user).emit("Gamestart", ID)
            }
        })
    })

    socket.on("openparty", (ID) => {
        if (users[ID]) {
            users[ID].party = "open";
            console.log(ID, users[ID]);
        }
    })

    socket.on("closeparty", (ID) => {
        if (users[ID]) {
            users[ID].party = "close";
            console.log(ID, users[ID]);
        }
    });

    socket.on("PlayerLeft", (ID, username) => {
        if (users[ID]) {
            const arr = users[ID].id.filter((user) => user !== socket?.id);
            const arr1 = users[ID].members.filter((user) => user !== username);
            users[ID].members = arr1;
            users[ID].id.forEach((user) => {
                if (user != socket?.id) {
                    io.to(user).emit("roomupdate", ID, arr.length, arr1);
                }
            })
            users[ID].id = arr;
            users[ID].vacant = true;
            users[ID].size = 1;
            users[ID].TurnDecide = false;
            console.log(ID, users[ID]);
        }
    })

    socket.on("GameOver",(ID)=>{
        users[ID].id.forEach((user) => {
            io.to(user).emit("gameresult");
        })
    })

    socket.on("HostLeft", (ID) => {
        users[ID].id.forEach((user) => {
            io.to(user).emit("RoomClosed");
        })
        delete users[ID];
        console.log(users);
    })
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
})