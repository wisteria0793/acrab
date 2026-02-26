'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'lesath_kiosk_facility_id';

export function useKioskSetup() {
    const [facilityId, setFacilityId] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Read from localStorage on mount
        const storedId = localStorage.getItem(STORAGE_KEY);
        if (storedId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFacilityId(storedId);
        }
        setIsLoaded(true);
    }, []);

    const saveFacilityId = (id: string) => {
        localStorage.setItem(STORAGE_KEY, id);
        setFacilityId(id);
    };

    const clearFacilityId = () => {
        localStorage.removeItem(STORAGE_KEY);
        setFacilityId(null);
    };

    return { facilityId, saveFacilityId, clearFacilityId, isLoaded };
}
