'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { api, Shelter } from '../../services/api';
import { calculateDistance } from '../../utils/mapUtils'; // We'll create this

const MapView = dynamic(() => import('../../components/MapView'), {
  ssr: false,
  loading: () => <div>Loading map...</div>
});

interface NearestShelter extends Shelter {
  distance: number;
}

export default function MapPage() {
    const [nearestShelters, setNearestShelters] = useState<NearestShelter[]>([]);
    const [selectedShelterId, setSelectedShelterId] = useState<number | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    // Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }
    }, []);

    const findNearestShelters = async () => {
        if (!userLocation) {
            alert('Please enable location services first.');
            return;
        }

        try {
            const response = await api.getShelters();
            const sheltersWithDistance = response.data
                .map((shelter: Shelter) => ({
                    ...shelter,
                    distance: calculateDistance(
                        userLocation[0],
                        userLocation[1],
                        shelter.lat,
                        shelter.lng
                    )
                }))
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 2);

            setNearestShelters(sheltersWithDistance);
            setSelectedShelterId(null);
        } catch (error) {
            console.error('Failed to fetch shelters:', error);
            alert('Failed to find nearest shelters');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-4 flex gap-4 items-center">
                <button 
                    onClick={findNearestShelters}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    🏠 Find Nearest Shelters from your location
                </button>
                
                {nearestShelters.length > 0 && (
                    <select 
                        onChange={(e) => setSelectedShelterId(Number(e.target.value))}
                        value={selectedShelterId || ''}
                        className="border p-2 rounded"
                    >
                        <option value="">Select a shelter</option>
                        {nearestShelters.map(shelter => (
                            <option key={shelter.id} value={shelter.id}>
                                {shelter.name} ({shelter.distance.toFixed(2)} km)
                            </option>
                        ))}
                    </select>
                )}
            </div>
            
            <div className="relative w-full h-[calc(100vh-200px)] rounded-lg overflow-hidden">
                <MapView 
                    selectedShelterId={selectedShelterId}
                    userLocation={userLocation}
                />
            </div>
        </div>
    );
}
