'use client';

import { useCheckInStore } from '@/lib/store/check-in';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const PROTECTED_ROUTES = ['/chat', '/amenities', '/tourism'];

export function NavigationGuard({ children }: { children: React.ReactNode }) {
    const { isCheckedIn } = useCheckInStore();
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Allow public access to home and check-in
        if (pathname === '/' || pathname.startsWith('/check-in')) {
            setAuthorized(true);
            return;
        }

        // If trying to access protected route without check-in
        if (PROTECTED_ROUTES.some(route => pathname.startsWith(route)) && !isCheckedIn) {
            router.push('/');
            setAuthorized(false);
        } else {
            setAuthorized(true);
        }
    }, [pathname, isCheckedIn, router]);

    // Prevent flashing of protected content
    if (!authorized && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
        return null;
    }

    return <>{children}</>;
}
