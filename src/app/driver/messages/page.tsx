
'use client';

import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function MessagesPage() {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error('MessagesPage must be used within an AppProvider');
    }

    const { translations: t } = context;

    return (
        <div className="container mx-auto py-8 px-4 flex justify-center items-center h-[calc(100vh-8rem)]">
            <Card className="w-full max-w-md text-center">
                 <CardHeader className="items-center">
                    <MessageSquare className="h-16 w-16 text-muted-foreground" />
                    <CardTitle className="mt-4">{t.messages_title || 'Messages'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>{t.messages_desc || 'This feature is coming soon.'}</CardDescription>
                </CardContent>
            </Card>
        </div>
    );
}
