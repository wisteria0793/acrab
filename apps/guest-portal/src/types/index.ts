export interface Facility {
    id: number;
    facility_name: string;
    // Add other facility fields as needed
}

export interface Reservation {
    id: number; // Django default ID

    // Foreign Key
    facility: number | Facility; // ID or object depending on serialization

    // Beds24 Info
    beds24_booking_id: number;

    // Status & References
    status: string;
    referer: string;
    api_reference: string;

    // Dates
    check_in: string; // YYYY-MM-DD
    check_out: string; // YYYY-MM-DD

    // Guest Info
    guest_name: string;
    guest_country: string;

    // Counts
    num_adult: number;
    num_child: number;

    // Financials
    total_price: number | null;
    comission: number | null;
    accommodation_tax: number | null;
    is_paid: boolean;

    // Timestamps
    booking_time: string; // ISO 8601
    create_at: string;
    updated_at: string;
    cancelled_at: string | null;
}
