
'use client';

import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function RatingPage() {
    const context = useContext(AppContext);
    const router = useRouter();

    if (!context) {
        throw new Error('RatingPage must be used within an AppProvider');
    }

    const { translations: t } = context;

    return (
        <div className="container mx-auto py-8 px-4 flex justify-center">
            <Card className="w-full max-w-lg text-center relative">
                 <div className="absolute top-4 left-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </div>
                <CardHeader className="items-center pt-16">
                    <div className="flex items-center gap-1 mt-2 text-amber-500">
                        <Star className="w-8 h-8 fill-current" />
                        <Star className="w-8 h-8 fill-current" />
                        <Star className="w-8 h-8 fill-current" />
                        <Star className="w-8 h-8 fill-current" />
                        <Star className="w-8 h-8 fill-current" />
                    </div>
                    <CardTitle className="mt-4">{t.rating_title || 'Your Rating'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <CardDescription>{t.rating_desc || 'This is your average rating from passengers. A higher rating helps you get more bookings.'}</CardDescription>
                    <div className="flex items-center justify-center gap-4 text-lg">
                        <User className="w-6 h-6 text-muted-foreground" />
                        <span>{t.rating_based_on || 'Based on {count} ratings'.replace('{count}', '12')}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
