'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Bot, User, Sparkles, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TextareaAutosize from 'react-textarea-autosize';

import { createConciergeSession, sendConciergeMessage, Message } from '@/lib/api/client';
import { useCheckInStore } from '@/lib/store/check-in';

const SUGGESTED_QUESTIONS = [
    "Wi-Fi Password?",
    "Check-out time?",
    "Near by restaurants?",
    "How to use AC?",
    "Luggage storage?"
];

export default function ChatPage() {
    const { booking } = useCheckInStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initSession = async () => {
            if (!booking?.id) return;
            try {
                const session = await createConciergeSession(booking.id);
                setSessionId(session.id);
                setMessages(session.messages);
            } catch (error) {
                console.error('Failed to init session:', error);
                setMessages([{
                    id: 0,
                    role: 'assistant',
                    content: 'Sorry, I could not connect to the concierge service. Please check your connection.',
                    created_at: new Date().toISOString()
                }]);
            }
        };

        if (!sessionId) {
            initSession();
        }
    }, [booking?.id, sessionId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (content: string) => {
        if (!content.trim() || isLoading || !sessionId) return;

        const userMessageContent = content;
        const tempUserMessage: Message = {
            id: Date.now(),
            role: 'user',
            content: userMessageContent,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, tempUserMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const responseMessage = await sendConciergeMessage(sessionId, userMessageContent);
            setMessages(prev => [...prev, responseMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Sorry, I am having trouble connecting right now. Please try again later.',
                created_at: new Date().toISOString()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(input);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(input);
        }
    };

    return (
        <div className="flex flex-col h-screen relative overflow-hidden bg-zinc-950 text-zinc-100 font-sans selection:bg-purple-500/30">
            {/* Background */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full mix-blend-screen" />
            </div>

            <header className="flex items-center gap-4 p-4 border-b border-white/5 z-10 shrink-0 bg-zinc-900/80 backdrop-blur-md">
                <Link href="/" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-zinc-100">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-lg font-bold flex items-center gap-2 text-zinc-100">
                        AI Concierge <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs text-zinc-400">Online</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
                {messages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                            <Bot className="w-8 h-8 text-purple-400" />
                        </div>
                        <p className="text-sm">Ask me anything about your stay!</p>
                    </div>
                )}

                {messages.map((m, index) => (
                    <div
                        key={index}
                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        <div className={`flex items-end gap-3 max-w-[85%] sm:max-w-[75%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${m.role === 'user'
                                ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                                : 'bg-gradient-to-br from-purple-600 to-purple-700'
                                }`}>
                                {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                            </div>

                            <div
                                className={`px-4 py-3 rounded-2xl shadow-md ${m.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-zinc-800/80 backdrop-blur-sm border border-white/5 text-zinc-100 rounded-tl-none'
                                    }`}
                            >
                                <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {m.content}
                                    </ReactMarkdown>
                                </div>
                                <div className={`text-[10px] mt-1 opacity-50 flex ${m.role === 'user' ? 'justify-end text-blue-100' : 'justify-start text-zinc-400'}`}>
                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-end gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shrink-0 shadow-lg">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-zinc-800/80 backdrop-blur-sm border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none">
                                <div className="flex gap-1.5 items-center h-5">
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-zinc-900/50 backdrop-blur-md border-t border-white/5 shrink-0 space-y-3">
                {/* Suggestions */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-linear-fade">
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                        <button
                            key={i}
                            onClick={() => handleSendMessage(q)}
                            disabled={isLoading}
                            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 text-xs sm:text-sm text-zinc-300 hover:text-purple-200 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            <MessageSquare className="w-3 h-3" />
                            {q}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                    <div className="flex-1 relative group">
                        <TextareaAutosize
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            minRows={1}
                            maxRows={5}
                            className="w-full bg-black/20 border border-white/10 hover:border-white/20 focus:border-purple-500/50 rounded-xl px-4 py-3 pl-4 pr-10 outline-none transition-colors resize-none text-sm sm:text-base leading-relaxed"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="w-11 h-11 rounded-xl flex items-center justify-center bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 transition-all shadow-lg active:scale-95 shrink-0"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
