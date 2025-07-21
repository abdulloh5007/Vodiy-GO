'use client';

import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { Language } from '@/lib/types';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const context = useContext(AppContext);

  if (!context) {
    return null;
  }

  const { language, setLanguage } = context;

  const languages: { code: Language; name: string, flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'uz', name: 'O‘zbekcha', flag: '🇺🇿' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem key={lang.code} onSelect={() => setLanguage(lang.code)}>
             <span className={cn("mr-2", language === lang.code ? "opacity-100" : "opacity-0")}><Check className="h-4 w-4"/></span>
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
