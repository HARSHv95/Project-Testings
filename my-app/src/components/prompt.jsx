import { Fragment, useState , useContext} from "react";
import { Dialog , DialogActions, DialogContent, DialogTitle} from "@mui/material";
import { nanoid } from "nanoid";
import { SocketContext } from "./socketConnection";
import ToggleSwitch from "./ToggleSwitch";


const userID = nanoid(6);


export default function RenderPrompt({setMain, setopenPrompt, openPrompt}){

    const [RoomState, setRoomState] = useState("join");
    const {socket, connectSocket} = useContext(SocketContext);

    const handleCreateClick = () => {
        setRoomState("create");
        const SocketConnection = connectSocket();
        if(SocketConnection){
            SocketConnection.emit("create", userID, 2);
            SocketConnection.on("roomCreated", (ID)=>{
                setMain("game");
            })
        }

    }
    return(
        <Fragment>
            <Dialog open={openPrompt} onClose={()=>{setMain("home"); setopenPrompt(false)}}>
                <DialogTitle><div style={{display : "flex", flexDirection : "row", justifyContent : "space-between"}}><button onClick={()=>setRoomState("create")}>Create Room</button><button onClick={()=>setRoomState("join")}>Join Room</button></div></DialogTitle>
                <DialogContent>
                    {RoomState === "join" ? (<><div>Enter room id</div>
                    <div><input type="text" /></div></>) : (<><div>Room ID:- {userID}</div><ToggleSwitch initialState={false}/></>)}
                </DialogContent>
                <DialogActions>{RoomState === "join" ? (<button style={{backgroundColor : "gray", color : "white"}} onClick={()=>{setMain("game"); setopenPrompt(false)} }>Join</button>): (<div><button style={{backgroundColor : "gray", color : "white"}} onClick={()=>{setMain("game"); setopenPrompt(false)} }>Start</button></div>)}</DialogActions>
            </Dialog>
        </Fragment>
    )
}