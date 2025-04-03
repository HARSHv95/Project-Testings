import { Fragment } from "react";
import { Dialog , DialogActions, DialogContent, DialogTitle} from "@mui/material";
import { useState } from "react";
import { nanoid } from "nanoid";
import { io } from "socket.io-client";



const userID = nanoid(6);


export default function RenderPrompt({setMain, setopenPrompt, openPrompt}){
    // const [PromptBlock, setPromptBlock] = useState("create");
    return(
        <Fragment>
            <Dialog open={openPrompt} onClose={()=>{setMain("home"); setopenPrompt(false)}}>
                <DialogTitle><div style={{display : "flex", flexDirection : "row", justifyContent : "space-between"}}><button>Create Room</button><button >Join Room</button></div></DialogTitle>
                <DialogContent>
                    <div>Enter room id</div>
                    <div><input type="text" /></div>
                </DialogContent>
                <DialogActions><button style={{backgroundColor : "gray", color : "white"}} onClick={()=>{setMain("game"); setopenPrompt(false)} }>Join</button></DialogActions>
            </Dialog>
        </Fragment>
    )
}