import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'Guest' | 'Tenant' | 'Landlord' | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  address: string;
  image: string;
  type: string;
  trustScore: number;
  landlordId: string;
  status: 'Available' | 'Rented';
  views: number;
  leads: number;
}

interface AppState {
  currentUser: User | null;
  listings: Listing[];
  login: (role: Role, email: string) => void;
  logout: () => void;
  addListing: (listing: Omit<Listing, 'id' | 'landlordId'>) => void;
  updateListing: (id: string, updates: Partial<Listing>) => void;
}

const mockListings: Listing[] = [
  {
    id: 'l1',
    title: 'Premium Modern Studio - District 3',
    price: 5500000,
    address: '123 Nguyen Dinh Chieu, D3',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80',
    type: 'Studio',
    trustScore: 98,
    landlordId: 'u2',
    status: 'Available',
    views: 1240,
    leads: 42
  },
  {
    id: 'l2',
    title: 'Cozy Room in Shared House - D7',
    price: 4200000,
    address: '45 Nguyen Van Linh, D7',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1de2d96674?auto=format&fit=crop&w=400&q=80',
    type: 'Private Room',
    trustScore: 85,
    landlordId: 'u2',
    status: 'Available',
    views: 842,
    leads: 28
  },
  {
    id: 'l3',
    title: 'Luxury 1BR Apartment - Thao Dien',
    price: 8500000,
    address: '12 Quoc Huong, D2',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80',
    type: 'Apartment',
    trustScore: 95,
    landlordId: 'u2',
    status: 'Rented',
    views: 2150,
    leads: 120
  },
  {
    id: 'l4',
    title: 'Affordable Dorm Bed - Go Vap',
    price: 1500000,
    address: '89 Phan Van Tri, Go Vap',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80',
    type: 'Shared Room',
    trustScore: 70,
    landlordId: 'u2',
    status: 'Available',
    views: 320,
    leads: 5
  }
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      listings: mockListings,
      login: (role, email) => set({
        currentUser: {
          id: role === 'Landlord' ? 'u2' : (role === 'Admin' ? 'u3' : 'u1'),
          name: role === 'Landlord' ? 'Le Van B' : (role === 'Admin' ? 'System Admin' : 'Alex Nguyen'),
          email,
          role,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
        }
      }),
      logout: () => set({ currentUser: null }),
      addListing: (listing) => set((state) => ({
        listings: [
          ...state.listings, 
          { 
            ...listing, 
            id: Math.random().toString(36).substr(2, 9),
            landlordId: state.currentUser?.id || 'u2'
          }
        ]
      })),
      updateListing: (id, updates) => set((state) => ({
        listings: state.listings.map(l => l.id === id ? { ...l, ...updates } : l)
      }))
    }),
    {
      name: 'dormi-storage'
    }
  )
);
