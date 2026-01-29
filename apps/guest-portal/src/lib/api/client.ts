import { Reservation } from '@/types';

// TODO: Move to environment variable
const API_BASE_URL = 'http://localhost:8000/api';

export async function getArrivalReservations(date?: string, facilityId?: number): Promise<Reservation[]> {
    try {
        const params = new URLSearchParams();
        if (date) params.append('date', date);
        if (facilityId) params.append('facility_id', facilityId.toString());

        const response = await fetch(`${API_BASE_URL}/reservations/arrival/?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store', // Ensure fresh data
        });

        if (!response.ok) {
            console.error('Failed to fetch reservations:', response.statusText);
            return [];
        }

        const data = await response.json();
        return data; // Assuming the API returns a list of Reservation objects directly or paginated? 

        // Based on ListAPIView, it returns a list by default.
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return [];
    }
}

export async function createPaymentIntent(reservationId: number): Promise<{ clientSecret: string; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/payment/create-payment-intent/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            reservation_id: reservationId,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create payment intent: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    return {
        clientSecret: data.clientSecret || data.client_secret || data.ClientSecret,
        error: data.error
    };
}

export async function createReservation(data: {
    guest_name: string;
    check_in: string;
    check_out: string;
    guests: number;
    facility_id?: number;
}): Promise<Reservation> {
    const response = await fetch(`${API_BASE_URL}/reservations/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create reservation: ${response.statusText} - ${errorText}`);
    }

    return response.json();
}

export async function getReservationStatus(id: number): Promise<{ is_paid: boolean; status: string }> {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}/status/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        // If the endpoint doesn't exist yet, we might want to return failure or throw
        // For now, assuming standard error handling
        throw new Error(`Failed to fetch reservation status: ${response.statusText}`);
    }

    return response.json();
}
