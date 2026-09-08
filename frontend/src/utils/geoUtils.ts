// Geo utilities for Ho Chi Minh City and Distance Calculation

export interface GeoLocation {
  lat: number;
  lng: number;
}

// Known landmarks and street coordinates across Ho Chi Minh City
const STREET_COORDINATES: Record<string, [number, number]> = {
  // District 1
  'nguyễn huệ': [10.7743, 106.7032],
  'lê lợi': [10.7735, 106.7001],
  'bến thành': [10.7725, 106.6980],
  'đồng khởi': [10.7760, 106.7035],
  'pasteur': [10.7770, 106.6970],
  
  // District 3
  'hai bà trưng': [10.7876, 106.6914],
  'nam kỳ khởi nghĩa': [10.7905, 106.6850],
  'nguyễn đình chiểu': [10.7800, 106.6920],
  'võ văn tần': [10.7770, 106.6880],
  
  // District 4
  'bến vân đồn': [10.7634, 106.7018],
  'hoàng diệu': [10.7610, 106.7040],
  
  // District 7
  'phú mỹ hưng': [10.7296, 106.7218],
  'nguyễn lương bằng': [10.7296, 106.7218],
  'nguyễn văn linh': [10.7325, 106.7112],
  'huỳnh tấn phát': [10.7410, 106.7320],
  'rmit': [10.7300, 106.6950],
  
  // Thu Duc City
  'khu cnc': [10.8546, 106.7932],
  'fpt': [10.8546, 106.7932],
  'vinhomes grand park': [10.8443, 106.8375],
  'linh trung': [10.8700, 106.7782],
  'làng đh': [10.8700, 106.7782],
  'hiệp bình phước': [10.8402, 106.7180],
  'đường số 9': [10.8402, 106.7180],
  'võ văn ngân': [10.8510, 106.7650],
  
  // Binh Thanh
  'điện biên phủ': [10.7995, 106.7125],
  'hàng xanh': [10.8010, 106.7110],
  'xô viết nghệ tĩnh': [10.8035, 106.7130],
  'nơ trang long': [10.8120, 106.6980],
  
  // Go Vap
  'quang trung': [10.8290, 106.6712],
  'nguyễn oanh': [10.8410, 106.6780],
  'phan văn trị': [10.8250, 106.6850],
  
  // Tan Binh
  'cộng hòa': [10.8015, 106.6540],
  'hoàng hoa thám': [10.8000, 106.6480],
  'k300': [10.7980, 106.6510],
  'sân bay': [10.8160, 106.6620],
  
  // Tan Phu
  'celadon': [10.8050, 106.6180],
  'lũy bán bích': [10.7720, 106.6340],
  
  // District 10
  '3 tháng 2': [10.7710, 106.6680],
  'sư vạn hạnh': [10.7740, 106.6670]
};

const DISTRICT_CENTERS: Record<string, [number, number]> = {
  'quận 1': [10.7769, 106.7009],
  'q.1': [10.7769, 106.7009],
  'quận 3': [10.7844, 106.6844],
  'q.3': [10.7844, 106.6844],
  'quận 4': [10.7634, 106.7018],
  'q.4': [10.7634, 106.7018],
  'quận 5': [10.7550, 106.6670],
  'q.5': [10.7550, 106.6670],
  'quận 7': [10.7340, 106.7218],
  'q.7': [10.7340, 106.7218],
  'quận 10': [10.7716, 106.6672],
  'q.10': [10.7716, 106.6672],
  'thủ đức': [10.8494, 106.7716],
  'tp.thủ đức': [10.8494, 106.7716],
  'bình thạnh': [10.8035, 106.7095],
  'gò vấp': [10.8388, 106.6663],
  'tân bình': [10.8015, 106.6540],
  'tân phú': [10.7925, 106.6282],
  'phú nhuận': [10.7990, 106.6800],
  'bình tân': [10.7650, 106.6050]
};

// Simple string hash for deterministic small jitter
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Resolves address text to accurate GPS coordinates in TP.HCM.
 */
export function getCoordinatesForAddress(address: string, id?: string): [number, number] {
  if (!address) return [10.7769, 106.7009];
  const lower = address.toLowerCase();

  // 1. Match specific street / landmark
  for (const [street, coords] of Object.entries(STREET_COORDINATES)) {
    if (lower.includes(street)) {
      // Deterministic small jitter so multiple rooms on the same street don't stack completely
      const h = id ? hashString(id) : hashString(address);
      const jitterLat = ((h % 20) - 10) * 0.0003;
      const jitterLng = (((h >> 4) % 20) - 10) * 0.0003;
      return [coords[0] + jitterLat, coords[1] + jitterLng];
    }
  }

  // 2. Match district
  for (const [district, coords] of Object.entries(DISTRICT_CENTERS)) {
    if (lower.includes(district)) {
      const h = id ? hashString(id) : hashString(address);
      const jitterLat = ((h % 40) - 20) * 0.0005;
      const jitterLng = (((h >> 4) % 40) - 20) * 0.0005;
      return [coords[0] + jitterLat, coords[1] + jitterLng];
    }
  }

  // 3. Fallback: HCMC Center (District 1)
  const h = id ? hashString(id) : hashString(address);
  const jitterLat = ((h % 50) - 25) * 0.0008;
  const jitterLng = (((h >> 5) % 50) - 25) * 0.0008;
  return [10.7769 + jitterLat, 106.7009 + jitterLng];
}

/**
 * Haversine formula to compute great-circle distance between two points in km.
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Format distance nicely (e.g. 800 m or 2.4 km).
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}
