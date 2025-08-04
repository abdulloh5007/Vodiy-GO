'use client';

import { useState, useEffect, useRef, useContext } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { AppContext } from '@/contexts/AppContext';

interface PinLockScreenProps {
    pinLength: 4 | 6;
    correctPin: string;
    onUnlock: () => void;
}

export function PinLockScreen({ pinLength, correctPin, onUnlock }: PinLockScreenProps) {
    const [inputPin, setInputPin] = useState('');
    const [error, setError] = useState(false);
    const appContext = useContext(AppContext);
    const t = appContext?.translations;

    const clickSoundRef = useRef<HTMLAudioElement | null>(null);
    const errorSoundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        clickSoundRef.current = new Audio('/sounds/click.mp3');
        errorSoundRef.current = new Audio('/sounds/error.mp3');
    }, []);

    const playClick = () => {
        if (clickSoundRef.current) {
            clickSoundRef.current.currentTime = 0;
            clickSoundRef.current.play().catch(() => {});
        }
    };

    const playError = () => {
        if (errorSoundRef.current) {
            errorSoundRef.current.currentTime = 0;
            errorSoundRef.current.play().catch(() => {});
        }
    };

    useEffect(() => {
        if (inputPin.length === pinLength) {
            if (inputPin === correctPin) {
                onUnlock();
            } else {
                playError(); // 🔊 звук ошибки
                setError(true);
                setTimeout(() => {
                    setError(false);
                    setInputPin('');
                }, 800);
            }
        }
    }, [inputPin, pinLength, correctPin, onUnlock]);

    const handleKeyPress = (key: string) => {
        if (inputPin.length < pinLength) {
            playClick(); // 🔊 звук нажатия
            setInputPin(prev => prev + key);
        }
    };

    const handleDelete = () => {
        playClick(); // 🔊 звук нажатия
        setInputPin(prev => prev.slice(0, -1));
    };

    const pinCircles = Array.from({ length: pinLength }).map((_, index) => (
        <div
            key={index}
            className={cn(
                'h-4 w-4 rounded-full border-2 border-primary transition-all duration-300',
                index < inputPin.length ? 'bg-primary' : 'bg-transparent',
                error && 'border-destructive bg-destructive'
            )}
        />
    ));

    const keypad = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['', '0', 'delete'],
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
            <Card className={cn("w-full max-w-xs text-center", error && 'animate-shake')}>
                <CardHeader>
                    <CardTitle>{t?.pin_screen_title || 'Enter PIN'}</CardTitle>
                    <CardDescription>{t?.pin_screen_desc || 'Enter your PIN to unlock.'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center gap-3">
                        {pinCircles}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {keypad.flat().map((key, i) =>
                            key === '' ? (
                                <div key={i} />
                            ) : (
                                <Button
                                    key={i}
                                    variant={key === 'delete' ? 'ghost' : 'outline'}
                                    size="lg"
                                    className="text-2xl font-bold h-16"
                                    onClick={() =>
                                        key === 'delete' ? handleDelete() : handleKeyPress(key)
                                    }
                                >
                                    {key === 'delete' ? '⌫' : key}
                                </Button>
                            )
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
