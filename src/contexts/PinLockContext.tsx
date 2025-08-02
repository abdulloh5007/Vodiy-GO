
'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/use-storage';
import { PinLockScreen } from '@/components/PinLockScreen';

interface PinLockContextType {
    pin: string | null;
    setPin: (pin: string | null) => void;
    isLocked: boolean;
    setIsLocked: (locked: boolean) => void;
    pinLength: 4 | 6;
    setPinLength: (length: 4 | 6) => void;
    autoLockTime: number; // in milliseconds, 0 for never
    setAutoLockTime: (time: number) => void;
}

export const PinLockContext = createContext<PinLockContextType | null>(null);

export function PinLockProvider({ children }: { children: ReactNode }) {
    const [pin, setPin] = useLocalStorage<string | null>('admin-pin', null);
    const [pinLength, setPinLength] = useLocalStorage<4 | 6>('admin-pin-length', 4);
    const [autoLockTime, setAutoLockTime] = useLocalStorage<number>('admin-autolock-time', 120000); // Default 2 minutes
    const [isLocked, setIsLocked] = useState(!!pin);
    const [lastActivity, setLastActivity] = useLocalStorage<number>('admin-last-activity', Date.now());
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleUnlock = useCallback(() => {
        setIsLocked(false);
        setLastActivity(Date.now());
    }, [setLastActivity]);

    // Effect to handle auto-locking
    useEffect(() => {
        if (!pin || autoLockTime === 0 || isLocked) return;

        const interval = setInterval(() => {
            if (Date.now() - lastActivity > autoLockTime) {
                setIsLocked(true);
            }
        }, 1000 * 30); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [pin, autoLockTime, isLocked, lastActivity]);

    // Effect to track user activity
    useEffect(() => {
        const updateLastActivity = () => {
            setLastActivity(Date.now());
        };
        
        window.addEventListener('mousemove', updateLastActivity);
        window.addEventListener('keydown', updateLastActivity);
        window.addEventListener('click', updateLastActivity);
        window.addEventListener('scroll', updateLastActivity);

        return () => {
            window.removeEventListener('mousemove', updateLastActivity);
            window.removeEventListener('keydown', updateLastActivity);
            window.removeEventListener('click', updateLastActivity);
            window.removeEventListener('scroll', updateLastActivity);
        };
    }, [setLastActivity]);

    // Effect to adjust pin length if setting changes
    useEffect(() => {
        if (pin && pin.length !== pinLength) {
            setPin(null);
            setIsLocked(false);
        }
    }, [pin, pinLength, setPin]);

    if (!isMounted) {
        return null; // Or a loading spinner, but null is fine for avoiding hydration errors.
    }

    return (
        <PinLockContext.Provider value={{
            pin,
            setPin,
            isLocked,
            setIsLocked,
            pinLength,
            setPinLength,
            autoLockTime,
            setAutoLockTime
        }}>
            {isLocked && pin ? (
                <PinLockScreen 
                    pinLength={pinLength}
                    correctPin={pin}
                    onUnlock={handleUnlock}
                />
            ) : (
                children
            )}
        </PinLockContext.Provider>
    );
}
