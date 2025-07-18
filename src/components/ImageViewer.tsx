'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from '@/components/ui/dialog';

interface ImageViewerProps {
  imageUrl: string | null;
  onOpenChange: (open: boolean) => void;
}

export function ImageViewer({ imageUrl, onOpenChange }: ImageViewerProps) {
  const isOpen = !!imageUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                        className="bg-transparent border-0 shadow-none p-0 w-full h-full max-w-full max-h-full flex items-center justify-center"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                        <motion.div
                            className="relative w-full h-full"
                            drag="y"
                            dragConstraints={{ top: 0, bottom: 0 }}
                            onDragEnd={(_, info) => {
                                if (info.offset.y > 100) {
                                    onOpenChange(false);
                                }
                            }}
                        >
                            <motion.div 
                                className="relative w-full h-full flex items-center justify-center p-4"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                            >
                                {imageUrl && (
                                    <Image
                                        src={imageUrl}
                                        alt="Fullscreen view"
                                        width={1200}
                                        height={800}
                                        className="max-w-full max-h-full object-contain rounded-lg"
                                        style={{ width: 'auto', height: 'auto' }}
                                    />
                                )}
                            </motion.div>
                             <button
                                onClick={() => onOpenChange(false)}
                                className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </motion.div>
                    </DialogContent>
                </DialogPortal>
            )}
        </AnimatePresence>
    </Dialog>
  );
}
