import { useState, useRef, useEffect, useContext } from "react";
import { Fragment } from "react";
import { SocketContext } from "./socketConnection";


export default function DotGrid({setMain, main, RoomID}) {
  const canvasRef = useRef(null);
  const [dots, setDots] = useState([]);
  const [lines, setLines] = useState([]);
  const [selectedDot, setSelectedDot] = useState(null);
  const [Turn , setTurn] = useState(null);
  const {socket, disconnectSocket} = useContext(SocketContext);
  const [CompletedSquares, setCompletedSquares] = useState([]);

  const gridSize = 5;
  const dotSpacing = 100; 

  useEffect(() => {
    const newDots = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        newDots.push({ x: j * dotSpacing + 50, y: i * dotSpacing + 50 });
      }
    }
    setDots(newDots);
    drawGrid(newDots, []);

    socket.emit("TurnDecide", RoomID);

    socket.on("YourTurn", ()=>{
      setTurn(true);
      console.log("hey");
    })

    socket.on("OpponentTurn", ()=>{
      setTurn(false);
      console.log("hi");
    })

    socket.on("PlayerLeft", ()=>{
      disconnectSocket();
      setMain("home");
    })

    socket.on("oppositeMove", (updateLines, turn)=>{
      console.log("Update lines received:- ", updateLines);
      setLines(updateLines);
      setTurn(!turn);
      console.log("Lines and turn updated:- ", updateLines, !turn);
    })
  }, []);

  useEffect(()=>{
    drawGrid(dots, lines);
  }, [dots, lines]);

  const checkForSquare = (newLines) => {

    if(lines.length === 0)return;

    const newSquares = [];
    let squareDetect = false;

    for (let i = 0; i < dots.length; i++) {
      for (let j = 0; j < dots.length; j++) {
        if (i === j) continue;
  
        const dotA = dots[i];
        const dotB = dots[j];
  
        
        if (Math.abs(dotA.x - dotB.x) === 100 && dotA.y === dotB.y) {
          const dotC = dots.find((d) => d.x === dotA.x && d.y === dotA.y + 100);
          const dotD = dots.find((d) => d.x === dotB.x && d.y === dotB.y + 100);
  
          if (dotC && dotD) {
            const hasAllSides = [
              { start: dotA, end: dotB },
              { start: dotA, end: dotC },
              { start: dotB, end: dotD },
              { start: dotC, end: dotD }
            ].every(({ start, end }) =>
              newLines.some(line =>
                (line.start.x === start.x && line.start.y === start.y &&
                 line.end.x === end.x && line.end.y === end.y) ||
                (line.start.x === end.x && line.start.y === end.y &&
                 line.end.x === start.x && line.end.y === start.y)
              )
              
            );

            const key = `${dotA.x},${dotA.y}`;
  
            if (hasAllSides  && !CompletedSquares.includes(key)) {
              console.log("🎉 Square Detected!");
              newSquares.push(key);
              squareDetect = true;
            }
          }
        }
      }
    }

    if(newSquares.length > 0){
      setCompletedSquares(prev => [...prev, ...newSquares])
    }

    return squareDetect;
  };

  const drawGrid = (dots, lines) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dots.forEach((dot) => {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "black";
      ctx.fill();
    });

    lines?.forEach(({ start, end }) => {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.stroke();

    });
  };

  const handleCanvasClick = (event) => {
    if(!Turn){
      console.log("Not your Turn!!");
      return;
    }
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    let clickedDot = null;
    dots.forEach((dot) => {
      const distance = Math.sqrt((clickX - dot.x) ** 2 + (clickY - dot.y) ** 2);
      if (distance < 10) {
        clickedDot = dot;
      }
    });

    if (clickedDot) {
      if (selectedDot) {
        const distance = Math.sqrt((clickedDot.x - selectedDot.x)**2 + (clickedDot.y-selectedDot.y)**2);
        if((selectedDot.x === clickedDot.x || selectedDot.y === clickedDot.y) && distance === 100){
            const newLines = [...lines, { start: selectedDot, end: clickedDot }];
            setLines(newLines);

            const formSquare = checkForSquare(newLines);

            socket.emit("move", newLines, formSquare ? true : false, RoomID);

            console.log("New Lines :-", newLines, formSquare); 

            if(!formSquare){
              setTurn(false);
            }
        }
        else console.log("Can't draw a line like that!!!");
        setSelectedDot(null);
      } else {
        setSelectedDot(clickedDot);
      }
    }
  };

  const handleButton = ()=>{
    socket.emit("leave", RoomID);
    disconnectSocket();
    setMain("home")
  }

  return (
    <Fragment>
    <div className="flex justify-center items-center h-screen">
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="border"
        onClick={handleCanvasClick}
      ></canvas>
    </div>
    <div>{Turn ? <h1>Your Turn</h1> : <h1>Opponent Turn</h1>}</div>
    <button onClick={handleButton}>Leave the Game</button>
    </Fragment>
  );
}
