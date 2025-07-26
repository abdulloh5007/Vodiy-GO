
'use client';

import { useState, useRef, useLayoutEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MarqueeTextProps {
  children: ReactNode;
}

export function MarqueeText({ children }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (container && text) {
      const checkOverflow = () => {
        setIsOverflowing(text.scrollWidth > container.clientWidth);
      };
      checkOverflow();

      const resizeObserver = new ResizeObserver(checkOverflow);
      resizeObserver.observe(container);
      
      return () => resizeObserver.disconnect();
    }
  }, [children]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'w-full overflow-hidden whitespace-nowrap',
        isOverflowing && 'relative' // Needed for gradient overlay if we add it
      )}
    >
      <span
        ref={textRef}
        className={cn(
          'inline-block',
          isOverflowing && 'animate-marquee'
        )}
      >
        {children}
      </span>
      {/* If the marquee is long, duplicate it for a seamless loop */}
      {isOverflowing && (
        <span className="inline-block animate-marquee pl-4">
          {children}
        </span>
      )}
    </div>
  );
}
