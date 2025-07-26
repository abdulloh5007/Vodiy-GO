
'use client';

import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, History } from 'lucide-react';

export default function AnnouncementHistoryPage() {
    const context = useContext(AppContext);
    const router = useRouter();

    if (!context) {
        throw new Error('This page must be used within an AppProvider');
    }

    const { translations: t } = context;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-4">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t.back_button || 'Back'}
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                        <History />
                        {t.announcement_history_title || "Announcement History"}
                    </CardTitle>
                    <CardDescription>{t.announcement_history_desc_long || "Here you can find all your past ride announcements."}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-16 text-muted-foreground">
                        <p>{t.feature_coming_soon || 'This feature is currently under development. Stay tuned!'}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
