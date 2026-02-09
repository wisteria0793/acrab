'use client';

import { useState, useEffect, use } from 'react';
import { ArrowLeft, MapPin, ExternalLink, Clock, Globe } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getTourismSpot, TourismSpot } from '@/lib/api/client';

export default function TourismSpotPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [spot, setSpot] = useState<TourismSpot | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        const fetchSpot = async () => {
            try {
                const data = await getTourismSpot(parseInt(id, 10));
                setSpot(data);
            } catch (error) {
                console.error('Failed to fetch tourism spot:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSpot();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!spot) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
                <p className="text-gray-500 mb-4">Spot not found.</p>
                <Link href="/tourism" className="text-blue-600 hover:underline">
                    Back to Guide
                </Link>
            </div>
        );
    }

    // Sort images so the main image comes first
    const allImages = [...spot.images].sort((a, b) => (b.is_main === a.is_main ? 0 : b.is_main ? 1 : -1));

    // Fallback if no images array but main_image exists (backward compatibility or API quirk)
    if (allImages.length === 0 && spot.main_image) {
        allImages.push({
            id: -1,
            image: spot.main_image.url,
            caption: spot.main_image.caption,
            is_main: true
        });
    }

    return (
        <div className="h-screen w-full overflow-y-auto bg-gray-50 pb-24 touch-pan-y">
            {/* Hero Image */}
            <div className="relative h-[40vh] md:h-[50vh] bg-gray-900">
                {allImages.length > 0 ? (
                    <motion.img
                        key={activeImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        src={allImages[activeImageIndex].image}
                        alt={allImages[activeImageIndex].caption || spot.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <MapPin className="w-16 h-16 opacity-50" />
                    </div>
                )}

                <Link
                    href="/tourism"
                    className="absolute top-6 left-6 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/20"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>

                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 pt-24">
                    <span className="inline-block px-3 py-1 bg-blue-600/90 text-white text-xs font-bold rounded-lg mb-2 shadow-lg backdrop-blur-sm">
                        {spot.category_display}
                    </span>
                    <h1 className="text-3xl font-bold text-white shadow-sm">{spot.name_en || spot.name}</h1>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 -mt-6 relative z-10">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">

                    {/* Image Gallery Thumbnails */}
                    {allImages.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {allImages.map((img, idx) => (
                                <button
                                    key={img.id}
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 transition-opacity ${activeImageIndex === idx ? 'ring-2 ring-blue-500 opacity-100' : 'opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <img src={img.image} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                            <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-gray-900 text-sm mb-1">Address</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{spot.address}</p>
                            </div>
                        </div>
                        {spot.opening_hours && (
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                                <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Opening Hours</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{spot.opening_hours}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {spot.description_en || spot.description}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                        {spot.map_url && (
                            <a
                                href={spot.map_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                <MapPin className="w-4 h-4" />
                                Open Map
                            </a>
                        )}
                        {spot.url && (
                            <a
                                href={spot.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                            >
                                <Globe className="w-4 h-4" />
                                Visit Website
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
