export const MOCK_ROOMS = [
  {
    id: '1',
    title: 'Phòng trọ cao cấp nội thất gỗ',
    price: 3500000,
    address: 'Quận 7, TP. HCM',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
    isVerified: true,
    trustScore: 4.8,
    tags: ['Sinh viên', 'Yên tĩnh', 'An ninh'],
    lastUpdated: '2025-11-20T10:00:00Z', // > 7 months ago (needs update)
    scamWarning: false,
    aiEditedWarning: true,
  },
  {
    id: '2',
    title: 'Phòng ban công thoáng mát',
    price: 2800000,
    address: 'Quận Bình Thạnh, TP. HCM',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1de2d93688?auto=format&fit=crop&q=80&w=800',
    isVerified: true,
    trustScore: 4.9,
    tags: ['Gần ĐH', 'Giá rẻ', 'Tự do'],
    lastUpdated: '2026-05-15T10:00:00Z', // Recent
    scamWarning: false,
    aiEditedWarning: false,
  },
  {
    id: '3',
    title: 'Phòng trọ giá siêu rẻ trung tâm Q1',
    price: 1500000,
    address: 'Quận 1, TP. HCM',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
    isVerified: false,
    trustScore: 2.1,
    tags: ['Giá rẻ', 'Quận 1'],
    lastUpdated: '2026-06-01T10:00:00Z',
    scamWarning: true,
    aiEditedWarning: false,
  }
];

export const MOCK_TENANTS = [
  {
    id: 't1',
    name: 'Sinh viên ẩn danh 1',
    matchScore: 95,
    tags: ['Sinh viên', 'Yên tĩnh', 'Gần ĐH'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  },
  {
    id: 't2',
    name: 'Sinh viên ẩn danh 2',
    matchScore: 88,
    tags: ['Sinh viên', 'Giá rẻ', 'Tự do'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  },
  {
    id: 't3',
    name: 'Sinh viên ẩn danh 3',
    matchScore: 82,
    tags: ['Sinh viên', 'An ninh'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  }
];

export const MOCK_STATS = {
  views: 1248,
  saves: 342,
  contacts: 56,
};
