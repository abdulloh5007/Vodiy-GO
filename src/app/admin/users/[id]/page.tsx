
'use client';

import { useContext, useState } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, User, Phone, ShoppingBag, Ban, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { RejectionDialog } from '@/components/RejectionDialog';
import { User as UserType } from '@/lib/types';


function UserDetailPageContent() {
    const context = useContext(AppContext);
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;
    const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);

    if (!context) {
        throw new Error('UserDetailPage must be used within an AppProvider');
    }

    const { users, orders, loading, translations: t, updateUserStatus } = context;

    const user = users.find(u => u.uid === userId);
    const userOrders = orders.filter(o => o.passengerId === userId);
    
    if (loading || !t.home) {
        return <UserDetailSkeleton />;
    }
    
    if (!user) {
        return <div className="container mx-auto py-8 px-4">User not found.</div>;
    }

    const handleBlock = async (reason: string) => {
        if (!reason) return;
        await updateUserStatus(user.uid, 'blocked', reason);
    };

    const handleUnblock = async () => {
        await updateUserStatus(user.uid, 'active');
    };

    return (
        <>
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
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground"/>
                                <div>
                                    <p className="text-sm text-muted-foreground">{t.yourPhone || 'Phone'}</p>
                                    <p className="font-semibold">{user.phone || t.notSpecified || 'Not specified'}</p>
                                </div>
                            </div>
                            <UserStatusBadge status={user.status} t={t} />
                        </div>
                         {user.status === 'blocked' && user.blockReason && (
                            <div className="p-3 bg-destructive border border-destructive/20 rounded-lg">
                                <p className="text-sm font-semibold">{t.block_reason}:</p>
                                <p className="text-sm">{user.blockReason}</p>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <ShoppingBag className="h-5 w-5 text-muted-foreground"/>
                            <div>
                                <p className="text-sm text-muted-foreground">{t.totalOrders || 'Total Orders'}</p>
                                <p className="font-semibold">{userOrders.length}</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        {user.status === 'blocked' ? (
                            <Button variant="secondary" onClick={handleUnblock}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                {t.unblock_driver || 'Unblock'}
                            </Button>
                        ) : (
                            <Button variant="destructive" onClick={() => setIsBlockDialogOpen(true)}>
                                <Ban className="mr-2 h-4 w-4" />
                                {t.block_driver || 'Block'}
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
            <RejectionDialog 
                isOpen={isBlockDialogOpen}
                onClose={() => setIsBlockDialogOpen(false)}
                onConfirm={handleBlock}
                t={t}
                title={t.block_reason_title || 'Reason for blocking'}
                description={t.block_reason_user_desc || 'Please specify the reason for blocking this user.'}
                confirmText={t.block_driver || "Block"}
            />
        </>
    );
}

const UserStatusBadge = ({ status, t }: { status: UserType['status'], t: any }) => {
    if (status === 'blocked') {
        return <Badge variant="destructive"><Ban className="mr-2 h-4 w-4"/>{t.blocked || "Blocked"}</Badge>
    }
    return <Badge variant="secondary"><CheckCircle2 className="mr-2 h-4 w-4"/>{t.user_status_active || "Active"}</Badge>
};


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
