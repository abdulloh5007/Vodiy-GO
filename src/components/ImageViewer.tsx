
'use client';

import { AnimatePresence, motion, useAnimation, PanInfo } from 'framer-motion';
import Image from 'next/image';
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useState, useRef, useEffect, useCallback } from 'react';

interface ImageViewerProps {
  imageUrl: string | null;
  onOpenChange: (open: boolean) => void;
}

const MAX_ZOOM = 8;
const MIN_ZOOM = 1;


export function ImageViewer({ imageUrl, onOpenChange }: ImageViewerProps) {
  const isOpen = !!imageUrl;
  const imageRef = useRef<HTMLImageElement>(null);
  const controls = useAnimation();
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const resetState = useCallback(() => {
    setScale(MIN_ZOOM);
    setPosition({ x: 0, y: 0 });
    controls.set({ x: 0, y: 0, scale: MIN_ZOOM });
  }, [controls]);

  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);
  
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (scale === MIN_ZOOM && info.offset.y > 150) {
      onOpenChange(false);
    }
  }

  const handleDoubleClick = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (scale > MIN_ZOOM) {
        // Zoom out
        resetState();
    } else {
        // Zoom in to the point of click
        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        
        let x, y;
        if ('clientX' in event) { // MouseEvent
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        } else { // TouchEvent (use first touch)
            x = event.touches[0].clientX - rect.left;
            y = event.touches[0].clientY - rect.top;
        }

        const newScale = 3;
        const newX = -(x - rect.width / 2) * (newScale - 1);
        const newY = -(y - rect.height / 2) * (newScale - 1);

        setScale(newScale);
        setPosition({ x: newX, y: newY });
        controls.start({
            x: newX,
            y: newY,
            scale: newScale,
            transition: { duration: 0.3, ease: 'easeOut' },
        });
    }
  };

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale - event.deltaY * 0.01));
    setScale(newScale);
    controls.set({ scale: newScale });

    if (newScale === MIN_ZOOM) {
        resetState();
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onOpenChange(false);
      }
    }}>
        <AnimatePresence>
            {isOpen && (
                <DialogPortal forceMount>
                    <DialogOverlay asChild>
                         <motion.div 
                            className="fixed inset-0 bg-black/80"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                         />
                    </DialogOverlay>
                    <DialogContent 
                        className="bg-transparent border-0 shadow-none p-0 w-screen h-screen max-w-none flex items-center justify-center overflow-hidden"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        onWheel={handleWheel}
                    >
                         <VisuallyHidden>
                            <DialogTitle>Image Viewer</DialogTitle>
                         </VisuallyHidden>

                         <motion.div
                            ref={imageRef}
                            className="relative w-full h-full cursor-grab active:cursor-grabbing"
                            onDoubleClick={handleDoubleClick}
                            drag={scale > 1}
                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                            dragElastic={0.1}
                            onDragEnd={handleDragEnd}
                            animate={controls}
                            style={{ x: position.x, y: position.y, scale }}
                         >
                            {imageUrl && (
                                <Image
                                    src={imageUrl}
                                    alt="Fullscreen view" 
                                    fill
                                    style={{ objectFit: 'contain' }}
                                    className="rounded-lg pointer-events-none"
                                    draggable={false}
                                />
                            )}
                         </motion.div>
                    </DialogContent>
                </DialogPortal>
            )}
        </AnimatePresence>
    </Dialog>
  );
}
