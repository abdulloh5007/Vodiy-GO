'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

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
                        className="bg-transparent border-0 shadow-none p-0 w-screen h-screen max-w-none flex items-center justify-center"
                        onOpenAutoFocus={(e) => e.preventDefault()}
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
                                if (info.offset.y > 150) {
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
                                        layout="fill"
                                        objectFit="contain"
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
