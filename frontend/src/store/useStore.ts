import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  role: 'GUEST' | 'CUSTOMER' | 'LANDLORD' | 'ADMIN';
  avatar: string;
}

interface AppState {
  user: User | null;
  savedRooms: number[];
  setUser: (user: User | null) => void;
  toggleSaveRoom: (roomId: number) => void;
}

export const useStore = create<AppState>((set) => ({
  user: { id: '1', name: 'John Doe', role: 'CUSTOMER', avatar: '' }, // Mock logged in
  savedRooms: [],
  
  setUser: (user) => set({ user }),
  
  toggleSaveRoom: (roomId) => set((state) => {
    const isSaved = state.savedRooms.includes(roomId);
    if (isSaved) {
      return { savedRooms: state.savedRooms.filter(id => id !== roomId) };
    } else {
      return { savedRooms: [...state.savedRooms, roomId] };
    }
  }),
}));
