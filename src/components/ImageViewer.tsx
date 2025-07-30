
'use client';

import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import Image from 'next/image';
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useState, useRef, useEffect, useCallback } from 'react';

interface ImageViewerProps {
  imageUrl: string | null;
  onOpenChange: (open: boolean) => void;
}

export function ImageViewer({ imageUrl, onOpenChange }: ImageViewerProps) {
  const isOpen = !!imageUrl;
  const controls = useAnimationControls();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    controls.start({
      scale: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.3 }
    });
  }, [controls]);

  useEffect(() => {
    if (isOpen) {
      resetZoom();
    }
  }, [isOpen, resetZoom]);
  
  const handleWheel = (event: React.WheelEvent) => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    const newScale = Math.max(1, Math.min(5, scale - event.deltaY * 0.01));
    setScale(newScale);
    controls.set({ scale: newScale });
  };
  
  const handleDoubleClick = (event: React.MouseEvent | React.TouchEvent) => {
    if (scale > 1) {
      resetZoom();
    } else {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      let x, y;

      if ('clientX' in event) { // MouseEvent
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
      } else { // TouchEvent
        x = event.touches[0].clientX - rect.left;
        y = event.touches[0].clientY - rect.top;
      }
      
      const newScale = 2.5;
      const newX = -(x - rect.width / 2) * newScale;
      const newY = -(y - rect.height / 2) * newScale;
      
      setScale(newScale);
      setPosition({ x: newX, y: newY });
      controls.start({
        scale: newScale,
        x: newX,
        y: newY,
        transition: { duration: 0.3 }
      });
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
                            className="relative w-full h-full flex items-center justify-center"
                            drag="y"
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={0.1}
                            onDragEnd={(_, info) => {
                                if (info.offset.y > 150 && scale === 1) {
                                    onOpenChange(false);
                                }
                            }}
                        >
                            <motion.div
                                animate={controls}
                                className="relative w-full h-full flex items-center justify-center"
                                drag={scale > 1}
                                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                dragElastic={0.1}
                                onDoubleClick={handleDoubleClick}
                            >
                                {imageUrl && (
                                    <Image
                                        src={imageUrl}
                                        alt="Fullscreen view" 
                                        fill
                                        style={{ objectFit: 'contain' }}
                                        className="rounded-lg"
                                        draggable={false}
                                    />
                                )}
                            </motion.div>
                        </motion.div>
                    </DialogContent>
                </DialogPortal>
            )}
        </AnimatePresence>
    </Dialog>
  );
}
