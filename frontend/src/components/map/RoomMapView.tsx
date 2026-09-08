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
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
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
    if (mapInstanceRef.current) return;

    // Default center: Ho Chi Minh City (District 1)
    const map = L.map(mapContainerRef.current, {
      center: [10.7769, 106.7009],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    // Google Maps Roadmap tiles (Fast, crisp, 100% Vietnamese labels & streets)
    L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: '© Google Maps'
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Ensure map tiles are properly painted across resizes
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    // Delegated click handler to intercept any /room/ navigation from popup
    const container = mapContainerRef.current;
    const handlePopupClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="/room/"]');
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        const href = link.getAttribute('href');
        if (href) {
          navigate(href);
        }
      }
    };
    container?.addEventListener('click', handlePopupClick);

    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      container?.removeEventListener('click', handlePopupClick);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [navigate]);

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
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(37, 99, 235, 0.3); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 16px; height: 16px; border-radius: 50%; background: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 2px 8px rgba(0,0,0,0.35); z-index: 10;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: inherit; padding: 6px 8px; text-align: center;">
            <p style="font-weight: 700; color: #0F172A; font-size: 13px; margin: 0 0 2px 0;">📍 Vị trí của bạn</p>
            <p style="font-size: 11px; color: #64748B; margin: 0;">Đang định vị tại đây</p>
          </div>
        `, { closeButton: false });
      userMarkerRef.current = marker;
    }
  }, [userLocation]);

  // 4. Render Room Markers (Only re-renders when rooms list or userLocation changes)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    markersMapRef.current.clear();

    const bounds = L.latLngBounds([]);

    rooms.forEach((room) => {
      const coords = getCoordinatesForAddress(room.address, room.id);
      bounds.extend(coords);

      const distance = userLocation 
        ? calculateDistanceKm(userLocation.lat, userLocation.lng, coords[0], coords[1]) 
        : null;

      // Modern Airbnb-style price pill marker
      const priceText = formatShortPrice(room.price);
      const markerHtml = `
        <div 
          id="marker-pill-${room.id}"
          class="room-pill-marker" 
          style="
            background: #FFFFFF;
            color: #00153D;
            border: 2px solid #CBD5E1;
            padding: 3px 10px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 12px;
            box-shadow: 0 3px 10px rgba(0,21,61,0.25);
            white-space: nowrap;
            cursor: pointer;
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s, color 0.2s;
            display: inline-flex;
            align-items: center;
            user-select: none;
          "
        >
          <span>${priceText}</span>
        </div>
      `;

      const roomIcon = L.divIcon({
        className: 'custom-room-marker',
        html: markerHtml,
        iconSize: [64, 28],
        iconAnchor: [32, 14]
      });

      const marker = L.marker(coords, { icon: roomIcon });

      // Popup Content Card
      const popupHtml = `
        <div style="font-family: inherit; width: 240px; overflow: hidden; border-radius: 14px; background: #fff;">
          <a href="/room/${room.id}" style="display: block; width: 100%; height: 130px; overflow: hidden; position: relative; background: #EEF2F6; text-decoration: none;">
            <img src="${room.image}" alt="${room.title}" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; top: 8px; left: 8px; background: rgba(0,21,61,0.85); backdrop-filter: blur(4px); color: #fff; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700;">
              ${room.type || 'Phòng trọ'}
            </div>
          </a>
          <div style="padding: 12px;">
            <div style="font-weight: 800; color: #00153D; font-size: 16px; margin-bottom: 4px;">
              ${Number(room.price).toLocaleString('vi-VN')} ₫/tháng
            </div>
            <a href="/room/${room.id}" style="text-decoration: none; display: block; margin-bottom: 6px;">
              <h4 style="font-weight: 600; color: #0F172A; font-size: 13px; margin: 0; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${room.title}
              </h4>
            </a>
            <p style="font-size: 11px; color: #64748B; margin: 0 0 6px 0; display: flex; align-items: center; gap: 3px;">
              <span>📍</span>
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${room.address}</span>
            </p>
            ${distance !== null ? `
              <div style="font-size: 11px; font-weight: 700; color: #16803C; margin-bottom: 10px; display: flex; align-items: center; gap: 4px;">
                <span>🛵</span>
                <span>Cách bạn: ${formatDistance(distance)}</span>
              </div>
            ` : '<div style="margin-bottom: 10px;"></div>'}
            <a 
              href="/room/${room.id}"
              style="display: block; width: 100%; text-align: center; text-decoration: none; box-sizing: border-box; background: #00153D; color: #FFFFFF; padding: 9px 0; border-radius: 10px; font-weight: 700; font-size: 12px; cursor: pointer; box-shadow: 0 2px 6px rgba(0,21,61,0.25);"
            >
              Xem chi tiết phòng
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { 
        maxWidth: 260, 
        minWidth: 240, 
        className: 'dormi-custom-popup',
        autoPanPadding: [20, 20]
      });

      // Handle marker click: open popup immediately and notify parent
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        marker.openPopup();
        if (onSelectRoom) {
          onSelectRoom(room.id);
        }
      });

      markersLayer.addLayer(marker);
      markersMapRef.current.set(room.id, marker);
    });

    // Fit map bounds if rooms exist
    if (rooms.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [rooms, userLocation, navigate, onSelectRoom]);

  // 5. When selectedRoomId changes: highlight marker & open popup
  useEffect(() => {
    if (!selectedRoomId || !mapInstanceRef.current) return;

    // Update styling on all markers
    markersMapRef.current.forEach((_, id) => {
      const el = document.getElementById(`marker-pill-${id}`);
      if (el) {
        if (id === selectedRoomId) {
          el.style.background = '#00153D';
          el.style.color = '#FFFFFF';
          el.style.borderColor = '#00153D';
          el.style.transform = 'scale(1.2)';
          el.style.zIndex = '999';
        } else {
          el.style.background = '#FFFFFF';
          el.style.color = '#00153D';
          el.style.borderColor = '#CBD5E1';
          el.style.transform = 'scale(1)';
          el.style.zIndex = '1';
        }
      }
    });

    // Fly to target room and open popup
    const targetMarker = markersMapRef.current.get(selectedRoomId);
    if (targetMarker) {
      mapInstanceRef.current.flyTo(targetMarker.getLatLng(), 15, { duration: 0.6 });
      setTimeout(() => {
        targetMarker.openPopup();
      }, 350);
    }
  }, [selectedRoomId]);

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
      {/* Embedded CSS for custom popup styling */}
      <style>{`
        .dormi-custom-popup .leaflet-popup-content-wrapper {
          padding: 0 !important;
          border-radius: 14px !important;
          overflow: hidden !important;
          box-shadow: 0 12px 32px rgba(0, 21, 61, 0.22) !important;
          border: 1px solid #E2E8F0 !important;
        }
        .dormi-custom-popup .leaflet-popup-content {
          margin: 0 !important;
          line-height: normal !important;
        }
        .dormi-custom-popup .leaflet-popup-tip {
          background: #FFFFFF !important;
        }
        .custom-room-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>

      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-0" 
        style={{ width: '100%', height: '100%', minHeight: '400px' }} 
      />

      {/* Top Banner Status (GPS Notification) */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-sm pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-clay-soft border border-[#E2E8F0] flex items-center gap-2.5 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <p className="text-caption font-semibold text-[#0F172A]">
            Bản đồ phòng trọ ({rooms.length} phòng)
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
