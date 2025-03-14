'use client'

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabaseApi, type Report, type Shelter } from '@/services/supabase';
import axios from 'axios';
import L from 'leaflet';
import { YANGON_TOWNSHIPS } from '@/constants/townships';
import '@/styles/MapView.css'
import { Delivery } from '@/services/api';
import { createClient } from '@/utils/supabase/client';
const supabase = createClient();
const carIconUrl = '/assets/car.png';

// Add these constants at the top of the file
const TILE_LAYER_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_LAYER_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Add these alternative tile layer URLs
const PRIMARY_TILE_LAYER = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const FALLBACK_TILE_LAYER = "https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Fix Leaflet marker icons
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const RedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Add Green Icon for driver location
const GreenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Add Purple Icon for deliveries
const PurpleIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const customDriverIcon = L.icon({
  iconUrl: carIconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface RouteInfo {
  deliveryId: number;
  shopName: string;
  totalTime: number;
  reports: Array<{
    description: string;
    distance: number;
  }>;
}

const location_gp1: string[] = [YANGON_TOWNSHIPS.Tarmwe, YANGON_TOWNSHIPS.Bahan, YANGON_TOWNSHIPS.Yankin, YANGON_TOWNSHIPS.Dagon, YANGON_TOWNSHIPS.Thaketa];
const location_gp2: string[] = [YANGON_TOWNSHIPS.ThingyanKyun, YANGON_TOWNSHIPS.SouthOkkalapa, YANGON_TOWNSHIPS.NorthDagon, YANGON_TOWNSHIPS.SouthDagon, YANGON_TOWNSHIPS.EastDagon]
const location_gp3: string[] = [YANGON_TOWNSHIPS.Hlaing, YANGON_TOWNSHIPS.Insein, YANGON_TOWNSHIPS.HlaingTharYar, YANGON_TOWNSHIPS.Sanchaung, YANGON_TOWNSHIPS.Kamaryut]
const location_gp4: string[] = [YANGON_TOWNSHIPS.Lanmadaw, YANGON_TOWNSHIPS.Latha, YANGON_TOWNSHIPS.PazundaungTownship, YANGON_TOWNSHIPS.Botahtaung, YANGON_TOWNSHIPS.Kyauktada, YANGON_TOWNSHIPS.MingalarTaungNyunt]

interface MapViewProps {
  selectedShelterId: number | null;
  userLocation: [number, number] | null;
  isSelectingLocation?: boolean;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  reports: Report[];
}

const MapView: React.FC<MapViewProps> = ({ selectedShelterId, userLocation: initialUserLocation, isSelectingLocation, onLocationSelect, reports }) => {
  // First declare all state variables
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [position, setPosition] = useState<[number, number]>([16.8397, 96.1444]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(initialUserLocation);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'shelter' | 'report' | null>(null);
  const [routePolyline, setRoutePolyline] = useState<[number, number][]>([]);
  const [travelTime, setTravelTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [optimizedRoute, setOptimizedRoute] = useState<[number, number][]>([]);
  const [totalTravelTime, setTotalTravelTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDriverName, setSelectedDriverName] = useState<string | null>(null);
  const [optimizedWaypoints, setOptimizedWaypoints] = useState<any[]>([]);
  const [routeSegments, setRouteSegments] = useState<Array<[number, number][]>>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [deliveryRoutes, setDeliveryRoutes] = useState<{ [key: number]: [number, number][] }>({});
  const [routeInfos, setRouteInfos] = useState<RouteInfo[]>([]);
  const [isInfoMinimized, setIsInfoMinimized] = useState(false);
  const [filteredDeliveryId, setFilteredDeliveryId] = useState<number | null>(null);
  const [algorithmStats, setAlgorithmStats] = useState<{
    timeComplexity: string;
    executionTime: number;
    overallProximityStats: string;
    routeProximityStats: { [key: number]: string };
  }>({
    timeComplexity: '',
    executionTime: 0,
    overallProximityStats: '',
    routeProximityStats: {}
  });
  const [isAlgoStatsMinimized, setIsAlgoStatsMinimized] = useState(false);
  const [animationRoute, setAnimationRoute] = useState<[number, number][]>([]);
  const [showDriverCard, setShowDriverCard] = useState(false);
  const [isDriverCardMinimized, setIsDriverCardMinimized] = useState(false);

  // Then declare all useEffect hooks
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simplified auth check using email
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Current user:', user);
        
        if (!user) {
          console.warn('No authenticated user found');
          setError('Please log in to view shelters');
          return;
        }

        // Check if admin by email
        const isAdmin = user.email === 'htoothetdev@gmail.com';
        
        // Get shelters based on admin status
        const sheltersData = await supabaseApi.getAllShelters();
        console.log('Shelter fetch response:', sheltersData);
        
        if (!sheltersData || sheltersData.length === 0) {
          console.warn('No shelters data received');
          setError('No shelters found');
          return;
        }
        
        setShelters(sheltersData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    handleGetUserLocation();
  }, []);

  useEffect(() => {
    if (selectedShelterId && userLocation) {
      const selectedShelter = shelters.find(s => s.id === selectedShelterId);
      if (selectedShelter) {
        showRouteToShelter(selectedShelter);
      }
    }
  }, [selectedShelterId, userLocation, shelters]);

  useEffect(() => {
    const handleDriverSelect = (event: CustomEvent) => {
      const driverName = event.detail.driverName;
      setSelectedDriverName(driverName || null);
      setRouteSegments([]);
      setOptimizedWaypoints([]);
      setTotalTravelTime(null);
    };

    window.addEventListener('driverSelect', handleDriverSelect as EventListener);
    return () => {
      window.removeEventListener('driverSelect', handleDriverSelect as EventListener);
    };
  }, []);

  

  // Then we can use them in console.log
  console.log("MapView props:", { isSelectingLocation, selectedPosition });

  // Update the showRouteToShelter function
  const showRouteToShelter = async (shelter: Shelter) => {
    if (!userLocation) return;
    
    setIsLoading(true);
    try {
      const routeResponse = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${shelter.lng},${shelter.lat}?overview=full`
      );

      if (routeResponse.data.routes[0]) {
        const decodedRoute = decodePolyline(routeResponse.data.routes[0].geometry);
        setRouteSegments([decodedRoute]);
        setTotalTravelTime(Math.round(routeResponse.data.routes[0].duration / 60));
        setAnimationRoute(decodedRoute);

        const routeInfo = {
          deliveryId: shelter.id,
          shopName: shelter.shelter_name,
          totalTime: Math.round(routeResponse.data.routes[0].duration / 60),
          reports: [{
            description: `Route to ${shelter.shelter_name}`,
            distance: 0 // We'll calculate this if needed
          }]
        };

        setRouteInfos([routeInfo]);
        setIsInfoMinimized(false);
      }
    } catch (error) {
      console.error('Failed to calculate route:', error);
      alert('Failed to calculate route. Please try again.');
    }
    setIsLoading(false);
  };

 


  // Modified user location handling
  const handleGetUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPosition: [number, number] = [latitude, longitude];
          setUserLocation(newPosition);
          setPosition(newPosition);
          // Add a marker for user's location
          const marker = L.marker(newPosition, {
            icon: DefaultIcon,
          }).bindPopup('You are here');
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert(`Location error: ${error.message}`);
        },
        {
          enableHighAccuracy: true, // Request high accuracy
          timeout: 5000, // Time to wait for location
          maximumAge: 0 // Don't use cached position
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Calculate travel time
  const calculateTravelTime = async (to: [number, number]) => {
    if (!userLocation) {
      alert('Please enable location services first.');
      return;
    }
    try {
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${to[1]},${to[0]}?overview=full`
      );

      // Get the decoded polyline
      const geometry = response.data.routes[0].geometry;
      const decodedPolyline = decodePolyline(geometry);

      // Set the route and travel time
      setRoutePolyline(decodedPolyline);
      setTravelTime(Math.round(response.data.routes[0].duration / 60));
    } catch (error) {
      alert('Failed to get travel time.');
      setRoutePolyline([]);
      setTravelTime(null);
    }
  };

  // Updated decodePolyline function
  const decodePolyline = (encoded: string): [number, number][] => {
    let index = 0, lat = 0, lng = 0;
    const coordinates: [number, number][] = [];
    while (index < encoded.length) {
      let shift = 0;
      let result = 0;
      let b: number;
      // Decode first number (this was meant for the "longitude" value according to OSRM)
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += deltaLat;

      // Decode second number (this was meant for the "latitude" value according to OSRM)
      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += deltaLng;

      // IMPORTANT: OSRM returns coordinates as [longitude, latitude]. 
      // Leaflet requires them in [latitude, longitude] order.
      // Swap the order here.
      coordinates.push([lat * 1e-5, lng * 1e-5]);
    }
    return coordinates;
  };

  // Handle map clicks
  function MapClickHandler() {
    const map = useMapEvents({
      click: (e) => {
        console.log("Map clicked, isSelectingLocation:", isSelectingLocation);
        if (isSelectingLocation && onLocationSelect) {
          console.log("Handling map click at:", e.latlng);
          const newPosition: [number, number] = [e.latlng.lat, e.latlng.lng];
          setSelectedPosition(newPosition);
          // Don't call onLocationSelect here, wait for confirmation
        }
      },
    });
    return null;
  }

  // Modify calculateOptimizedRoute to show driver card
  const calculateOptimizedRoute = async () => {
    if (!userLocation) {
      alert('Please enable location services first.');
      return;
    }

    setIsLoading(true);
    try {
      // Find nearest shelter from user location
      const nearestShelter = shelters
        .map(shelter => ({
          ...shelter,
          distance: calculateDistance(
            userLocation[0],
            userLocation[1],
            shelter.lat,
            shelter.lng
          )
        }))
        .sort((a, b) => a.distance - b.distance)[0];

      if (!nearestShelter) {
        alert('No shelters found.');
        setIsLoading(false);
        return;
      }

      const startTime = performance.now();

      // Calculate route to nearest shelter
      const routeResponse = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${nearestShelter.lng},${nearestShelter.lat}?overview=full`
      );

      if (routeResponse.data.routes[0]) {
        const decodedRoute = decodePolyline(routeResponse.data.routes[0].geometry);
        setRouteSegments([decodedRoute]);
        setTotalTravelTime(Math.round(routeResponse.data.routes[0].duration / 60));
        setAnimationRoute(decodedRoute);

        // Calculate algorithm statistics
        const endTime = performance.now();
        const executionTime = endTime - startTime;

        setAlgorithmStats({
          timeComplexity: 'O(n) - for finding nearest shelter',
          executionTime: Math.round(executionTime),
          overallProximityStats: `Distance to shelter: ${nearestShelter.distance.toFixed(2)}km`,
          routeProximityStats: {
            1: `Direct route to ${nearestShelter.shelter_name}`,
          }
        });

        // Create route summary
        const routeInfo = {
          deliveryId: 1,
          shopName: nearestShelter.shelter_name,
          totalTime: Math.round(routeResponse.data.routes[0].duration / 60),
          reports: [{
            description: `Route to ${nearestShelter.shelter_name}`,
            distance: nearestShelter.distance
          }]
        };

        setRouteInfos([routeInfo]);
        setIsInfoMinimized(false);

        alert(`Route Created!\n\nTotal travel time: ${Math.round(routeResponse.data.routes[0].duration / 60)} minutes\n\nDestination: ${nearestShelter.shelter_name}`);
      }
    } catch (error) {
      console.error('Failed to calculate route:', error);
      alert('Failed to calculate route. Please try again.');
    }
    setIsLoading(false);
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Then we can use them in console.log
  console.log("MapView props:", { isSelectingLocation, selectedPosition });

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: 'red' 
      }}>
        Error: {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ height: '90vh', width: '100%' }}>
      <button 
        onClick={handleGetUserLocation}
        style={{ 
          position: 'absolute',
          zIndex: 1000,
          margin: '10px',
          left: '40px',
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '6px',
          border: 'none',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
        disabled={isLoading}
      >
        {isLoading ? 'Getting Location...' : '📍 Get Your Location'}
      </button>

      {userLocation && reports.length > 0 && (
        <button 
          onClick={calculateOptimizedRoute} 
          style={{ 
            position: 'absolute',
            zIndex: 1000,
            margin: '10px',
            left: '280px',
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
          disabled={isLoading}
        >
          {isLoading ? 'Calculating Route...' : '🚗 Show Route to nearest shelter'}
        </button>
      )}

      {routeInfos.length > 0 && (
        <div
          style={{
            position: 'absolute',
            right: isInfoMinimized ? '20px' : '50px',
            bottom: isInfoMinimized ? '20px' : '50px',
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: 1000,
            maxWidth: isInfoMinimized ? '60px' : '400px',
            maxHeight: isInfoMinimized ? '60px' : '80vh',
            overflow: 'auto',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
          }}
          onClick={() => isInfoMinimized && setIsInfoMinimized(false)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>Delivery Routes</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsInfoMinimized(!isInfoMinimized);
              }}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '5px',
              }}
            >
              {isInfoMinimized ? '🔍' : '➖'}
            </button>
          </div>

          {!isInfoMinimized && (
            <div>
              {routeInfos.map((info) => (
                <div
                  key={info.deliveryId}
                  style={{
                    marginBottom: '20px',
                    padding: '10px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '5px',
                  }}
                >
                  <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center' }}>
                    Delivery {info.deliveryId}
                    <span
                      style={{
                        display: 'inline-block',
                        width: '20px',
                        height: '4px',
                        marginLeft: '10px',
                        backgroundColor: `hsl(${(info.deliveryId * 137) % 360}, 70%, 50%)`,
                        borderRadius: '2px'
                      }}
                    />
                  </h4>
                  <p><strong>Total Time:</strong> {info.totalTime + 20} minutes</p>
                  <p><strong>Assigned Deliveries:</strong></p>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    {info.reports.map((report, index) => (
                      <li key={index}>
                        {report.description} ({report.distance + 1} km)
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {isInfoMinimized && (
            <div style={{ textAlign: 'center' }}>
              📊
            </div>
          )}
        </div>
      )}

      <MapContainer 
        center={position} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <MapClickHandler />
        <TileLayer
          url={PRIMARY_TILE_LAYER}
          attribution={OSM_ATTRIBUTION}
          eventHandlers={{
            tileerror: (error) => {
              console.warn('Primary tile layer failed, switching to fallback');
              // You could implement a switch to the fallback layer here
            },
          }}
        />
        
        {/* Add a fallback tile layer that loads if the primary fails */}
        <TileLayer
          url={FALLBACK_TILE_LAYER}
          attribution={OSM_ATTRIBUTION}
          className="fallback-tile-layer"
          opacity={0}
          eventHandlers={{
            load: (e) => {
              if (document.querySelector('.leaflet-tile-pane img.leaflet-tile.leaflet-tile-loaded') === null) {
                // If primary layer failed to load any tiles, make fallback visible
                e.target.getElement().style.opacity = '1';
              }
            },
          }}
        />

        {userLocation && (
          <Marker position={userLocation} icon={GreenIcon}>
            <Popup>
              <strong>Driver Location</strong>
            </Popup>
          </Marker>
        )}

        {routeSegments.map((segment, index) => (
          <Polyline
            key={index}
            positions={segment}
            color="#4CAF50"
            weight={4}
            opacity={0.8}
          >
            <Popup>
              Segment {index + 1}
            </Popup>
          </Polyline>
        ))}

        {optimizedWaypoints.length > 0 && (
          <>
            {optimizedWaypoints.map((waypoint: any, index: number) => {
              if (index > 0) {
                const startPoint = optimizedWaypoints[index - 1].location;
                const endPoint = waypoint.location;

                return (
                  <Polyline
                    key={`optimized-segment-${index}`}
                    positions={[
                      [startPoint[1], startPoint[0]],
                      [endPoint[1], endPoint[0]],
                    ]}
                    color="blue"
                    weight={4}
                    opacity={0.8}
                  >
                    <Popup>
                      <strong>Route Segment {index}</strong>
                      <br />
                      From: {reports[index - 1]?.description || 'Driver Location'}
                      <br />
                      To: {reports[index]?.description}
                    </Popup>
                  </Polyline>
                );
              }
              return null;
            })}
          </>
        )}

        {animationRoute.length > 0 && (
          <RouteAnimation key={animationRoute.length} route={animationRoute} />
        )}

        {shelters.map((shelter) => (
          <Marker key={shelter.id} position={[shelter.lat, shelter.lng]} icon={DefaultIcon}>
            <Popup>
              <h4>{shelter.shelter_name}</h4>
              <p>Contact: {shelter.contact}</p>
              <button onClick={() => calculateTravelTime([shelter.lat, shelter.lng])}>
                🚗 Get Directions
              </button>
              {travelTime && userLocation &&
                shelter.lat === routePolyline[routePolyline.length - 1]?.[0] &&
                shelter.lng === routePolyline[routePolyline.length - 1]?.[1] && (
                  <p style={{ marginTop: '10px', color: '#0066cc' }}>
                    Estimated travel time: {travelTime} minutes
                  </p>
                )}
            </Popup>
          </Marker>
        ))}

       

        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.lat, report.lng]}
            icon={RedIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{report.pet_type} - {report.report_type}</h3>
                <p>Status: {report.status}</p>
                <p>Urgency: {report.urgency_level}</p>
                <p>{report.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {routeInfos.map((info) => (
          <React.Fragment key={`delivery-lines-${info.deliveryId}`}>
            {info.reports.map((report, index) => {
              const delivery = deliveries.find(d => d.id === info.deliveryId);
              if (!delivery) return null;

              return (
                <Polyline
                  key={`delivery-${info.deliveryId}-report-${index}`}
                  positions={[
                    [delivery.lat, delivery.lng],
                    [reports.find(r => r.description === report.description)?.lat || 0,
                    reports.find(r => r.description === report.description)?.lng || 0]
                  ]}
                  color={`hsl(${(info.deliveryId * 137) % 360}, 70%, 50%)`}
                  weight={5}
                  opacity={1}
                >
                  <Popup>
                    <strong>Delivery Route {info.deliveryId}</strong>
                    <br />
                    From                    <br />
                    To: {report.description}
                    <br />
                    Distance: {report.distance.toFixed(2)} km
                  </Popup>
                </Polyline>
              );
            })}
          </React.Fragment>
        ))}

        {routeSegments.map((segment, index) => (
          <Polyline
            key={index}
            positions={segment}
            color="#4CAF50"
            weight={4}
          />
        ))}

{isSelectingLocation && selectedPosition && (
  <Marker position={selectedPosition} icon={RedIcon}>
    <Popup>
      <div>
        Selected Location
        <br />
        <button
          onClick={() => {
            if (onLocationSelect) {
              onLocationSelect({ lat: selectedPosition[0], lng: selectedPosition[1] });
            }  // Close the if statement
          }}  // Close the onClick arrow function
          style={{
            marginTop: '10px',
            padding: '5px 10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Confirm Location
        </button>
      </div>
    </Popup>
  </Marker>
)}

      </MapContainer>

      {totalTravelTime && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 1000,
          }}
        >
          <strong>Total Route Time:</strong> {totalTravelTime + 20}  minutes
        </div>
      )}

      {algorithmStats.executionTime > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: isAlgoStatsMinimized ? '20px' : '20px',
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 800,
            maxWidth: isAlgoStatsMinimized ? '60px' : '350px',
            maxHeight: isAlgoStatsMinimized ? '60px' : '80vh',
            overflow: 'auto',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onClick={() => isAlgoStatsMinimized && setIsAlgoStatsMinimized(false)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0 }}>Algorithm Statistics</h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsAlgoStatsMinimized(!isAlgoStatsMinimized);
              }}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '5px',
              }}
            >
              {isAlgoStatsMinimized ? '🔍' : '➖'}
            </button>
          </div>

          {!isAlgoStatsMinimized && (
            <>
              <p style={{ margin: '2px 0' }}><strong>Time Complexity:</strong> {algorithmStats.timeComplexity}</p>
              <p style={{ margin: '2px 0' }}><strong>Execution Time:</strong> {algorithmStats.executionTime}ms</p>
              <p style={{ margin: '2px 0' }}><strong>Overall Proximity:</strong> {algorithmStats.overallProximityStats}</p>
              <div style={{ margin: '5px 0' }}>
                <strong>Route Proximities:</strong>
                {Object.entries(algorithmStats.routeProximityStats).map(([deliveryId, stats]) => (
                  <p key={deliveryId} style={{ margin: '2px 0', paddingLeft: '10px', fontSize: '0.9em' }}>
                    Route {deliveryId}: {stats}
                  </p>
                ))}
              </div>
            </>
          )}

          {isAlgoStatsMinimized && (
            <div style={{ textAlign: 'center' }}>
              📊
            </div>
          )}
        </div>
      )}

      {showDriverCard && (
        <div
          style={{
            position: 'absolute',
            left: isDriverCardMinimized ? '20px' : '50px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: 1000,
            maxWidth: isDriverCardMinimized ? '60px' : '300px',
            maxHeight: isDriverCardMinimized ? '60px' : '80vh',
            overflow: 'auto',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
          }}
          onClick={() => isDriverCardMinimized && setIsDriverCardMinimized(false)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>Driver Details</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDriverCardMinimized(!isDriverCardMinimized);
              }}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '5px',
              }}
            >
              {isDriverCardMinimized ? '🔍' : '➖'}
            </button>
          </div>

          {!isDriverCardMinimized && (
            <div>
              <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                <p style={{ margin: '5px 0' }}><strong>Driver:</strong> {selectedDriverName}</p>
                <p style={{ margin: '5px 0' }}><strong>Contact:</strong> {deliveries.find(d => d.driverName === selectedDriverName)?.driverContact}</p>
              </div>

              <div>
                <p style={{ margin: '5px 0' }}><strong>Delivery Route:</strong></p>
                <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
                  {optimizedWaypoints.map((waypoint: any, index: number) => {
                    if (index === 0) return null;
                    const report = reports[waypoint.waypoint_index - 1];
                    return (
                      <li key={index} style={{ margin: '5px 0' }}>
                        {report?.description || 'Unknown location'}
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          )}

          {isDriverCardMinimized && (
            <div style={{ textAlign: 'center' }}>
              🚗
            </div>
          )}
        </div>
      )}

    </div>
  );
};

const RouteAnimation: React.FC<{ route: [number, number][] }> = ({ route }) => {
  const map = useMap();

  useEffect(() => {
    if (!route || route.length === 0) return;

    console.log("RouteAnimation started, route length:", route.length);

    const animationIcon = L.icon({
      iconUrl: carIconUrl || "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker(route[0], {
      icon: animationIcon,
      zIndexOffset: 1000
    }).addTo(map);

    let startTime: number | null = null;
    let index = 0;
    const segmentDuration = 200;

    const animateMarker = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }
      const elapsed = timestamp - startTime;
      if (elapsed >= segmentDuration) {
        index++;
        if (index >= route.length) {
          console.log("Animation complete");
          return;
        }
        marker.setLatLng(route[index]);
        console.log("Marker moved to:", route[index]);
        startTime = timestamp;
      }
      requestAnimationFrame(animateMarker);
    };

    requestAnimationFrame(animateMarker);

    return () => {
      console.log("Cleaning up marker");
      map.removeLayer(marker);
    };
  }, [map, route]);

  return null;
};

const reportIcon = L.icon({
  iconUrl: '/report-marker.png',
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25],
})

export default MapView;