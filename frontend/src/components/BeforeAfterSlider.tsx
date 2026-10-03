import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'ORIGINAL',
  afterLabel = 'ENHANCED',
  className = '',
}) => {
  const [sliderPos, setSliderPos] = useState(50); // Percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPos(percentage);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  }, [isDragging, handleMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  }, [isDragging, handleMove]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-xl bg-slate-950 border border-slate-800 ${className}`}
      onMouseDown={(e) => handleMove(e.clientX)}
    >
      {/* After Image (Background / Full Width) */}
      <img
        src={afterImage}
        alt="After Enhancement"
        className="w-full h-full object-contain pointer-events-none block"
      />
      <span className="absolute top-3 right-3 bg-brand-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm z-10">
        {afterLabel}
      </span>

      {/* Before Image (Clipped Overlay) */}
      <div
        className="absolute top-0 left-0 bottom-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={beforeImage}
          alt="Before Enhancement"
          className="w-full h-full object-contain pointer-events-none block max-w-none"
          style={{ width: containerRef.current ? containerRef.current.clientWidth : '100%' }}
        />
        <span className="absolute top-3 left-3 bg-slate-900/90 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm z-10">
          {beforeLabel}
        </span>
      </div>

      {/* Divider Bar */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPos}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-lg flex items-center justify-center border-2 border-slate-900">
          <ChevronsLeftRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
