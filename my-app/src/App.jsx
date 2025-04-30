import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import DotGrid from './components/grid';
import HomePage from './components/homepage';
import RenderPrompt from './components/prompt';

function App() {
  const [count, setCount] = useState(0);
  const [main, setMain] = useState("home");
  const [openPrompt, setopenPrompt] = useState(false);
  const [RoomID, setRoomID] = useState([]); 
  const [RoomSize, setRoomSize] = useState(0);
  const [RoomState, setRoomState] = useState("join");


  return (
    <div>
      {main === "home" 
        ? <HomePage setopenPrompt={setopenPrompt} RoomID={RoomID} setRoomID={setRoomID} setMain={setMain} setRoomSize={setRoomSize} setRoomState={setRoomState} />
        : <DotGrid setMain={setMain} main={main} RoomID={RoomID} /> 
      }
      <RenderPrompt setMain={setMain} setopenPrompt={setopenPrompt} openPrompt={openPrompt} RoomID={RoomID} setRoomID={setRoomID} RoomSize={RoomSize} setRoomSize={setRoomSize} RoomState={setRoomState} setRoomState={setRoomState}/>
    </div>
  );
}

export default App;
