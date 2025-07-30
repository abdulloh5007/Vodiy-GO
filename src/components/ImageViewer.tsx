
'use client';

import Image from 'next/image';
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ImageViewerProps {
  imageUrl: string | null;
  onOpenChange: (open: boolean) => void;
}

const MAX_ZOOM = 8;
const MIN_ZOOM = 1;

export function ImageViewer({ imageUrl, onOpenChange }: ImageViewerProps) {
  const isOpen = !!imageUrl;
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [scale, setScale] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const pinchStartDistance = useRef<number | null>(null);

  const resetState = useCallback(() => {
    setScale(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || scale <= MIN_ZOOM) return;
    e.preventDefault();
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setOffset({ x: newX, y: newY });
  };
  
  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (scale > MIN_ZOOM) {
      resetState();
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newScale = 3;

      setOffset({
        x: -(x * newScale - rect.width / 2 - (x - rect.width / 2)),
        y: -(y * newScale - rect.height / 2 - (y - rect.height/2)),
      });
      setScale(newScale);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale - e.deltaY * 0.01));
    setScale(newScale);
    if (newScale === MIN_ZOOM) {
      resetState();
    }
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDistance.current = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistance.current) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDist = Math.sqrt(dx * dx + dy * dy);
        const scaleChange = newDist / pinchStartDistance.current;

        setScale(prevScale => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prevScale * scaleChange)));
        pinchStartDistance.current = newDist;
    }
  };
  
  const handleTouchEnd = () => {
    pinchStartDistance.current = null;
    if (scale === MIN_ZOOM) {
      resetState();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onOpenChange(false);
      }
    }}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/80" />
        <DialogContent 
          className="bg-transparent border-0 shadow-none p-0 w-screen h-screen max-w-none flex items-center justify-center overflow-hidden"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onWheel={handleWheel}
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <VisuallyHidden>
            <DialogTitle>Image Viewer</DialogTitle>
          </VisuallyHidden>

          <div
            className={cn("w-full h-full relative", isDragging && scale > 1 ? 'cursor-grabbing' : 'cursor-grab')}
            onDoubleClick={handleDoubleClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {imageUrl && (
              <Image
                ref={imageRef}
                src={imageUrl}
                alt="Fullscreen view" 
                fill
                style={{ 
                  objectFit: 'contain',
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                }}
                className="pointer-events-none"
                draggable={false}
              />
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
