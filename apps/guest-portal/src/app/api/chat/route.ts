import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client only if key is present to avoid crash on build/start
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

const SYSTEM_PROMPT = `
You are a helpful Minpaku (Private Lodging) Concierge. 
Your goal is to assist guests with their stay, provide local tourism advice, and help with check-in/out.
The accommodation is "Zen Hills Tokyo". 
Check-in is 3 PM, Check-out is 10 AM.
WiFi Password is "stay2024".
You must be polite, professional, and welcoming.
`;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!openai) {
            // Mock response if no API key
            await new Promise(resolve => setTimeout(resolve, 1000));
            return NextResponse.json({
                content: "I am currently in demo mode (OpenAI API Key not configured). But I would tell you that Check-out is at 10 AM!"
            });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...messages
            ],
        });

        return NextResponse.json({
            content: completion.choices[0].message.content
        });

    } catch (error) {
        console.error('Chat Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
