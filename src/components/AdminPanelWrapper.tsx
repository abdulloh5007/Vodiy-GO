
'use client';

import { PinLockProvider } from "@/contexts/PinLockContext";
import { ReactNode } from "react";

export function AdminPanelWrapper({ children }: { children: ReactNode }) {
    return (
        <PinLockProvider>
            {children}
        </PinLockProvider>
    )
}
