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
  const [RoomUsers, setRoomUsers] = useState([]);  // ✅ Ensure correct variable name

  return (
    <div>
      {main === "home" 
        ? <HomePage setopenPrompt={setopenPrompt} RoomUsers={RoomUsers} setRoomUsers={setRoomUsers} setMain={setMain} />
        : <DotGrid setMain={setMain} main={main} RoomUsers={RoomUsers} />  // ✅ Use correct variable name here
      }
      <RenderPrompt setMain={setMain} setopenPrompt={setopenPrompt} openPrompt={openPrompt} />
    </div>
  );
}

export default App;
