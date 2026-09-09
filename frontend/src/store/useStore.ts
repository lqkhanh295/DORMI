import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, roomsApi, messagesApi, imagesApi } from '../services/api';

export type Role = 'Guest' | 'Tenant' | 'Landlord' | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  token?: string;
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  address: string;
  image: string;
  type: string;
  landlordId: string;
  status: 'Available' | 'Rented' | 'PendingApproval' | 'Hidden';
  isVerifiedLandlord?: boolean;
  trustScore?: number;
  views?: number;
  leads?: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
}

export interface RoommateProfile {
  id: number;
  customerId?: string;
  name: string;
  age: number;
  major: string;
  image: string;
  matchScore?: number | null;
  budget: string;
  bio: string;
  tags: string[];
}

interface AppState {
  currentUser: User | null;
  listings: Listing[];
  messages: Message[];
  likedRoommates: RoommateProfile[];
  isLoadingApi: boolean;
  loginWithApi: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  fetchListings: () => Promise<void>;
  addListing: (listing: Omit<Listing, 'id' | 'landlordId'>) => void;
  createListingWithApi: (data: any) => Promise<boolean>;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  sendMessage: (receiverId: string, text: string) => void;
  sendMessageWithApi: (receiverId: string, text: string) => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
  addLikedRoommate: (profile: RoommateProfile) => void;
  uploadImageToCloudinary: (file: File) => Promise<string | null>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      listings: [],
      messages: [],
      likedRoommates: [],
      isLoadingApi: false,

      loginWithApi: async (email, password) => {
        try {
          set({ isLoadingApi: true });
          const res = await authApi.login(email, password);
          const roleMap: Record<number, Role> = { 0: 'Tenant', 1: 'Landlord', 2: 'Admin' };
          set({
            currentUser: {
              id: res.user.id,
              name: res.user.fullName,
              email: res.user.email,
              role: roleMap[res.user.role] || 'Tenant',
              avatar: res.user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
              token: res.token
            },
            isLoadingApi: false
          });
          return true;
        } catch (err) {
          set({ isLoadingApi: false });
          console.error('API Login failed:', err);
          return false;
        }
      },

      logout: () => {
        authApi.logout();
        set({ currentUser: null });
      },

      fetchListings: async () => {
        try {
          const res = await roomsApi.getRooms({ pageSize: 50 });
          if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
            const statusMap: Record<number, 'Available' | 'Rented' | 'PendingApproval' | 'Hidden'> = {
              0: 'Available',
              1: 'Rented',
              2: 'PendingApproval',
              3: 'Hidden'
            };
            const apiListings: Listing[] = res.data.map((r: any) => ({
              id: r.id,
              title: r.title,
              price: Number(r.price),
              address: r.address,
              image: r.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80',
              type: r.roomType || 'Studio',
              landlordId: r.landlordId,
              status: statusMap[r.status] || 'Available',
              isVerifiedLandlord: r.isVerifiedLandlord ?? false
            }));
            set({ listings: apiListings });
          }
        } catch (err) {
          console.warn('API fetchListings failed, using local listings:', err);
        }
      },

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

      createListingWithApi: async (data) => {
        try {
          await roomsApi.createRoom(data);
          get().fetchListings();
          return true;
        } catch (err) {
          console.error('API createRoom failed:', err);
          return false;
        }
      },

      updateListing: (id, updates) => set((state) => ({
        listings: state.listings.map(l => l.id === id ? { ...l, ...updates } : l)
      })),

      sendMessage: (receiverId, text) => set((state) => {
        if (!state.currentUser) return state;
        const newMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          senderId: state.currentUser.id,
          receiverId,
          text,
          timestamp: new Date().toISOString()
        };
        return { messages: [...state.messages, newMessage] };
      }),

      sendMessageWithApi: async (receiverId, text) => {
        try {
          await messagesApi.sendMessage(receiverId, text);
          get().sendMessage(receiverId, text);
          return true;
        } catch (err) {
          console.error('API sendMessage failed:', err);
          return false;
        }
      },

      updateUser: (updates) => set((state) => ({
        currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null
      })),

      addLikedRoommate: (profile) => set((state) => ({
        likedRoommates: state.likedRoommates.find(r => r.id === profile.id) 
          ? state.likedRoommates 
          : [...state.likedRoommates, profile]
      })),

      uploadImageToCloudinary: async (file) => {
        try {
          const res = await imagesApi.uploadImage(file);
          return res.imageUrl;
        } catch (err) {
          console.error('Cloudinary Upload failed:', err);
          return null;
        }
      }
    }),
    {
      name: 'dormi-storage'
    }
  )
);
