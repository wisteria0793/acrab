export const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export const sendKioskChatMessage = async (facilityId: string | number, message: string, history: ChatMessage[] = []): Promise<string> => {
    const res = await fetch(`${API_URL}/api/kiosk/guides/chat/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            facility_id: facilityId,
            message,
            history,
        }),
    });

    if (!res.ok) {
        throw new Error('Failed to send chat message');
    }

    const data = await res.json();
    return data.response;
};
