'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { shaders, Shader } from '@/lib/shaders'

function ShaderPreview({ shader, onClick, isPlaying, togglePlay, onHover }: {
  shader: Shader;
  onClick: () => void;
  isPlaying: boolean;
  togglePlay?: () => void;
  onHover: (id: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastFrameTimeRef = useRef(0);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsedTime = (time - startTimeRef.current) * 0.001; // Convert to seconds
      shader.shader(ctx, elapsedTime);
      lastFrameTimeRef.current = elapsedTime;
      
      if (isPlaying) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    if (isPlaying) {
      startTimeRef.current = 0; // Reset start time when animation starts
      animationFrameId = requestAnimationFrame(render);
    } else {
      // Render the last frame when not playing
      shader.shader(ctx, lastFrameTimeRef.current);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [shader, isPlaying]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => onHover(shader.id)}
      className="text-left w-full"
    >
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={300} 
        className="w-full aspect-video"
      />
      <div className="font-mono text-xs tracking-wider mt-2 flex justify-between items-center">
        <span>{shader.name}</span>
        {togglePlay && (
          <button 
            onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
            className="text-xs border border-white px-2 py-1 rounded"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        )}
      </div>
    </button>
  );
}

export default function ShaderGallery() {
  const [selectedShader, setSelectedShader] = useState<Shader | null>(null);
  const [playingShader, setPlayingShader] = useState(1); // Start with the first shader playing
  const [hoveredShader, setHoveredShader] = useState<number | null>(null);

  const handleShaderClick = (shader: Shader) => {
    setSelectedShader(shader);
    setPlayingShader(shader.id);
  };

  const toggleModalShaderPlay = () => {
    if (selectedShader) {
      setPlayingShader(playingShader === selectedShader.id ? 0 : selectedShader.id);
    }
  };

  const handleShaderHover = (shaderId: number) => {
    setHoveredShader(shaderId);
    setPlayingShader(shaderId);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 flex justify-center">
      <div className="w-full max-w-2xl">
        <header className="mb-16 grid grid-cols-2 font-mono text-xs tracking-wider">
          <div>FLOGUO LABS</div>
          <div className="text-right">
            <Link href="https://x.com/floguo" target="_blank" rel="noopener noreferrer" className="hover:underline">
              X: @floguo
            </Link>
          </div>
        </header>

        <div className="mb-16 font-mono text-xs">
          <div className="text-neutral-500 mb-2">ABOUT</div>
          <div>A collection of shader experiments</div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {shaders.map((shader) => (
            <ShaderPreview
              key={shader.id}
              shader={shader}
              onClick={() => handleShaderClick(shader)}
              isPlaying={playingShader === shader.id}
              onHover={handleShaderHover}
            />
          ))}
        </div>

        <Dialog open={!!selectedShader} onOpenChange={() => setSelectedShader(null)}>
          <DialogContent className="sm:max-w-[600px] bg-black text-white border-neutral-800 p-6">
            <div className="relative pt-6">
              {selectedShader && (
                <ShaderPreview 
                  shader={selectedShader} 
                  onClick={() => {}} 
                  isPlaying={playingShader === selectedShader.id}
                  togglePlay={toggleModalShaderPlay}
                  onHover={() => {}}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}