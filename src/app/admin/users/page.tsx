'use client';

import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRight, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


function UsersPageSkeleton() {
    return (
        <div className="container mx-auto py-8 px-4">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-5 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-48" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-5 w-20" /></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                           <TableRow key={i}>
                                <TableCell>
                                     <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <Skeleton className="h-5 w-32" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-5 w-full" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-5 w-full" />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                </TableCell>
                           </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default function UsersPage() {
  const context = useContext(AppContext);
  const router = useRouter();
  
  if (!context) {
    throw new Error('UsersPage must be used within an AppProvider');
  }
  
  const { users, translations, loading } = context;
  const t = translations;
  
  const passengers = users.filter(u => u.role === 'passenger');

  if (loading || !t.home) {
    return <UsersPageSkeleton />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-2xl">{t.users_title || 'Users'}</CardTitle>
            <CardDescription>{t.users_desc || 'List of all passengers in the system.'}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="w-full overflow-x-auto">
            <Table className="min-w-[800px]">
                <TableHeader>
                <TableRow>
                    <TableHead>{t.userName || 'User Name'}</TableHead>
                    <TableHead>{t.user_email || 'Email'}</TableHead>
                    <TableHead>{t.user_phone || 'Phone'}</TableHead>
                    <TableHead className="text-right">{t.details || 'Details'}</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {passengers.length > 0 ? (
                    passengers.map(user => (
                    <TableRow key={user.uid}>
                        <TableCell>
                         <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={`https://placehold.co/40x40.png`} alt={user.name} data-ai-hint="user portrait" />
                                <AvatarFallback>{user.name ? user.name.charAt(0) : 'P'}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{user.name || 'N/A'}</div>
                         </div>
                        </TableCell>
                        <TableCell>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                        </TableCell>
                        <TableCell>
                             <div className="text-sm text-muted-foreground">{user.phone || t.notSpecified || 'Not specified'}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/users/${user.uid}`)}>
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">{t.noUsersFound || 'No users found.'}</TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
