
'use client';

import { useState, useContext, useMemo } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Ticket, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PromoCode } from '@/lib/types';
import { format } from 'date-fns';

export default function PromoCodesPage() {
    const context = useContext(AppContext);
    const { toast } = useToast();

    const [limit, setLimit] = useState(1);
    const [validity, setValidity] = useState('12');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!context) {
        throw new Error('PromoCodesPage must be used within an AppProvider');
    }

    const { translations: t, createPromoCode, promoCodes, loading } = context;

    const handleCreateCode = async () => {
        setIsSubmitting(true);
        try {
            await createPromoCode(limit, parseInt(validity));
            toast({
                title: t.promo_code_created_title || 'Promo Code Created',
                description: t.promo_code_created_desc || 'The new promo code has been successfully generated.',
            });
            setLimit(1);
            setValidity('12');
        } catch (error) {
            console.error(error);
            toast({
                title: t.error,
                description: t.unknownError,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const getStatusBadge = (code: PromoCode) => {
        const now = new Date();
        let status = code.status;
        if (status === 'active' && code.expiresAt.toDate() < now) {
            status = 'expired';
        }

        switch(status) {
            case 'active':
                return <Badge variant="secondary"><CheckCircle className="h-4 w-4 mr-1 text-green-500"/>{t.promo_status_active || 'Active'}</Badge>;
            case 'depleted':
                return <Badge variant="destructive"><XCircle className="h-4 w-4 mr-1"/>{t.promo_status_depleted || 'Depleted'}</Badge>;
            case 'expired':
                return <Badge variant="outline"><AlertCircle className="h-4 w-4 mr-1"/>{t.promo_status_expired || 'Expired'}</Badge>;
            default:
                return <Badge>{status}</Badge>
        }
    }


    return (
        <div className="container mx-auto py-8 px-4">
            <Tabs defaultValue="create" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="create">{t.promo_tab_create || 'Create Code'}</TabsTrigger>
                    <TabsTrigger value="existing">{t.promo_tab_existing || 'Existing Codes'}</TabsTrigger>
                </TabsList>
                <TabsContent value="create">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t.promo_create_title || 'Create a New Promo Code'}</CardTitle>
                            <CardDescription>{t.promo_create_desc || 'Generate a new code to extend ride visibility for drivers.'}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="limit">{t.promo_limit_label || 'Usage Limit'}</Label>
                                <Input 
                                    id="limit" 
                                    type="number" 
                                    min="1" 
                                    value={limit} 
                                    onChange={(e) => setLimit(Math.max(1, parseInt(e.target.value) || 1))} 
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="validity">{t.promo_validity_label || 'Validity Period'}</Label>
                                <Select value={validity} onValueChange={setValidity} disabled={isSubmitting}>
                                    <SelectTrigger id="validity">
                                        <SelectValue placeholder="Select validity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="12">{t.promo_validity_12h || '12 Hours'}</SelectItem>
                                        <SelectItem value="24">{t.promo_validity_24h || '24 Hours'}</SelectItem>
                                        <SelectItem value="72">{t.promo_validity_72h || '72 Hours (3 days)'}</SelectItem>
                                        <SelectItem value="168">{t.promo_validity_168h || '168 Hours (7 days)'}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <Button onClick={handleCreateCode} disabled={isSubmitting} className="w-full">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Ticket className="mr-2 h-4 w-4" />
                                {t.promo_create_button || 'Generate Code'}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="existing">
                    <Card>
                        <CardHeader>
                             <CardTitle>{t.promo_existing_title || 'Existing Promo Codes'}</CardTitle>
                             <CardDescription>{t.promo_existing_desc || 'Here is a list of all promo codes.'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t.promo_table_code || 'Code'}</TableHead>
                                        <TableHead>{t.promo_table_usage || 'Usage'}</TableHead>
                                        <TableHead>{t.promo_table_expires || 'Expires At'}</TableHead>
                                        <TableHead>{t.promo_table_status || 'Status'}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">{t.loading}</TableCell>
                                        </TableRow>
                                    ) : promoCodes.length > 0 ? (
                                        promoCodes.map((code) => (
                                            <TableRow key={code.id}>
                                                <TableCell className="font-mono font-bold">{code.code}</TableCell>
                                                <TableCell>{`${code.usageCount} / ${code.limit}`}</TableCell>
                                                <TableCell>{format(code.expiresAt.toDate(), 'PPP p')}</TableCell>
                                                <TableCell>{getStatusBadge(code)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                         <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">{t.promo_no_codes || 'No promo codes created yet.'}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
