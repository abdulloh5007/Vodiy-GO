
'use client';

import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, User, Mail, Phone, ShoppingBag } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


function UserDetailPageContent() {
    const context = useContext(AppContext);
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;

    if (!context) {
        throw new Error('UserDetailPage must be used within an AppProvider');
    }

    // Note: We don't have a separate `users` collection in the context provider yet.
    // For now, let's assume we might get this info from orders or a future users collection.
    // Let's find the user from the `user` object if it matches, or from orders.
    const { users, orders, loading, translations: t } = context;

    const user = users.find(u => u.uid === userId);
    const userOrders = orders.filter(o => o.passengerId === userId);
    
    if (loading || !t.home) {
        return <UserDetailSkeleton />;
    }
    
    if (!user) {
        return <div className="container mx-auto py-8 px-4">User not found.</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-4">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t.back_button || 'Back'}
                </Button>
            </div>
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader className="items-center text-center">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={`https://placehold.co/100x100.png`} alt={user.name} data-ai-hint="user portrait" />
                        <AvatarFallback>{user.name ? user.name.charAt(0) : 'U'}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="mt-4 text-2xl font-headline">{user.name || 'N/A'}</CardTitle>
                    <CardDescription>{user.uid}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground"/>
                        <div>
                            <p className="text-sm text-muted-foreground">{t.email || 'Email'}</p>
                            <p className="font-semibold">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground"/>
                        <div>
                            <p className="text-sm text-muted-foreground">{t.yourPhone || 'Phone'}</p>
                            <p className="font-semibold">{user.phone || t.notSpecified || 'Not specified'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="h-5 w-5 text-muted-foreground"/>
                        <div>
                            <p className="text-sm text-muted-foreground">{t.totalOrders || 'Total Orders'}</p>
                            <p className="font-semibold">{userOrders.length}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function UserDetailSkeleton() {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-4">
                 <Skeleton className="h-10 w-24" />
            </div>
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader className="items-center text-center">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-8 w-48 mt-4" />
                    <Skeleton className="h-5 w-64 mt-2" />
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-6 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-6 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function UserDetailPage() {
    return (
        <UserDetailPageContent />
    )
}
