'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, ExternalLink, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getTourismSpots, TourismSpot } from '@/lib/api/client';

const CATEGORIES = [
    { id: '', label: 'All' },
    { id: 'scenery', label: 'Scenery' },
    { id: 'gourmet', label: 'Gourmet' },
    { id: 'activity', label: 'Activity' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'culture', label: 'Culture' },
];

export default function TourismPage() {
    const [spots, setSpots] = useState<TourismSpot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchSpots = async () => {
            setIsLoading(true);
            try {
                const response = await getTourismSpots(selectedCategory, 1, searchQuery);
                setSpots(response.results);
            } catch (error) {
                console.error('Failed to fetch tourism spots:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchSpots();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [selectedCategory, searchQuery]);

    return (
        <div className="h-screen w-full overflow-y-auto p-6 bg-gray-50 text-gray-900 pb-24 touch-pan-y">
            <header className="flex items-center gap-4 mb-4">
                <Link href="/" className="glass-button w-12 h-12 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors bg-white border border-gray-100 shadow-sm">
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </Link>
                <h1 className="text-2xl font-bold">Local Guide</h1>
            </header>

            {/* Search & Filter */}
            <div className="mb-8 space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search for places..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 transition-colors shadow-sm"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        // Skeleton loading state
                        [...Array(4)].map((_, i) => (
                            <motion.div
                                key={`skeleton-${i}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-80 animate-pulse"
                            >
                                <div className="h-48 bg-gray-200" />
                                <div className="p-5 space-y-3">
                                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded w-full" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                </div>
                            </motion.div>
                        ))
                    ) : spots.length > 0 ? (
                        spots.map((spot) => (
                            <motion.div
                                key={spot.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-md transition-shadow"
                            >
                                <Link href={`/tourism/${spot.id}`} className="block h-full">
                                    <div className="relative h-48 overflow-hidden bg-gray-200">
                                        {(spot.main_image?.url || spot.images?.[0]?.image) ? (
                                            <img
                                                src={spot.main_image?.url || spot.images[0].image}
                                                alt={spot.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <MapPin className="w-12 h-12" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-800 shadow-sm">
                                            {spot.category_display || spot.category}
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="mb-2">
                                            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{spot.name_en || spot.name}</h3>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 truncate">
                                                <MapPin className="w-3 h-3" /> {spot.address}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                                            {spot.description_en || spot.description}
                                        </p>

                                        <div className="w-full py-2.5 rounded-xl bg-gray-100 group-hover:bg-blue-50 text-gray-700 group-hover:text-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                                            View Details
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-12 text-center text-gray-500"
                        >
                            <p>No spots found matching your criteria.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
