"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [mounted, setMounted] = useState(false);
  const [systemId, setSystemId] = useState("000000");

  useEffect(() => {
    setMounted(true);
    setSystemId(Math.floor(Math.random() * 999999).toString());
  }, []);

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 9);
    router.push(`/${newRoomId}`);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/${roomId}`);
    }
  };

  // Prevent Hydration Mismatch
  if (!mounted) return <div className="w-screen h-screen bg-black" />;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#050505',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: 'monospace'
      }}
    >
      
      {/* --- BACKGROUND GRID ANIMATION --- */}
      <style jsx global>{`
        @keyframes scan {
          0% { background-position: 0% 0%; }
          100% { background-position: 0% 100%; }
        }
        .cyber-grid {
          background-image: 
            linear-gradient(rgba(0, 255, 249, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 249, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: scan 10s linear infinite;
        }
      `}</style>
      
      <div className="cyber-grid" style={{ position: 'absolute', inset: 0, opacity: 0.3 }} />

      {/* --- MAIN CARD (Explicit Width/Height to stop clustering) --- */}
      <div 
        style={{
          position: 'relative',
          zIndex: 10,
          width: '500px',            // FORCED WIDTH
          padding: '40px',           // FORCED PADDING
          backgroundColor: 'rgba(10, 10, 15, 0.9)',
          border: '1px solid #333',
          boxShadow: '0 0 40px rgba(0, 255, 249, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',               // FORCED GAP
          borderRadius: '12px'
        }}
      >
        
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: '#fffc00', 
            textShadow: '0 0 20px rgba(255, 252, 0, 0.5)',
            margin: 0,
            letterSpacing: '4px'
          }}>
            CO-DRAW
          </h1>
          <p style={{ color: '#00fff9', fontSize: '12px', letterSpacing: '4px', marginTop: '10px' }}>
            SECURE TERMINAL v3.0
          </p>
        </div>

        {/* Option 1: Create */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
           <label style={{ fontSize: '10px', color: '#666', letterSpacing: '2px' }}>PROTOCOL 01</label>
           <button
             onClick={createRoom}
             style={{
               height: '60px',
               background: 'rgba(0, 255, 249, 0.05)',
               border: '1px solid rgba(0, 255, 249, 0.3)',
               color: '#00fff9',
               fontSize: '16px',
               fontWeight: 'bold',
               letterSpacing: '2px',
               cursor: 'pointer',
               transition: 'all 0.2s',
             }}
             onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0, 255, 249, 0.2)'}
             onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0, 255, 249, 0.05)'}
           >
             INITIALIZE NEW ROOM
           </button>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.3 }}>
          <div style={{ flex: 1, height: '1px', background: '#00fff9' }} />
          <span style={{ fontSize: '10px', color: '#00fff9' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#00fff9' }} />
        </div>

        {/* Option 2: Join */}
        <form onSubmit={joinRoom} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '10px', color: '#666', letterSpacing: '2px' }}>PROTOCOL 02</label>
            <input
              type="text"
              placeholder="ENTER ACCESS CODE"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              style={{
                height: '50px',
                background: '#000',
                border: '1px solid #333',
                color: '#fff',
                textAlign: 'center',
                fontSize: '18px',
                letterSpacing: '3px',
                outline: 'none'
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={!roomId}
            style={{
              height: '50px',
              background: roomId ? '#fff' : '#222',
              color: roomId ? '#000' : '#555',
              border: 'none',
              fontWeight: 'bold',
              letterSpacing: '2px',
              cursor: roomId ? 'pointer' : 'not-allowed',
            }}
          >
            CONNECT
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '10px', color: '#444', marginTop: '10px' }}>
          ID: {systemId} // ENCRYPTED
        </div>

      </div>
    </div>
  );
}