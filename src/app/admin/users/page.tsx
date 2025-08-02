
'use client';

import { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRight, User, LayoutGrid, List } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User as UserType } from '@/lib/types';
import { AdminPanelWrapper } from '@/components/AdminPanelWrapper';


function UsersPageContent() {
  const context = useContext(AppContext);
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  
  useEffect(() => {
    const savedViewMode = localStorage.getItem('users-view-mode') as 'table' | 'card';
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  const handleSetViewMode = (mode: 'table' | 'card') => {
    setViewMode(mode);
    localStorage.setItem('users-view-mode', mode);
  }

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
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="font-headline text-2xl">{t.users_title || 'Users'}</CardTitle>
              <CardDescription>{t.users_desc || 'List of all passengers in the system.'}</CardDescription>
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto">
              <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleSetViewMode('table')}>
                  <List className="h-5 w-5" />
              </Button>
              <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleSetViewMode('card')}>
                  <LayoutGrid className="h-5 w-5" />
              </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className={cn(viewMode !== 'table' && 'hidden')}>
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
            </div>
             <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", viewMode !== 'card' && 'hidden')}>
                 {passengers.length > 0 ? (
                    passengers.map(user => (
                        <UserCard 
                            key={user.uid} 
                            user={user}
                            onDetailsClick={(id) => router.push(`/admin/users/${id}`)}
                            t={t}
                        />
                    ))
                 ) : (
                    <div className="text-center py-16 col-span-full">
                        <p className="text-muted-foreground">{t.noUsersFound || 'No users found.'}</p>
                    </div>
                 )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

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

const UserCard = ({ user, onDetailsClick, t }: { user: UserType, onDetailsClick: (id: string) => void, t: any }) => (
     <Card>
        <CardHeader className="p-4 flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
                <AvatarImage src={`https://placehold.co/100x100.png`} alt={user.name} data-ai-hint="user portrait" />
                <AvatarFallback>{user.name ? user.name.charAt(0) : 'U'}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
                <CardTitle className="text-lg">{user.name || 'N/A'}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
             <p className="text-sm text-muted-foreground">{t.user_phone || 'Phone'}: {user.phone || t.notSpecified || 'Not specified'}</p>
        </CardContent>
        <CardFooter className="p-2">
             <Button variant="outline" className="w-full" onClick={() => onDetailsClick(user.uid)}>
                {t.details || 'Details'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </CardFooter>
    </Card>
)

export default function UsersPage() {
    return (
        <AdminPanelWrapper>
            <UsersPageContent />
        </AdminPanelWrapper>
    )
}
