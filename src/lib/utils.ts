import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(value: string) {
  if (!value) return value;
  
  if (!value.startsWith('+998')) {
    return '+998';
  }

  const digits = value.replace(/\D/g, '').slice(3); // remove '+998' and non-digits
  let formatted = '+998';
  if (digits.length > 0) {
    formatted += ` (${digits.substring(0, 2)}`;
  }
  if (digits.length >= 3) {
    formatted += `) ${digits.substring(2, 5)}`;
  }
  if (digits.length >= 6) {
    formatted += `-${digits.substring(5, 7)}`;
  }
  if (digits.length >= 8) {
    formatted += `-${digits.substring(7, 9)}`;
  }
  
  return formatted.slice(0, 19); // Ensure max length: +998 (XX) XXX-XX-XX
}


export function formatPassportNumber(value: string): string {
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    const letters = cleaned.slice(0, 2).replace(/[^A-Z]/g, '');
    const numbers = cleaned.slice(2, 9).replace(/[^0-9]/g, '');
    
    if (numbers.length > 0) {
        return `${letters} ${numbers}`;
    }
    return letters;
}

export function formatCarNumber(value: string): string {
    const cleaned = value.replace(/[\s\-]/g, '').toUpperCase();
    
    // Format: 01 B 123 BB
    if (cleaned.length > 3) {
        const region = cleaned.slice(0, 2);
        const letter = cleaned.slice(2, 3);
        const numbers = cleaned.slice(3, 6);
        const letters = cleaned.slice(6, 8);
        return `${region} ${letter} ${numbers} ${letters}`.trim();
    }
     // Format: 01 123 BBB
    else if (cleaned.length > 2) {
        const region = cleaned.slice(0, 2);
        const numbers = cleaned.slice(2, 5);
        const letters = cleaned.slice(5, 8);
        return `${region} ${numbers} ${letters}`.trim();
    }

    return cleaned;
}
