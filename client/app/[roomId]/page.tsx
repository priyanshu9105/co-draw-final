"use client";

import { useEffect, useState } from "react";
import { useDraw } from "@/hooks/useDraw";
import { io } from "socket.io-client";
import { useParams, useRouter } from "next/navigation";

const socket = io("http://localhost:3001");

const COLORS = ["#ffffff", "#ff00ff", "#00fff9", "#0f0", "#fffc00", "#ff4444"];

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = Array.isArray(params?.roomId) ? params.roomId[0] : params?.roomId;

  const [color, setColor] = useState<string>(COLORS[2]);
  const [lineWidth, setLineWidth] = useState<number>(5);
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");
  const { canvasRef, onMouseDown, clear } = useDraw(createLine);
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    
    if (roomId) socket.emit("join-room", roomId);

    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [roomId]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("draw-line", ({ prevPoint, currentPoint, color, width, mode }: any) => {
      if (!ctx) return;
      drawLine({ ctx, currentPoint, prevPoint, strokeColor: color, strokeWidth: width, mode });
    });
    socket.on("clear", clear);
    return () => {
      socket.off("connect"); socket.off("disconnect"); socket.off("draw-line"); socket.off("clear");
    };
  }, [canvasRef, clear]);

  function createLine({ ctx, currentPoint, prevPoint }: any) {
    const mode = tool;
    const strokeColor = color;
    const strokeWidth = tool === "eraser" ? 30 : lineWidth; 
    socket.emit("draw-line", { prevPoint, currentPoint, color: strokeColor, width: strokeWidth, mode, roomId });
    drawLine({ ctx, currentPoint, prevPoint, strokeColor, strokeWidth, mode });
  }

  function drawLine({ ctx, currentPoint, prevPoint, strokeColor, strokeWidth, mode }: any) {
    const { x: currX, y: currY } = currentPoint;
    let startPoint = prevPoint ?? currentPoint;
    ctx.beginPath();
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    if (mode === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.shadowBlur = 0;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = strokeColor;
      ctx.shadowBlur = 10;
      ctx.shadowColor = strokeColor;
    }
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(currX, currY);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    ctx.shadowBlur = 0;
  }

  const handleClear = () => socket.emit("clear", roomId);
  const handleExit = () => router.push('/');

  if (!mounted) return <div style={{ background: '#000', height: '100vh' }} />;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#050505', overflow: 'hidden', fontFamily: 'monospace' }}>
      
      {/* --- REUSING THE COOL GRID ANIMATION FROM LOGIN PAGE --- */}
      <style jsx global>{`
        @keyframes scan { 0% { background-position: 0% 0%; } 100% { background-position: 0% 100%; } }
        .cyber-bg {
          background-image: linear-gradient(rgba(0, 255, 249, 0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0, 255, 249, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: scan 10s linear infinite;
        }
        .glass-panel {
          background: rgba(15, 15, 20, 0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 20px rgba(0,0,0,0.5);
          border-radius: 16px;
          padding: 20px;
        }
        .tool-btn { transition: all 0.2s; cursor: pointer; border: 1px solid transparent; }
        .tool-btn:hover { transform: scale(1.05); border-color: rgba(0,255,249,0.5); box-shadow: 0 0 15px rgba(0,255,249,0.2); }
      `}</style>

      {/* Background */}
      <div className="cyber-bg" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

      {/* Canvas */}
      <canvas ref={canvasRef} onMouseDown={onMouseDown} width={dimensions.width} height={dimensions.height} style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }} />

      {/* --- HUD: TOP LEFT (Title) --- */}
      <div style={{ position: 'fixed', top: '30px', left: '30px', zIndex: 50 }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#fffc00', textShadow: '0 0 20px rgba(255, 252, 0, 0.6)', margin: 0, letterSpacing: '2px' }}>
          CO-DRAW
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
           <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isConnected ? '#0f0' : '#f00', boxShadow: isConnected ? '0 0 10px #0f0' : 'none' }} />
           <span style={{ fontSize: '12px', color: '#888', letterSpacing: '2px' }}>ROOM: <span style={{ color: '#00fff9' }}>{roomId}</span></span>
        </div>
      </div>

      {/* --- HUD: TOP RIGHT (Exit) --- */}
      <button 
        onClick={handleExit}
        className="glass-panel tool-btn"
        style={{ position: 'fixed', top: '30px', right: '30px', zIndex: 50, color: '#ff4444', fontWeight: 'bold', padding: '10px 20px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}
      >
        EXIT SESSION
      </button>

      {/* --- HUD: LEFT (Colors) --- */}
      <div className="glass-panel" style={{ position: 'fixed', left: '30px', top: '50%', transform: 'translateY(-50%)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <span style={{ fontSize: '10px', color: '#666', textAlign: 'center', letterSpacing: '2px' }}>INK</span>
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => { setColor(c); setTool("pencil"); }}
            className="tool-btn"
            style={{ 
              width: '40px', height: '40px', borderRadius: '50%', background: c, 
              border: color === c ? '2px solid white' : 'none',
              boxShadow: color === c ? `0 0 15px ${c}` : 'none'
            }}
          />
        ))}
      </div>

      {/* --- HUD: RIGHT (Size) --- */}
      <div className="glass-panel" style={{ position: 'fixed', right: '30px', top: '50%', transform: 'translateY(-50%)', zIndex: 50, height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
         <span style={{ fontSize: '10px', color: '#666', textAlign: 'center', letterSpacing: '2px' }}>SIZE</span>
         <input 
            type="range" min="1" max="50" value={lineWidth} 
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical', width: '8px', height: '100%', background: '#333', borderRadius: '4px' }} 
         />
         <div style={{ width: '30px', height: '30px', background: '#fff', borderRadius: '50%', transform: `scale(${lineWidth/20})`, transition: 'transform 0.1s' }} />
      </div>

      {/* --- HUD: BOTTOM (Tools) --- */}
      <div className="glass-panel" style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 50, display: 'flex', gap: '20px' }}>
        
        <button onClick={() => setTool("pencil")} className="tool-btn" style={{ padding: '15px 30px', borderRadius: '12px', background: tool === 'pencil' ? 'rgba(0, 255, 249, 0.1)' : 'transparent', color: tool === 'pencil' ? '#00fff9' : '#888' }}>
          <span style={{ display: 'block', fontSize: '18px' }}>✏️</span>
          <span style={{ fontSize: '10px', letterSpacing: '2px', fontWeight: 'bold' }}>DRAW</span>
        </button>

        <button onClick={() => setTool("eraser")} className="tool-btn" style={{ padding: '15px 30px', borderRadius: '12px', background: tool === 'eraser' ? 'rgba(255, 0, 255, 0.1)' : 'transparent', color: tool === 'eraser' ? '#f0f' : '#888' }}>
          <span style={{ display: 'block', fontSize: '18px' }}>🧽</span>
          <span style={{ fontSize: '10px', letterSpacing: '2px', fontWeight: 'bold' }}>ERASE</span>
        </button>

        <div style={{ width: '1px', background: '#444' }} />

        <button onClick={handleClear} className="tool-btn" style={{ padding: '15px 30px', borderRadius: '12px', color: '#ff4444' }}>
          <span style={{ display: 'block', fontSize: '18px' }}>💣</span>
          <span style={{ fontSize: '10px', letterSpacing: '2px', fontWeight: 'bold' }}>NUKE</span>
        </button>

      </div>

    </div>
  );
}