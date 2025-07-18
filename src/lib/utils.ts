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
