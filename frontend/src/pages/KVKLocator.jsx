import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { Building2 } from 'lucide-react';
import { TText } from '../utils/translateText';
import ReactDOMServer from 'react-dom/server';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default Leaflet icon not showing
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Mock KVK Data - Focus on Bengaluru/Karnataka as requested
const KVK_DATA = [
    {
        "id": 1,
        "name": "Krishi Vigyan Kendra, Ramanagara",
        "district": "Ramanagara",
        "state": "Karnataka",
        "address": "Chandurayanghalli, Ramanagara, Karnataka",
        "lat": 12.7218,
        "lng": 77.2811
    },
    {
        "id": 2,
        "name": "Krishi Vigyan Kendra, Tumakuru",
        "district": "Tumakuru",
        "state": "Karnataka",
        "address": "Konehally, Tiptur, Tumakuru, Karnataka",
        "lat": 13.2589,
        "lng": 76.4786
    },
    {
        "id": 3,
        "name": "Krishi Vigyan Kendra, Bangalore Rural",
        "district": "Bangalore Rural",
        "state": "Karnataka",
        "address": "Hadonahalli Village, Bangalore Rural, Karnataka",
        "lat": 13.1500,
        "lng": 77.4000
    },
    {
        "id": 4,
        "name": "Krishi Vigyan Kendra, Bagalkot",
        "district": "Bagalkot",
        "state": "Karnataka",
        "address": "Agricultural Research Station, Bagalkot",
        "lat": 16.1867,
        "lng": 75.6961
    },
    {
        "id": 5,
        "name": "Krishi Vigyan Kendra, Dharwad",
        "district": "Dharwad",
        "state": "Karnataka",
        "address": "Saidapur Farm, Dharwad",
        "lat": 15.4589,
        "lng": 75.0078
    },
    {
        "id": 6,
        "name": "Krishi Vigyan Kendra, Koppal",
        "district": "Koppal",
        "state": "Karnataka",
        "address": "ARS Campus, Gangavati, Koppal",
        "lat": 15.4313,
        "lng": 76.5297
    },
    {
        "id": 7,
        "name": "Krishi Vigyan Kendra, Kalaburagi",
        "district": "Kalaburagi",
        "state": "Karnataka",
        "address": "Aland Road, Kalaburagi",
        "lat": 17.3297,
        "lng": 76.8343
    },
    {
        "id": 8,
        "name": "Krishi Vigyan Kendra, Vijayapura",
        "district": "Vijayapura",
        "state": "Karnataka",
        "address": "RARS Campus, Vijayapura",
        "lat": 16.8302,
        "lng": 75.7100
    },
    {
        "id": 9,
        "name": "Krishi Vigyan Kendra, Uttara Kannada",
        "district": "Uttara Kannada",
        "state": "Karnataka",
        "address": "Banavasi Road, Sirsi",
        "lat": 14.6191,
        "lng": 74.8355
    },
    {
        "id": 10,
        "name": "Krishi Vigyan Kendra, Mandya",
        "district": "Mandya",
        "state": "Karnataka",
        "address": "VC Farm, Mandya",
        "lat": 12.5239,
        "lng": 76.8950
    },
    {
        "id": 11,
        "name": "Krishi Vigyan Kendra, Shivamogga",
        "district": "Shivamogga",
        "state": "Karnataka",
        "address": "Navile, Shivamogga",
        "lat": 13.9299,
        "lng": 75.5681
    },
    {
        "id": 12,
        "name": "Krishi Vigyan Kendra, Udupi",
        "district": "Udupi",
        "state": "Karnataka",
        "address": "Brahmavar, Udupi",
        "lat": 13.4172,
        "lng": 74.7460
    },
    {
        "id": 13,
        "name": "Krishi Vigyan Kendra, Chitradurga",
        "district": "Chitradurga",
        "state": "Karnataka",
        "address": "Babbur Farm, Hiriyur",
        "lat": 13.9450,
        "lng": 76.6172
    },
    {
        "id": 14,
        "name": "Krishi Vigyan Kendra, Dakshina Kannada",
        "district": "Dakshina Kannada",
        "state": "Karnataka",
        "address": "Kankanady, Mangaluru",
        "lat": 12.9136,
        "lng": 74.8560
    },
    {
        "id": 15,
        "name": "Krishi Vigyan Kendra, Chamarajanagar",
        "district": "Chamarajanagar",
        "state": "Karnataka",
        "address": "Hardanahalli Seed Farm",
        "lat": 11.9261,
        "lng": 76.9500
    },
    {
        "id": 16,
        "name": "Krishi Vigyan Kendra, Davanagere",
        "district": "Davanagere",
        "state": "Karnataka",
        "address": "Anubhava Mantap, Davanagere",
        "lat": 14.4644,
        "lng": 75.9218
    },
    {
        "id": 17,
        "name": "Krishi Vigyan Kendra, Raichur",
        "district": "Raichur",
        "state": "Karnataka",
        "address": "KVK Campus, Raichur",
        "lat": 16.2076,
        "lng": 77.3463
    },
    {
        "id": 18,
        "name": "Krishi Vigyan Kendra, Ballari",
        "district": "Ballari",
        "state": "Karnataka",
        "address": "Hagari, Ballari",
        "lat": 15.1394,
        "lng": 76.9214
    },
    {
        "id": 19,
        "name": "Krishi Vigyan Kendra, Chikkaballapur",
        "district": "Chikkaballapur",
        "state": "Karnataka",
        "address": "Chintamani, Chikkaballapur",
        "lat": 13.3983,
        "lng": 78.0517
    },
    {
        "id": 20,
        "name": "Krishi Vigyan Kendra, Mysuru",
        "district": "Mysuru",
        "state": "Karnataka",
        "address": "Suttur, Nanjangud Taluk",
        "lat": 12.1191,
        "lng": 76.6820
    },
    {
        "id": 21,
        "name": "Krishi Vigyan Kendra, Belagavi (Gokak)",
        "district": "Belagavi",
        "state": "Karnataka",
        "address": "Tukkanatti, Gokak",
        "lat": 16.1700,
        "lng": 74.8230
    },
    {
        "id": 22,
        "name": "Krishi Vigyan Kendra, Hassan",
        "district": "Hassan",
        "state": "Karnataka",
        "address": "Kandali, Hassan",
        "lat": 13.0072,
        "lng": 76.0993
    },
    {
        "id": 23,
        "name": "Krishi Vigyan Kendra, Bidar",
        "district": "Bidar",
        "state": "Karnataka",
        "address": "KVK Campus, Bidar",
        "lat": 17.9133,
        "lng": 77.5301
    },
    {
        "id": 24,
        "name": "Krishi Vigyan Kendra, Chikkamagaluru",
        "district": "Chikkamagaluru",
        "state": "Karnataka",
        "address": "ARS Mudigere",
        "lat": 13.1363,
        "lng": 75.6419
    },
    {
        "id": 25,
        "name": "Krishi Vigyan Kendra, Gadag",
        "district": "Gadag",
        "state": "Karnataka",
        "address": "Hulkoti, Gadag",
        "lat": 15.4260,
        "lng": 75.6350
    },
    {
        "id": 26,
        "name": "Krishi Vigyan Kendra, Haveri",
        "district": "Haveri",
        "state": "Karnataka",
        "address": "Hanumanamatti, Ranebennur",
        "lat": 14.6190,
        "lng": 75.6240
    },
    {
        "id": 27,
        "name": "Krishi Vigyan Kendra, Kodagu",
        "district": "Kodagu",
        "state": "Karnataka",
        "address": "Gonikoppal, Kodagu",
        "lat": 12.1854,
        "lng": 75.9364
    },
    {
        "id": 28,
        "name": "Krishi Vigyan Kendra, Yadgir",
        "district": "Yadgir",
        "state": "Karnataka",
        "address": "Kawadimatti, Shorapur",
        "lat": 16.5210,
        "lng": 76.7600
    },
    {
        "id": 29,
        "name": "Krishi Vigyan Kendra, Kolar",
        "district": "Kolar",
        "state": "Karnataka",
        "address": "Tamaka Farm, Kolar",
        "lat": 13.1360,
        "lng": 78.1290
    }
];

// Component to handle map center updates
function RecenterMap({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], map.getZoom());
    }, [lat, lng, map]);
    return null;
}

const KVKLocator = () => {
    // Default to Bengaluru coordinates if geolocation fails initially
    const [position, setPosition] = useState({ lat: 12.9716, lng: 77.5946 });
    const [hasLocation, setHasLocation] = useState(false);
    const { user } = useUser();
    const { t } = useTranslation();

    // Custom Icon for User Location (Profile Image)
    const userIcon = L.divIcon({
        className: 'custom-user-icon',
        html: `<div style="
            width: 40px; 
            height: 40px; 
            border-radius: 50%; 
            border: 3px solid white; 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            overflow: hidden;
            background-color: #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <img src="${user?.imageUrl || 'https://github.com/shadcn.png'}" 
                 style="width: 100%; height: 100%; object-fit: cover;" 
                 alt="User Location" />
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
    });

    // Custom Icon for KVK (Institution Building)
    const kvkIconMarkup = ReactDOMServer.renderToString(
        <div style={{
            backgroundColor: '#16a34a', // green-600
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            width: '40px',
            height: '40px'
        }}>
            <Building2 size={20} color="white" strokeWidth={2.5} />
        </div>
    );

    const kvkIcon = L.divIcon({
        className: 'custom-kvk-icon',
        html: kvkIconMarkup,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
    });

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setPosition({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    });
                    setHasLocation(true);
                },
                (err) => {
                    console.error("Error getting location: ", err);
                    // Keep default Bengaluru location
                }
            );
        }
    }, []);

    return (
        <div className="flex flex-col h-full w-full">


            <div className="flex-grow w-full relative z-0">
                {/* Map takes remaining height. Z-index 0 to be below nav bars if needed */}
                <MapContainer
                    center={[position.lat, position.lng]}
                    zoom={10}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%', minHeight: '85vh' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* User's Location Marker */}
                    {hasLocation && (
                        <Marker position={[position.lat, position.lng]} icon={userIcon}>
                            <Popup>
                                <div className="text-center">
                                    <strong className="block text-sm">{t('kvk_you_here')}</strong>
                                    <span className="text-xs text-muted-foreground">{t('kvk_your_loc')}</span>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Recenter map when position changes */}
                    <RecenterMap lat={position.lat} lng={position.lng} />

                    {/* KVK Markers */}
                    {KVK_DATA.map((kvk) => (
                        <Marker key={kvk.id} position={[kvk.lat, kvk.lng]} icon={kvkIcon}>
                            <Popup>
                                <div className="space-y-1 min-w-[200px]">
                                    <div className="flex items-center gap-2 mb-2 border-b pb-2">
                                        <div className="bg-green-100 p-1.5 rounded-full">
                                            <Building2 size={16} className="text-green-700" />
                                        </div>
                                        <div>
                                            {/* Centre names, districts and addresses are place names, so they
                                                go through machine translation rather than a hand-written table. */}
                                            <h3 className="font-semibold text-sm leading-tight text-green-900"><TText text={kvk.name} /></h3>
                                            <p className="text-[10px] text-green-700 font-medium bg-green-50 inline-block px-1.5 py-0.5 rounded mt-0.5">
                                                <TText text={kvk.district} />
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-xs text-gray-600 pl-1">
                                        <p className="line-clamp-2 mb-2"><TText text={kvk.address} /></p>
                                    </div>

                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${kvk.lat},${kvk.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-1.5 w-full mt-3 text-xs font-medium bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors shadow-sm"
                                    >
                                        {t('kvk_directions')}
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default KVKLocator;
