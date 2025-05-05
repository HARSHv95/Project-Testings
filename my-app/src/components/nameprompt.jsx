import { Fragment, useState, useContext, useEffect } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import "./nameprompt.css";

export default function RenderNamePrompt({ Name, setName, openNamePrompt, setOpenNamePrompt }) {

    const handleClose = () => {
        if (Name.length > 0) {
            setOpenNamePrompt(false);
        }
    }

    return (
        <Dialog open={openNamePrompt} onClose={handleClose}
            PaperProps={{ className: "dialog-container" }}
        >
            <DialogTitle className="dialog-title">Enter your name</DialogTitle>
            <DialogContent className="dialog-content">
                <input type="text" value={Name} onChange={(e) => setName(e.target.value)} />
            </DialogContent>
            <DialogActions className="dialog-actions">
                <button onClick={handleClose}>Submit</button>
            </DialogActions>
        </Dialog>
    )
}
