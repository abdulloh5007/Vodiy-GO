
'use client';

import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, List, LayoutGrid, Copy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { UserRegistrationRequest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AdminPanelWrapper } from '@/components/AdminPanelWrapper';

function UserApplicationsPageContent() {
  const context = useContext(AppContext);
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const { toast } = useToast();

  useEffect(() => {
    const savedViewMode = localStorage.getItem('user-applications-view-mode') as 'table' | 'card';
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  const handleSetViewMode = (mode: 'table' | 'card') => {
    setViewMode(mode);
    localStorage.setItem('user-applications-view-mode', mode);
  }

  if (!context) {
    throw new Error('This page must be used within an AppProvider');
  }
  
  const { userRegistrationRequests, translations: t, loading, deleteUserRegistrationRequest } = context;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t.promo_code_copied_title || "Copied!", description: t.code_copied_desc || 'Verification code {code} copied to clipboard.'.replace('{code}', text) });
  };
  
  if (loading || !t.home) {
    return <ApplicationsSkeleton />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="font-headline text-2xl">{t.user_applications_title || 'User Applications'}</CardTitle>
              <CardDescription>{t.user_applications_desc || 'Pending user registration requests.'}</CardDescription>
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
            {userRegistrationRequests.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <p>{t.no_user_applications || "No pending user applications."}</p>
                </div>
            ) : (
                <>
                <div className={cn(viewMode !== 'table' && 'hidden')}>
                    <div className="w-full overflow-x-auto">
                        <Table className="min-w-[600px]">
                            <TableHeader>
                            <TableRow>
                                <TableHead>{t.applicant_name || "Name"}</TableHead>
                                <TableHead>{t.applicant_phone || "Phone"}</TableHead>
                                <TableHead>{t.verification_code || "Verification Code"}</TableHead>
                                <TableHead className="text-right">{t.actions}</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {userRegistrationRequests.map(request => (
                                <TableRow key={request.id}>
                                    <TableCell className="font-medium">{request.name}</TableCell>
                                    <TableCell>{request.phone}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono tracking-widest">{request.verificationCode}</span>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(request.verificationCode)}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>{t.delete_driver_confirm_title || "Are you sure?"}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {t.delete_request_confirm_desc || "This will permanently delete the registration request."}
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>{t.cancel_button || "Cancel"}</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteUserRegistrationRequest(request.id)} className="bg-destructive hover:bg-destructive/90">
                                                {t.delete_button || "Delete"}
                                            </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", viewMode !== 'card' && 'hidden')}>
                    {userRegistrationRequests.map(request => (
                        <ApplicationCard 
                            key={request.id} 
                            request={request}
                            onDelete={deleteUserRegistrationRequest}
                            onCopy={handleCopy}
                            t={t}
                        />
                    ))}
                </div>
                </>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

function ApplicationsSkeleton() {
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
                        <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-28" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-5 w-20" /></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(3)].map((_, i) => (
                           <TableRow key={i}>
                                <TableCell>
                                    <Skeleton className="h-5 w-full" />
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

const ApplicationCard = ({ request, onDelete, onCopy, t }: { request: UserRegistrationRequest, onDelete: (id: string) => void, onCopy: (text: string) => void, t: any }) => (
    <Card>
        <CardHeader>
            <CardTitle>{request.name}</CardTitle>
            <CardDescription>{request.phone}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-mono text-2xl tracking-widest">{request.verificationCode}</span>
                <Button variant="ghost" size="icon" onClick={() => onCopy(request.verificationCode)}>
                    <Copy className="h-5 w-5" />
                </Button>
            </div>
        </CardContent>
        <CardFooter className="p-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t.delete_button || "Delete"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.delete_driver_confirm_title || "Are you sure?"}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.delete_request_confirm_desc || "This will permanently delete the registration request."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.cancel_button || "Cancel"}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(request.id)} className="bg-destructive hover:bg-destructive/90">
                    {t.delete_button || "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
    </Card>
)

export default function UserApplicationsPage() {
    return (
        <AdminPanelWrapper>
            <UserApplicationsPageContent />
        </AdminPanelWrapper>
    )
}
