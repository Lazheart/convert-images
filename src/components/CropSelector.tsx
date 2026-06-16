import React, { useRef, useState, useEffect } from 'react';
import type { CropArea } from '../types';

interface CropSelectorProps {
  imageUrl: string;
  cropArea: CropArea;
  onChange: (area: CropArea) => void;
}

type DragHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | 'move' | null;

export const CropSelector: React.FC<CropSelectorProps> = ({ imageUrl, cropArea, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [activeHandle, setActiveHandle] = useState<DragHandle>(null);
  const dragStartRef = useRef<{ x: number; y: number; cropX: number; cropY: number; cropW: number; cropH: number }>({
    x: 0,
    y: 0,
    cropX: 0,
    cropY: 0,
    cropW: 0,
    cropH: 0,
  });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, handle: DragHandle) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!containerRef.current) return;
    
    setActiveHandle(handle);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      cropX: cropArea.x,
      cropY: cropArea.y,
      cropW: cropArea.width,
      cropH: cropArea.height,
    };
    
    containerRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeHandle || !containerRef.current || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;
    
    let { cropX, cropY, cropW, cropH } = dragStartRef.current;
    
    const minSize = 5; // minimum crop size in percentage

    if (activeHandle === 'move') {
      cropX = Math.max(0, Math.min(100 - cropW, cropX + deltaX));
      cropY = Math.max(0, Math.min(100 - cropH, cropY + deltaY));
    } else {
      // Handle resizing based on handle type
      if (activeHandle.includes('w')) { // left resize
        const maxX = cropX + cropW - minSize;
        const newX = Math.max(0, Math.min(maxX, cropX + deltaX));
        cropW = cropW + (cropX - newX);
        cropX = newX;
      }
      if (activeHandle.includes('e')) { // right resize
        cropW = Math.max(minSize, Math.min(100 - cropX, cropW + deltaX));
      }
      if (activeHandle.includes('n')) { // top resize
        const maxY = cropY + cropH - minSize;
        const newY = Math.max(0, Math.min(maxY, cropY + deltaY));
        cropH = cropH + (cropY - newY);
        cropY = newY;
      }
      if (activeHandle.includes('s')) { // bottom resize
        cropH = Math.max(minSize, Math.min(100 - cropY, cropH + deltaY));
      }
    }

    onChange({
      x: parseFloat(cropX.toFixed(2)),
      y: parseFloat(cropY.toFixed(2)),
      width: parseFloat(cropW.toFixed(2)),
      height: parseFloat(cropH.toFixed(2)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeHandle) return;
    setActiveHandle(null);
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  // Reset to default crop if image changes
  useEffect(() => {
    onChange({ x: 10, y: 10, width: 80, height: 80 });
  }, [imageUrl]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 text-center">
        Arrastra los bordes para recortar la imagen, o arrastra el centro para mover la selección.
      </p>
      
      <div 
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative select-none max-h-[500px] overflow-hidden rounded-lg shadow-lg checkerboard border border-slate-300 dark:border-slate-700"
        style={{ touchAction: 'none' }}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Para recortar"
          className="max-h-[500px] object-contain block pointer-events-none"
          onLoad={() => {
            // Force redraw or sync
          }}
        />

        {/* Shading outside crop area */}
        <div className="absolute inset-0 bg-black/60 pointer-events-none">
          {/* Inner cutout with borders */}
          <div 
            className="absolute border border-purple-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] transition-shadow duration-75"
            style={{
              left: `${cropArea.x}%`,
              top: `${cropArea.y}%`,
              width: `${cropArea.width}%`,
              height: `${cropArea.height}%`,
            }}
          />
        </div>

        {/* Interactive Cropping Rectangle */}
        <div
          onPointerDown={(e) => handlePointerDown(e, 'move')}
          className="absolute cursor-move border border-dashed border-white"
          style={{
            left: `${cropArea.x}%`,
            top: `${cropArea.y}%`,
            width: `${cropArea.width}%`,
            height: `${cropArea.height}%`,
          }}
        >
          {/* Rule of Thirds Grid Lines */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
            <div className="border-r border-b border-white/40 col-span-1 row-span-1"></div>
            <div className="border-r border-b border-white/40 col-span-1 row-span-1"></div>
            <div className="border-b border-white/40 col-span-1 row-span-1"></div>
            <div className="border-r border-b border-white/40 col-span-1 row-span-1"></div>
            <div className="border-r border-b border-white/40 col-span-1 row-span-1"></div>
            <div className="border-b border-white/40 col-span-1 row-span-1"></div>
          </div>

          {/* Corner Resizing Handles */}
          {/* NW */}
          <div
            onPointerDown={(e) => handlePointerDown(e, 'nw')}
            className="absolute -top-1.5 -left-1.5 w-4.5 h-4.5 bg-white border-2 border-purple-600 rounded-sm cursor-nwse-resize shadow-md hover:bg-purple-500 active:bg-purple-700"
          />
          {/* NE */}
          <div
            onPointerDown={(e) => handlePointerDown(e, 'ne')}
            className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-white border-2 border-purple-600 rounded-sm cursor-nesw-resize shadow-md hover:bg-purple-500 active:bg-purple-700"
          />
          {/* SW */}
          <div
            onPointerDown={(e) => handlePointerDown(e, 'sw')}
            className="absolute -bottom-1.5 -left-1.5 w-4.5 h-4.5 bg-white border-2 border-purple-600 rounded-sm cursor-nesw-resize shadow-md hover:bg-purple-500 active:bg-purple-700"
          />
          {/* SE */}
          <div
            onPointerDown={(e) => handlePointerDown(e, 'se')}
            className="absolute -bottom-1.5 -right-1.5 w-4.5 h-4.5 bg-white border-2 border-purple-600 rounded-sm cursor-nwse-resize shadow-md hover:bg-purple-500 active:bg-purple-700"
          />

          {/* Edge Resizing Handles */}
          {/* North */}
          <div
            onPointerDown={(e) => handlePointerDown(e, 'n')}
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 flex items-center justify-center cursor-ns-resize"
          >
            <div className="w-4 h-1.5 bg-purple-600 rounded-full shadow-sm" />
          </div>
          {/* South */}
          <div
            onPointerDown={(e) => handlePointerDown(e, 's')}
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-3 flex items-center justify-center cursor-ns-resize"
          >
            <div className="w-4 h-1.5 bg-purple-600 rounded-full shadow-sm" />
          </div>
          {/* West */}
          <div
            onPointerDown={(e) => handlePointerDown(e, 'w')}
            className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-8 flex items-center justify-center cursor-ew-resize"
          >
            <div className="h-4 w-1.5 bg-purple-600 rounded-full shadow-sm" />
          </div>
          {/* East */}
          <div
            onPointerDown={(e) => handlePointerDown(e, 'e')}
            className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-8 flex items-center justify-center cursor-ew-resize"
          >
            <div className="h-4 w-1.5 bg-purple-600 rounded-full shadow-sm" />
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-3 text-xs text-slate-600 dark:text-slate-300 font-mono bg-slate-200/50 dark:bg-slate-800/80 px-3 py-1.5 rounded-full">
        <span>X: {cropArea.x}%</span>
        <span>Y: {cropArea.y}%</span>
        <span>W: {cropArea.width}%</span>
        <span>H: {cropArea.height}%</span>
      </div>
    </div>
  );
};
