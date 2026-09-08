import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { type Listing } from '../../store/useStore';
import { getCoordinatesForAddress, calculateDistanceKm, formatDistance, type GeoLocation } from '../../utils/geoUtils';
import { Navigation, Crosshair, ZoomIn, ZoomOut, Compass } from 'lucide-react';

interface RoomMapViewProps {
  rooms: Listing[];
  selectedRoomId?: string | null;
  onSelectRoom?: (roomId: string) => void;
  className?: string;
}

export default function RoomMapView({ rooms, selectedRoomId, onSelectRoom, className = '' }: RoomMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Format price into short form (e.g. 4.2 tr, 850k)
  const formatShortPrice = (price: number) => {
    if (price >= 1000000) {
      const millions = price / 1000000;
      return `${millions % 1 === 0 ? millions : millions.toFixed(1)} tr`;
    }
    return `${Math.round(price / 1000)}k`;
  };

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    // Default center: Ho Chi Minh City (District 1)
    const map = L.map(mapContainerRef.current, {
      center: [10.7769, 106.7009],
      zoom: 13,
      zoomControl: false, // We'll render modern custom controls
      attributionControl: false
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Invalidate size after mount in case parent container resized
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Request User Location (HTML5 Geolocation)
  const locateUser = () => {
    if (!navigator.geolocation) {
      setGeoError('Trình duyệt không hỗ trợ định vị GPS.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([loc.lat, loc.lng], 14, { duration: 1.2 });
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err.message);
        // Fallback location: District 1, HCMC
        const defaultLoc = { lat: 10.7769, lng: 106.7009 };
        setUserLocation(defaultLoc);
        setGeoError('Đang hiển thị vị trí mặc định (Quận 1, TP.HCM). Vui lòng cấp quyền truy cập vị trí trên trình duyệt.');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  };

  useEffect(() => {
    locateUser();
  }, []);

  // 3. Render / Update User Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(37, 99, 235, 0.25); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 16px; height: 16px; border-radius: 50%; background: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 2px 8px rgba(0,0,0,0.3); z-index: 10;"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: inherit; padding: 2px 4px; text-align: center;">
            <p style="font-weight: 700; color: #0F172A; font-size: 13px; margin: 0 0 2px 0;">📍 Vị trí của bạn</p>
            <p style="font-size: 11px; color: #64748B; margin: 0;">Đang định vị tại đây</p>
          </div>
        `);
      userMarkerRef.current = marker;
    }
  }, [userLocation]);

  // 4. Render / Update Room Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const bounds = L.latLngBounds([]);

    rooms.forEach((room) => {
      const coords = getCoordinatesForAddress(room.address, room.id);
      bounds.extend(coords);

      const isSelected = selectedRoomId === room.id;
      const distance = userLocation 
        ? calculateDistanceKm(userLocation.lat, userLocation.lng, coords[0], coords[1]) 
        : null;

      // Airbnb-style price pill marker
      const priceText = formatShortPrice(room.price);
      const markerHtml = `
        <div 
          class="room-pill-marker ${isSelected ? 'selected' : ''}" 
          style="
            background: ${isSelected ? '#00153D' : '#FFFFFF'};
            color: ${isSelected ? '#FFFFFF' : '#00153D'};
            border: 2px solid ${isSelected ? '#00153D' : '#CBD5E1'};
            padding: 3px 9px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 12px;
            box-shadow: 0 3px 8px rgba(0,21,61,0.22);
            white-space: nowrap;
            cursor: pointer;
            transition: all 0.2s ease;
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
            display: inline-flex;
            align-items: center;
            gap: 3px;
          "
        >
          <span>${priceText}</span>
        </div>
      `;

      const roomIcon = L.divIcon({
        className: 'custom-room-marker',
        html: markerHtml,
        iconSize: [60, 26],
        iconAnchor: [30, 13]
      });

      const marker = L.marker(coords, { icon: roomIcon });

      // Popup Content Card
      const popupHtml = `
        <div style="font-family: inherit; width: 220px; overflow: hidden; border-radius: 12px;">
          <div style="width: 100%; height: 120px; overflow: hidden; position: relative; border-radius: 8px 8px 0 0; background: #EEF2F6;">
            <img src="${room.image}" alt="${room.title}" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; top: 6px; left: 6px; background: rgba(0,21,61,0.85); color: #fff; padding: 2px 7px; border-radius: 6px; font-size: 10px; font-weight: 700;">
              ${room.type || 'Phòng trọ'}
            </div>
          </div>
          <div style="padding: 10px;">
            <p style="font-weight: 700; color: #00153D; font-size: 15px; margin: 0 0 4px 0;">
              ${Number(room.price).toLocaleString('vi-VN')} ₫/tháng
            </p>
            <h4 style="font-weight: 600; color: #0F172A; font-size: 12px; margin: 0 0 4px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3;">
              ${room.title}
            </h4>
            <p style="font-size: 11px; color: #64748B; margin: 0 0 6px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              📍 ${room.address}
            </p>
            ${distance !== null ? `
              <p style="font-size: 11px; font-weight: 700; color: #16803C; margin: 0 0 8px 0; display: flex; align-items: center; gap: 3px;">
                🛵 Cách bạn: ${formatDistance(distance)}
              </p>
            ` : ''}
            <button 
              id="view-room-btn-${room.id}"
              style="width: 100%; background: #00153D; color: #fff; border: none; padding: 6px 0; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer;"
            >
              Xem chi tiết phòng
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 240, minWidth: 220, className: 'dormi-room-popup' });

      marker.on('click', () => {
        if (onSelectRoom) onSelectRoom(room.id);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-room-btn-${room.id}`);
        if (btn) {
          btn.onclick = () => {
            navigate(`/room/${room.id}`);
          };
        }
      });

      markersLayer.addLayer(marker);
    });

    // If rooms exist and no specific room is selected, fit all rooms on map
    if (rooms.length > 0 && !selectedRoomId && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [rooms, selectedRoomId, userLocation, navigate, onSelectRoom]);

  // 5. Center map on selected room if changed
  useEffect(() => {
    if (!selectedRoomId || !mapInstanceRef.current) return;
    const targetRoom = rooms.find(r => r.id === selectedRoomId);
    if (targetRoom) {
      const coords = getCoordinatesForAddress(targetRoom.address, targetRoom.id);
      mapInstanceRef.current.flyTo(coords, 15, { duration: 0.8 });
    }
  }, [selectedRoomId, rooms]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleFitAll = () => {
    if (!mapInstanceRef.current || rooms.length === 0) return;
    const bounds = L.latLngBounds([]);
    rooms.forEach(r => bounds.extend(getCoordinatesForAddress(r.address, r.id)));
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#EEF2F6] ${className}`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Banner Status (GPS Notification) */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-sm pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-clay-soft border border-[#E2E8F0] flex items-center gap-2.5 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <p className="text-caption font-semibold text-[#0F172A]">
            Bản đồ phòng trọ thực tế ({rooms.length} phòng)
          </p>
        </div>

        {geoError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl text-[11px] shadow-sm pointer-events-auto">
            {geoError}
          </div>
        )}
      </div>

      {/* Floating Interactive Controls (Right Side) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* Locate User Button */}
        <button
          onClick={locateUser}
          disabled={isLocating}
          title="Định vị vị trí của tôi"
          className="w-10 h-10 bg-white hover:bg-[#F5F7FA] text-[#00153D] rounded-xl shadow-clay-soft border border-[#E2E8F0] flex items-center justify-center transition-all touch-target active:scale-95"
        >
          <Crosshair className={`w-5 h-5 ${isLocating ? 'animate-spin text-blue-600' : 'text-[#00153D]'}`} />
        </button>

        {/* Fit All Rooms Button */}
        <button
          onClick={handleFitAll}
          title="Xem tất cả phòng trên bản đồ"
          className="w-10 h-10 bg-white hover:bg-[#F5F7FA] text-[#00153D] rounded-xl shadow-clay-soft border border-[#E2E8F0] flex items-center justify-center transition-all touch-target active:scale-95"
        >
          <Compass className="w-5 h-5 text-[#00153D]" />
        </button>

        {/* Zoom In / Out */}
        <div className="flex flex-col bg-white rounded-xl shadow-clay-soft border border-[#E2E8F0] overflow-hidden mt-2">
          <button
            onClick={handleZoomIn}
            title="Phóng to"
            className="w-10 h-9 hover:bg-[#F5F7FA] flex items-center justify-center border-b border-[#E2E8F0] text-[#0F172A] transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Thu nhỏ"
            className="w-10 h-9 hover:bg-[#F5F7FA] flex items-center justify-center text-[#0F172A] transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Hint Badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full shadow-clay-soft border border-[#E2E8F0] text-caption font-semibold text-[#64748B] flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-blue-600" />
          <span>Bấm vào mốc giá để xem chi tiết phòng & khoảng cách</span>
        </div>
      </div>
    </div>
  );
}
