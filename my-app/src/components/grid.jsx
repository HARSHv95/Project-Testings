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
      checkForSquare(updateLines, false);
      setTurn(!turn);
      console.log("Lines and turn updated:- ", updateLines, !turn);
    })
  }, []);

  useEffect(()=>{
    drawGrid(dots, lines, CompletedSquares);
  }, [dots, lines, CompletedSquares]);

  const checkForSquare = (newLines, isMyMove) => {

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

            const alreadyExists = CompletedSquares.some(
              (s) => s.x === dotA.x && s.y === dotA.y
            );
  
            if (hasAllSides  && !alreadyExists) {
              console.log("🎉 Square Detected!");
              newSquares.push({
              x: dotA.x,
              y: dotA.y,
              owner: isMyMove ? "Y" : "O",
              });
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

  const drawGrid = (dots, lines, CompletedSquares) => {
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

    CompletedSquares?.forEach(({ x, y, owner }) => {
      ctx.fillStyle = owner === "Y" ? "green" : "orange";
      ctx.font = "30px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(owner, x, y);
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
      if (distance < 25) {
        clickedDot = dot;
      }
    });

    if (clickedDot) {
      if (selectedDot) {
        const distance = Math.sqrt((clickedDot.x - selectedDot.x)**2 + (clickedDot.y-selectedDot.y)**2);
        if((selectedDot.x === clickedDot.x || selectedDot.y === clickedDot.y) && distance === 100){
            const newLines = [...lines, { start: selectedDot, end: clickedDot }];
            setLines(newLines);

            const formSquare = checkForSquare(newLines, true);

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
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 space-y-6">
    <canvas
      ref={canvasRef}
      width={600}
      height={600}
      className="border-4 border-blue-500 rounded-lg shadow-lg bg-white cursor-pointer"
      onClick={handleCanvasClick}
    ></canvas>

    <div className="text-xl font-semibold text-gray-700">
      {Turn ? "🎯 Your Turn" : "⏳ Opponent's Turn"}
    </div>

    <button
      onClick={handleButton}
      className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium shadow-md transition duration-300"
    >
      Leave the Game
    </button>
  </div>
</Fragment>

    
  );
}
