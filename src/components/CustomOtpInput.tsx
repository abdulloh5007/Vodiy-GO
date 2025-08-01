'use client';

import React, { useState, useRef, ChangeEvent, ClipboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CustomOtpInputProps {
  value: string;
  onChange: (value: string) => void;
  numInputs: number;
}

export function CustomOtpInput({ value, onChange, numInputs }: CustomOtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newValue = [...value.split('')];
    newValue[index] = element.value;
    onChange(newValue.join(''));

    // Focus next input
    if (element.value !== '' && index < numInputs - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };
  
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    if (paste.match(/^\d+$/)) {
      const pasteDigits = paste.split('').slice(0, numInputs);
      onChange(pasteDigits.join(''));
      
      // Focus the next empty input after paste
      const nextFocusIndex = Math.min(pasteDigits.length, numInputs - 1);
      inputsRef.current[nextFocusIndex]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
      {Array.from({ length: numInputs }, (_, index) => (
        <Input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={(e) => e.target.select()}
          className={cn(
            "w-12 h-12 md:w-14 md:h-14 text-center text-2xl font-bold",
            "border-2 focus:border-primary focus:ring-2 focus:ring-primary/50"
          )}
        />
      ))}
    </div>
  );
}
