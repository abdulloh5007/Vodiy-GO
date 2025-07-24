
'use client';

import { useContext, useEffect, useState, useMemo } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, ArrowLeft, User, CheckCircle2, XCircle, FileText, PackageCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Message } from '@/lib/types';
import { format } from 'date-fns';
import { enUS, ru, uz } from 'date-fns/locale';

function MessagesPageSkeleton() {
    return (
        <div className="container mx-auto py-8 px-4">
            <Card className="flex flex-col h-[calc(100vh-8rem)]">
                <CardHeader className="border-b">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className='space-y-1'>
                             <Skeleton className="h-5 w-24" />
                             <Skeleton className="h-4 w-16" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                             <Skeleton key={i} className="h-20 w-3/4 rounded-lg" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

const getMessageIcon = (type: Message['type']) => {
    switch (type) {
        case 'REGISTRATION_APPROVED':
        case 'RIDE_APPROVED':
            return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        case 'REGISTRATION_REJECTED':
        case 'RIDE_REJECTED':
            return <XCircle className="h-5 w-5 text-red-500" />;
        case 'REGISTRATION_PENDING':
            return <FileText className="h-5 w-5 text-yellow-500" />;
        case 'RIDE_CREATED':
            return <PackageCheck className="h-5 w-5 text-blue-500" />;
        default:
            return <MessageSquare className="h-5 w-5 text-muted-foreground" />;
    }
}


export default function MessagesPage() {
    const context = useContext(AppContext);
    const [selectedChat, setSelectedChat] = useState<'admin' | null>('admin');
    
    if (!context) {
        throw new Error('MessagesPage must be used within an AppProvider');
    }

    const { translations: t, user, messages, loading, language } = context;

    const getLocale = () => {
        switch (language) {
            case 'ru': return ru;
            case 'uz': return uz;
            default: return enUS;
        }
    }
    
    const sortedMessages = useMemo(() => {
        return messages.sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    }, [messages]);

    if (loading || !user || !t.home) {
        return <MessagesPageSkeleton />;
    }

    if (!selectedChat) {
         return (
            <div className="container mx-auto py-8 px-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{t.messages_title || 'Messages'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div 
                            className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted cursor-pointer"
                            onClick={() => setSelectedChat('admin')}
                        >
                            <Avatar>
                                <AvatarImage src="https://placehold.co/100x100.png" alt="Admin" data-ai-hint="logo" />
                                <AvatarFallback>A</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                                <p className="font-semibold">{t.admin_chat_title || 'Admin'}</p>
                                <p className="text-sm text-muted-foreground">{t.admin_chat_desc || 'Application status and notifications'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    // Chat view
    return (
        <div className="container mx-auto py-8 px-4 h-full">
            <Card className="flex flex-col h-[calc(100vh-10rem)]">
                <CardHeader className="border-b flex-row items-center gap-3 space-y-0">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedChat(null)}>
                        <ArrowLeft />
                    </Button>
                     <Avatar>
                        <AvatarImage src="https://placehold.co/100x100.png" alt="Admin" data-ai-hint="logo" />
                        <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{t.admin_chat_title || 'Admin'}</p>
                        <p className="text-sm text-muted-foreground">{t.admin_chat_desc || 'Application status and notifications'}</p>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-4 overflow-y-auto flex flex-col-reverse">
                    <div className="space-y-4">
                        {sortedMessages.length > 0 ? sortedMessages.map(msg => (
                            <div key={msg.id} className="flex items-start gap-3 max-w-xl">
                                <div className="p-3 bg-muted rounded-full">
                                    {getMessageIcon(msg.type)}
                                </div>
                                <div className="bg-muted p-3 rounded-lg">
                                    <p className="font-semibold text-sm">{msg.title}</p>
                                    <p className="text-sm text-muted-foreground">{msg.body}</p>
                                    <p className="text-xs text-muted-foreground/70 mt-2">
                                        {format(msg.createdAt.toDate(), 'PPP p', { locale: getLocale() })}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-muted-foreground py-10">
                                {t.no_messages_yet || 'No messages yet.'}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
