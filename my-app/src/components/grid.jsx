import { useState, useRef, useEffect } from "react";
import { io




 } from "socket.io-client";


export default function DotGrid() {
  const canvasRef = useRef(null);
  const [dots, setDots] = useState([]);
  const [lines, setLines] = useState([]);
  const [selectedDot, setSelectedDot] = useState(null);

  const gridSize = 5; // Number of dots per row/column
  const dotSpacing = 100; // Space between dots
  const SquareMap = Array(gridSize).fill(null).map(()=>Array(gridSize).fill(0));

  useEffect(() => {
    const newDots = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        newDots.push({ x: j * dotSpacing + 50, y: i * dotSpacing + 50 });
      }
    }
    setDots(newDots);
    drawGrid(newDots, []);
  }, []);

  const checkForSquare = () => {
    for (let i = 0; i < dots.length; i++) {
      for (let j = 0; j < dots.length; j++) {
        if (i === j) continue;
  
        const dotA = dots[i];
        const dotB = dots[j];
  
        // Check if they form a horizontal or vertical line of length 100
        if (Math.abs(dotA.x - dotB.x) === 100 && dotA.y === dotB.y) {
          // Find the two other dots that would complete the square
          const dotC = dots.find((d) => d.x === dotA.x && d.y === dotA.y + 100);
          const dotD = dots.find((d) => d.x === dotB.x && d.y === dotB.y + 100);
  
          if (dotC && dotD) {
            // Check if all 4 sides exist in the lines array
            const hasAllSides = [
              { start: dotA, end: dotB },
              { start: dotA, end: dotC },
              { start: dotB, end: dotD },
              { start: dotC, end: dotD }
            ].every(({ start, end }) =>
              lines.some(line =>
                (line.start === start && line.end === end) || 
                (line.start === end && line.end === start)
              )
            );
  
            if (hasAllSides) {
              hasAllSides.every(({start, end})=> {
                const row = start
              })
              console.log("🎉 Square Detected!");
            }
          }
        }
      }
    }
  };

  const drawGrid = (dots, lines) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw dots
    dots.forEach((dot) => {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "black";
      ctx.fill();
    });

    // Draw lines
    lines.forEach(({ start, end }) => {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.stroke();

    });
  };

  const handleCanvasClick = (event) => {
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
            setLines([...lines, { start: selectedDot, end: clickedDot }]);
            drawGrid(dots, [...lines, { start: selectedDot, end: clickedDot }]);
            checkForSquare();
        }
        else console.log("Can't draw a line like that!!!");
        setSelectedDot(null);
      } else {
        setSelectedDot(clickedDot);
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="border"
        onClick={handleCanvasClick}
      ></canvas>
    </div>
  );
}
