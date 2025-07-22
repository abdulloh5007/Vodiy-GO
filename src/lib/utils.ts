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
    const region = cleaned.slice(0, 2).replace(/[^0-9]/g, '');
    const rest = cleaned.slice(2);

    if (region.length < 2) return region;

    // Check if the character after region code is a letter or a number
    if (rest.length > 0) {
        const isLetterAfterRegion = /^[A-Z]/.test(rest);

        if (isLetterAfterRegion) {
            // Format: 01 B 123 BB
            const letter1 = rest.slice(0, 1).replace(/[^A-Z]/g, '');
            const numbers = rest.slice(1, 4).replace(/[^0-9]/g, '');
            const letters2 = rest.slice(4, 6).replace(/[^A-Z]/g, '');
            
            let result = `${region}`;
            if (letter1) result += ` ${letter1}`;
            if (numbers) result += ` ${numbers}`;
            if (letters2) result += ` ${letters2}`;
            return result;
        } else {
            // Format: 01 123 BBB
            const numbers = rest.slice(0, 3).replace(/[^0-9]/g, '');
            const letters = rest.slice(3, 6).replace(/[^A-Z]/g, '');

            let result = `${region}`;
            if (numbers) result += ` ${numbers}`;
            if (letters) result += ` ${letters}`;
            return result;
        }
    }

    return cleaned;
}
