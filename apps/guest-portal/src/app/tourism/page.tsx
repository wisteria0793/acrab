'use client';

import { ArrowLeft, MapPin, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const SPOTS = [
    {
        id: 1,
        name: 'Senso-ji Temple',
        category: 'Culture',
        distance: '1.2 km',
        description: 'Ancient Buddhist temple located in Asakusa.',
        image: 'bg-red-900', // Placeholder color
    },
    {
        id: 2,
        name: 'Tokyo Skytree',
        category: 'Sightseeing',
        distance: '2.5 km',
        description: 'The tallest tower in the world.',
        image: 'bg-blue-900',
    },
    {
        id: 3,
        name: 'Ueno Park',
        category: 'Nature',
        distance: '0.8 km',
        description: 'Large public park next to Ueno Station.',
        image: 'bg-green-900',
    },
    {
        id: 4,
        name: 'Ameyoko Market',
        category: 'Shopping',
        distance: '0.9 km',
        description: 'Busy market street underneath the train tracks.',
        image: 'bg-yellow-900',
    },
];

export default function TourismPage() {
    return (
        <div className="min-h-screen p-6 relative overflow-hidden">
            <header className="flex items-center gap-4 mb-8">
                <Link href="/" className="glass-button w-10 h-10 rounded-full flex items-center justify-center">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold">Local Guide</h1>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {SPOTS.map((spot, i) => (
                    <motion.div
                        key={spot.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel overflow-hidden rounded-2xl group cursor-pointer"
                    >
                        <div className={`h-32 ${spot.image} relative`}>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                            <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-xs font-medium border border-white/10">
                                {spot.category}
                            </span>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold">{spot.name}</h3>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {spot.distance}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {spot.description}
                            </p>
                            <button className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                                View Details <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
