import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
  beforeImage,
  afterImage,
  className = '',
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const newPosition = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setPosition(newPosition);
  }, []);

  const handleMouseDown = () => setIsResizing(true);
  const handleTouchStart = () => setIsResizing(true);

  const handleMouseUp = useCallback(() => setIsResizing(false), []);
  const handleTouchEnd = useCallback(() => setIsResizing(false), []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing) updatePosition(e.clientX);
  }, [isResizing, updatePosition]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isResizing) updatePosition(e.touches[0].clientX);
  }, [isResizing, updatePosition]);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleMouseUp, handleTouchEnd, handleMouseMove, handleTouchMove]);

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setPosition(p => Math.max(0, p - 5));
    if (e.key === 'ArrowRight') setPosition(p => Math.min(100, p + 5));
  };

  return (
    <div className={`relative w-full max-w-5xl mx-auto select-none rounded-xl overflow-hidden shadow-2xl shadow-cyan-900/20 border border-slate-800 ${className}`}>
      <div 
        ref={containerRef}
        className="relative w-full h-auto aspect-[16/9] sm:aspect-auto bg-slate-900 cursor-col-resize group"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-valuenow={position}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Comparison slider"
      >
        {/* After Image (Processed - Background) */}
        <img
          src={afterImage}
          alt="Processed (Clean)"
          className="absolute inset-0 w-full h-full object-contain select-none"
          draggable={false}
        />

        {/* Label After */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full z-10 pointer-events-none border border-white/10">
          CLEAN
        </div>

        {/* Before Image (Original - Foreground Clipped) */}
        <div
          className="absolute inset-0 h-full overflow-hidden bg-slate-900/50 border-r border-white/20"
          style={{ width: `${position}%` }}
        >
          <img
            src={beforeImage}
            alt="Original (Watermarked)"
            className="absolute top-0 left-0 h-full max-w-none object-contain select-none"
            // We must explicitly set the width of the inner image to match the container width
            // so it aligns perfectly with the background image.
            // Since we don't know the exact pixel width in CSS easily without calc or layout,
            // object-fit: contain handles it, BUT the inner image needs to span the full container width.
            // In a real-world scenario with different aspect ratios, calculating the exact container rect is better.
            // For this CSS implementation:
            style={{ width: containerRef.current?.getBoundingClientRect().width || '100%' }}
            draggable={false}
          />
          
          {/* Label Before */}
           <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full pointer-events-none border border-white/10">
            ORIGINAL
          </div>
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white/50 backdrop-blur-sm cursor-col-resize z-20 flex items-center justify-center group-hover:bg-cyan-400 transition-colors"
          style={{ left: `${position}%` }}
        >
          <div className="w-8 h-8 -ml-3.5 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 border-2 border-cyan-500 transform transition-transform group-hover:scale-110">
            <MoveHorizontal size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};