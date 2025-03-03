'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabaseApi, type Shelter, type Report } from '@/services/supabase';
import { calculateDistance } from '@/utils/mapUtils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import ReportForm from '@/components/ReportForm';

const MapView = dynamic(() => import('@/components/MapView'), {
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
    const [isReportFormOpen, setIsReportFormOpen] = useState(false);
    const [isSelectingLocation, setIsSelectingLocation] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
    const [reports, setReports] = useState<Report[]>([]);

    // Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    toast.error('Could not get your location');
                }
            );
        }
    }, []);

    useEffect(() => {
        // Fetch reports when component mounts
        const fetchReports = async () => {
            try {
                const data = await supabaseApi.getUserReports();
                setReports(data);
            } catch (error) {
                console.error('Error fetching reports:', error);
            }
        };
        fetchReports();
    }, []);

    const findNearestShelters = async () => {
        if (!userLocation) {
            toast.error('Please enable location services first');
            return;
        }

        try {
            const shelters = await supabaseApi.getNearestShelters(userLocation[0], userLocation[1]);
            setNearestShelters(shelters);
            setSelectedShelterId(null);
            toast.success('Found nearest shelters!');
        } catch (error) {
            console.error('Failed to fetch shelters:', error);
            toast.error('Failed to find nearest shelters');
        }
    };

    const handleReportCurrentLocation = () => {
        if (!userLocation) {
            toast.error('Please enable location services first');
            return;
        }
        setSelectedLocation({ lat: userLocation[0], lng: userLocation[1] });
        setIsReportFormOpen(true);
        setIsSelectingLocation(false);
    };

    const handleSelectLocationReport = () => {
        console.log("Starting location selection");
        setIsSelectingLocation(true);
        setIsReportFormOpen(false);
    };

    const handleLocationSelect = (location: { lat: number; lng: number }) => {
        console.log("Location selected:", location);
        setSelectedLocation(location);
        setIsSelectingLocation(false);
        setIsReportFormOpen(true);
    };

    return (
        <>
            <div className="mb-4 flex gap-4 items-center flex-wrap">
                <Button onClick={handleReportCurrentLocation}>
                    📍 Report Current Location
                </Button>
                
                <Button onClick={handleSelectLocationReport}>
                    🗺️ Select Location on Map
                </Button>
                
                <button 
                    onClick={findNearestShelters}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    🏠 Find Nearest Shelters
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
                                {shelter.shelter_name} ({shelter.distance.toFixed(2)} km)
                            </option>
                        ))}
                    </select>
                )}
            </div>
            
            <div className="relative w-full h-[calc(100vh-200px)] rounded-lg overflow-hidden">
                <MapView 
                    selectedShelterId={selectedShelterId}
                    userLocation={userLocation}
                    isSelectingLocation={isSelectingLocation}
                    onLocationSelect={handleLocationSelect}
                    reports={reports}
                />
            </div>

            <ReportForm
                isOpen={isReportFormOpen}
                onClose={() => {
                    setIsReportFormOpen(false);
                    setIsSelectingLocation(false);
                    setSelectedLocation(null);
                }}
                location={selectedLocation}
                isSelectingLocation={isSelectingLocation}
                onLocationSelect={handleLocationSelect}
            />
        </>
    );
}
