
'use client';

import { useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KeyRound, Timer, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PinLockContext } from '@/contexts/PinLockContext';
import { AppContext } from '@/contexts/AppContext';

export default function SettingsPage() {
    const pinLockContext = useContext(PinLockContext);
    const appContext = useContext(AppContext);
    const { toast } = useToast();

    if (!pinLockContext || !appContext) {
        throw new Error('This page must be used within PinLockProvider and AppProvider');
    }

    const {
        pin,
        pinLength,
        setPinLength,
        autoLockTime,
        setAutoLockTime,
        setPin,
        setIsLocked,
    } = pinLockContext;

    const { translations: t } = appContext;

    const handleSetPin = () => {
        const newPin = prompt(t.prompt_enter_pin?.replace('{length}', pinLength.toString()) || `Enter your new ${pinLength}-digit PIN:`);
        if (newPin && newPin.length === pinLength && /^\d+$/.test(newPin)) {
            setPin(newPin);
            toast({
                title: t.toast_pin_set_title || 'PIN Code Set',
                description: t.toast_pin_set_desc || 'Your new PIN code has been saved.',
            });
            setIsLocked(true); // Lock immediately to test
        } else if (newPin !== null) {
            toast({
                variant: 'destructive',
                title: t.toast_invalid_pin_title || 'Invalid PIN',
                description: t.toast_invalid_pin_desc?.replace('{length}', pinLength.toString()) || `Please enter a valid ${pinLength}-digit PIN.`,
            });
        }
    };

    const handleRemovePin = () => {
        setPin(null);
        toast({
            title: t.toast_pin_removed_title || 'PIN Code Removed',
            description: t.toast_pin_removed_desc || 'PIN protection has been disabled.',
        });
    };
    
    return (
        <div className="container mx-auto py-8 px-4">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">{t.settings_title || 'Settings'}</CardTitle>
                    <CardDescription>{t.settings_desc || 'Manage your admin panel preferences.'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><KeyRound /> {t.passcode_title || 'Passcode Lock'}</h3>
                        <p className="text-sm text-muted-foreground">{t.passcode_desc || 'Protect your admin panel with a local PIN code.'}</p>
                        
                        <div className="space-y-2">
                            <Label>{t.pin_length_label || 'PIN Length'}</Label>
                            <RadioGroup value={pinLength.toString()} onValueChange={(val) => setPinLength(parseInt(val) as 4 | 6)} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="4" id="r4" />
                                    <Label htmlFor="r4">4 {t.digits || 'digits'}</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="6" id="r6" />
                                    <Label htmlFor="r6">6 {t.digits || 'digits'}</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                             <Button onClick={handleSetPin}>
                                {pin ? t.change_pin_button || 'Change PIN' : t.set_pin_button || 'Set PIN'}
                             </Button>
                             {pin && (
                                <Button variant="destructive" onClick={handleRemovePin}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t.remove_pin_button || 'Remove PIN'}
                                </Button>
                             )}
                        </div>
                    </div>
                     <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><Timer /> {t.autolock_title || 'Auto-Lock'}</h3>
                        <p className="text-sm text-muted-foreground">{t.autolock_desc || 'Automatically lock the panel after a period of inactivity.'}</p>
                        
                        <div className="space-y-2">
                            <Label htmlFor="autolock-time">{t.autolock_time_label || 'Lock after'}</Label>
                             <Select value={autoLockTime.toString()} onValueChange={(val) => setAutoLockTime(parseInt(val))}>
                                <SelectTrigger id="autolock-time" className="w-full sm:w-[280px]">
                                    <SelectValue placeholder="Select a time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="120000">2 {t.minutes || 'minutes'}</SelectItem>
                                    <SelectItem value="300000">5 {t.minutes || 'minutes'}</SelectItem>
                                    <SelectItem value="600000">10 {t.minutes || 'minutes'}</SelectItem>
                                    <SelectItem value="1800000">30 {t.minutes || 'minutes'}</SelectItem>
                                    <SelectItem value="0">{t.never || 'Never'}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
