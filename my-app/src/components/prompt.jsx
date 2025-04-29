import { Fragment, useState, useContext, useEffect } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { nanoid } from "nanoid";
import { SocketContext } from "./socketConnection";
import ToggleSwitch from "./ToggleSwitch";
import "./prompt.css";


const userID = nanoid(6);


export default function RenderPrompt({ setMain, setopenPrompt, openPrompt, RoomID, setRoomID }) {

    const [RoomState, setRoomState] = useState("join");
    const { socket, connectSocket, disconnectSocket } = useContext(SocketContext);
    const [OpenRoom, setOpenRoom] = useState(false);
    const [RoomSize, setRoomSize] = useState(0); // Default room size
    const [EnterId, setEnterId] = useState("");

   

    useEffect(() => {
        if (socket) {
            console.log("Socket disconnected");
            disconnectSocket();
        }
    }, [RoomState]);


    const handleCreateClick = () => {
        setRoomState("create");
        const SocketConnection = connectSocket();
        if (SocketConnection) {
            SocketConnection.emit("create", userID, 2);
            SocketConnection.on("roomCreated", (ID) => {
                console.log("Room Created!!!");
                setRoomID(ID);
                setRoomSize(1);
            })
            SocketConnection.on("roomupdate", (ID, size)=>{
                console.log(ID, size);
                setRoomSize(size);
            })
        }
    }

    const handleExitClick = () => {}

    const handleStartClick = () => {
        if (RoomSize > 1) {
            socket.emit("gamestart", RoomID);
            setMain("game");
            setopenPrompt(false);
        }
        else {
            alert("Not enough players to start the game. Please wait for more players to join.");
        }
    }

    const handleJoinClick = () => {
        if (EnterId === "") {
            alert("Enter a valid Room Id!!!");
        }
        else {
            console.log("Joining room with ID:", EnterId);
            const SocketConnection = connectSocket();
            if (SocketConnection) {
                SocketConnection.emit("FindRoom", EnterId);
                SocketConnection.on("roomFound", (ID, roomSize) => {
                    console.log("Room Found", ID, roomSize)
                    setRoomID(ID);
                    setRoomSize(roomSize);
                });
                SocketConnection.on("Gamestart", (ID)=>{
                    setMain("game");
                    setopenPrompt(false);
                })
            }
        }
    };
    return (
        <Fragment>
            <Dialog open={openPrompt} onClose={() => { setMain("home"); setopenPrompt(false); }}>
                <DialogTitle>
                    <div className="prompt-header">
                        <button className={`tab-button ${RoomState === "create" ? "active" : ""}`} onClick={handleCreateClick}>Create Room</button>
                        <button className={`tab-button ${RoomState === "join" ? "active" : ""}`} onClick={() => setRoomState("join")}>Join Room</button>
                    </div>
                </DialogTitle>
                <DialogContent>
                    {RoomState === "join" ? (
                        RoomID && RoomSize > 0 ? (
                            // When joined and RoomID exists, display the joined room window
                            <>
                                <div className="room-info">
                                    <div className="room-id">Room ID: {RoomID}</div>
                                    {/* If you have a member list from the server, render it here */}
                                    <div className="member-list-container">
                                        <div className="member-list-title">Members in Room:</div>
                                        <ul className="member-list">
                                            <li>Player 1</li>
                                            <li>Player 2</li>
                                            {/* You can map over a state (e.g., roomMembers) if available */}
                                        </ul>
                                    </div>
                                </div>
                            </>
                        ) : (
                            // If no RoomID yet, allow entering a Room ID
                            <>
                                <div className="input-label">Enter Room ID</div>
                                <div>
                                    <input
                                        type="text"
                                        className="input-field small-input"
                                        onChange={(e) => setEnterId(e.target.value)}
                                    />
                                </div>
                            </>
                        )
                    ) : (
                        // Create Room branch remains the same
                        <>
                            <div className="room-toggle-container">
                                <div className="room-id">Room ID: {userID}</div>
                                <ToggleSwitch OpenRoom={OpenRoom} setOpenRoom={setOpenRoom} />
                            </div>
                            <div className="open-party-label">
                                {OpenRoom ? <>Open Party</> : <>Closed Party</>}
                            </div>
                            <div className="member-list-container">
                                <div className="member-list-title">Members in Room:</div>
                                <ul className="member-list">
                                    <li>Player 1 (Host)</li>
                                    <li>
                                        {RoomSize === 2 ? <>Player 2 (Active)</> : <>Player 2 (Waiting...)</>}
                                    </li>
                                </ul>
                            </div>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    {RoomState === "join" ? (
                        RoomID && RoomSize > 0 ? (
                            <button className="action-button" onClick={handleExitClick}>Exit</button>
                        ) : (
                            <button className="action-button" onClick={handleJoinClick}>Join</button>
                        )
                    ) : (
                        <button className="action-button" onClick={handleStartClick}>Start</button>
                    )}
                </DialogActions>
            </Dialog>

        </Fragment>
    )
}