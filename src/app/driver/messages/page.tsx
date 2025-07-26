
'use client';

import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckBadge } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

function MessagesSkeleton() {
    return (
         <div className="container mx-auto py-8 px-4 space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
    )
}

export default function MessagesPage() {
    const context = useContext(AppContext);
    const router = useRouter();

    if (!context) {
        throw new Error('MessagesPage must be used within an AppProvider');
    }

    const { translations: t, loading, user } = context;

    if (loading || !user || !t.home) {
        return <MessagesSkeleton />;
    }

    return (
         <div className="container mx-auto py-8 px-4">
            <Card 
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => router.push('/driver/messages/admin')}
            >
                <CardHeader className="flex-row items-center gap-4">
                    <Avatar className="h-14 w-14">
                        <AvatarImage src="https://placehold.co/100x100.png" alt="Admin" data-ai-hint="logo" />
                        <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <CardTitle className="flex items-center gap-2">
                            {t.admin_chat_title || "Admin"}
                            <CheckBadge className="h-5 w-5 text-primary" />
                        </CardTitle>
                        <CardDescription>{t.admin_chat_desc_short || "Status updates & notifications"}</CardDescription>
                    </div>
                    <ChevronRight className="h-6 w-6 text-muted-foreground" />
                </CardHeader>
            </Card>
        </div>
    )
}
