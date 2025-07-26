
'use client';

import { useState, useContext, useMemo, useEffect } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Ticket, CheckCircle, AlertCircle, XCircle, List, LayoutGrid, Copy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PromoCode } from '@/lib/types';
import { format } from 'date-fns';
import { enUS, ru, uz } from 'date-fns/locale';
import { cn } from '@/lib/utils';


const getStatusBadge = (code: PromoCode, t: any) => {
    const now = new Date();
    let status = code.status;
    if (status === 'active' && code.expiresAt.toDate() < now) {
        status = 'expired';
    }

    switch (status) {
        case 'active':
            return <Badge variant="secondary"><CheckCircle className="h-4 w-4 mr-1 text-green-500" />{t.promo_status_active || 'Active'}</Badge>;
        case 'depleted':
            return <Badge variant="destructive"><XCircle className="h-4 w-4 mr-1" />{t.promo_status_depleted || 'Depleted'}</Badge>;
        case 'expired':
            return <Badge variant="outline"><AlertCircle className="h-4 w-4 mr-1" />{t.promo_status_expired || 'Expired'}</Badge>;
        default:
            return <Badge>{status}</Badge>
    }
}

const PromoCodeCard = ({ code, t, getLocale }: { code: PromoCode, t: any, getLocale: () => Locale }) => {
    const { toast } = useToast();
    const handleCopy = () => {
        navigator.clipboard.writeText(code.code);
        toast({ title: t.promo_code_copied_title || "Copied!", description: (t.promo_code_copied_desc || 'Promo code {code} copied to clipboard.').replace('{code}', code.code) });
    };

    return (
        <Card>
            <CardHeader className="flex-row items-start justify-between">
                <div>
                    <CardTitle className="font-mono font-bold text-2xl tracking-wider">{code.code}</CardTitle>
                    <CardDescription>{t.promo_table_usage}: {code.usageCount} / {code.limit}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                    <Copy className="h-5 w-5" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>{getStatusBadge(code, t)}</div>
                <p className="text-xs text-muted-foreground">{t.promo_table_expires}: {format(code.expiresAt.toDate(), 'PPP, HH:mm', { locale: getLocale() })}</p>
            </CardContent>
        </Card>
    )
};


export default function PromoCodesPage() {
    const context = useContext(AppContext);
    const { toast } = useToast();

    const [limit, setLimit] = useState(1);
    const [validity, setValidity] = useState('12');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

    useEffect(() => {
        const savedViewMode = localStorage.getItem('promocodes-view-mode') as 'table' | 'card';
        if (savedViewMode) {
            setViewMode(savedViewMode);
        }
    }, []);

    if (!context) {
        throw new Error('PromoCodesPage must be used within an AppProvider');
    }

    const { translations: t, createPromoCode, promoCodes, loading, language } = context;

    const handleSetViewMode = (mode: 'table' | 'card') => {
        setViewMode(mode);
        localStorage.setItem('promocodes-view-mode', mode);
    }

    const getLocale = () => {
        switch (language) {
            case 'ru': return ru;
            case 'uz': return uz;
            default: return enUS;
        }
    }

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

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({ title: t.promo_code_copied_title || "Copied!", description: (t.promo_code_copied_desc || 'Promo code {code} copied to clipboard.').replace('{code}', code) });
    };

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
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>{t.promo_existing_title || 'Existing Promo Codes'}</CardTitle>
                                <CardDescription>{t.promo_existing_desc || 'Here is a list of all promo codes.'}</CardDescription>
                            </div>
                             <div className="flex items-center gap-2">
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
                                    <Table className="min-w-[600px]">
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
                                                        <TableCell className="font-mono font-bold flex items-center gap-2">
                                                            {code.code} 
                                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyCode(code.code)}>
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell>{`${code.usageCount} / ${code.limit}`}</TableCell>
                                                        <TableCell>{format(code.expiresAt.toDate(), 'PPP, HH:mm', { locale: getLocale() })}</TableCell>
                                                        <TableCell>{getStatusBadge(code, t)}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="h-24 text-center">{t.promo_no_codes || 'No promo codes created yet.'}</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                             <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", viewMode !== 'card' && 'hidden')}>
                                 {loading ? (
                                     <p>{t.loading}</p>
                                 ) : promoCodes.length > 0 ? (
                                    promoCodes.map((code) => (
                                        <PromoCodeCard key={code.id} code={code} t={t} getLocale={getLocale} />
                                    ))
                                ) : (
                                     <div className="col-span-full text-center py-16">
                                        <p className="text-muted-foreground">{t.promo_no_codes || 'No promo codes created yet.'}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
