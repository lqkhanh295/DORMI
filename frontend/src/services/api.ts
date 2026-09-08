// API Service for connecting Frontend to .NET Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5167/api';

export interface RoomImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
}

export interface RoomResponse {
  id: string;
  landlordId: string;
  landlordName: string;
  landlordPhone?: string;
  title: string;
  description: string;
  price: number;
  area: number;
  utilities: string;
  roomType: string;
  address: string;
  virtual3DUrl?: string;
  status: number;
  createdAt: string;
  images: RoomImage[];
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('dormi_jwt_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('dormi_jwt_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('dormi_jwt_token');
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
  }

  return response.json();
}

// 1. AUTH API
export const authApi = {
  register: async (data: { email: string; password: string; fullName: string; role: number; phoneNumber?: string }) => {
    const res = await request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    setAuthToken(res.token);
    return res;
  },

  login: async (email: string, password: string) => {
    const res = await request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setAuthToken(res.token);
    return res;
  },

  getMe: async () => {
    return request<any>('/auth/me');
  },

  logout: () => {
    removeAuthToken();
  }
};

// 2. ROOMS API
export const roomsApi = {
  getRooms: async (params?: { query?: string; roomType?: string; minPrice?: number; maxPrice?: number; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);
    if (params?.roomType) searchParams.append('roomType', params.roomType);
    if (params?.minPrice) searchParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

    return request<any>(`/rooms?${searchParams.toString()}`);
  },

  getRoomById: async (id: string) => {
    return request<any>(`/rooms/${id}`);
  },

  createRoom: async (data: {
    title: string;
    description: string;
    price: number;
    area: number;
    utilities: string;
    roomType: string;
    address: string;
    latitude?: number;
    longitude?: number;
    virtual3DUrl?: string;
    imageUrls?: string[];
  }) => {
    return request<any>('/rooms', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateRoom: async (id: string, data: any) => {
    return request<any>(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteRoom: async (id: string) => {
    return request<any>(`/rooms/${id}`, {
      method: 'DELETE'
    });
  }
};

// 3. IMAGES / CLOUDINARY API
export const imagesApi = {
  uploadImage: async (file: File) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (!response.ok) throw new Error('Failed to upload image to Cloudinary');
    return response.json() as Promise<{ imageUrl: string }>;
  },

  uploadRoomImage: async (roomId: string, file: File, isPrimary: boolean = false) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/images/rooms/${roomId}?isPrimary=${isPrimary}`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (!response.ok) throw new Error('Failed to upload room image');
    return response.json();
  }
};

// 4. APPOINTMENTS API
export const appointmentsApi = {
  createAppointment: async (data: { roomId: string; appointmentDate: string; notes?: string }) => {
    return request<any>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getMyAppointments: async () => {
    return request<any[]>('/appointments');
  },

  updateStatus: async (id: string, status: string) => {
    return request<any>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};

// 5. FAVORITES API
export const favoritesApi = {
  getFavorites: async () => {
    return request<any[]>('/favorites');
  },

  addFavorite: async (roomId: string) => {
    return request<any>(`/favorites/${roomId}`, {
      method: 'POST'
    });
  },

  removeFavorite: async (roomId: string) => {
    return request<any>(`/favorites/${roomId}`, {
      method: 'DELETE'
    });
  }
};

// 6. MESSAGES API
export const messagesApi = {
  sendMessage: async (receiverId: string, content: string) => {
    return request<any>('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content })
    });
  },

  getHistory: async (otherUserId: string) => {
    return request<any[]>(`/messages/${otherUserId}`);
  },

  getConversations: async () => {
    return request<any[]>('/messages/conversations');
  }
};

// 7. PROFILES API
export const profilesApi = {
  getCustomerProfile: async () => {
    return request<any>('/profiles/customer');
  },

  updateCustomerProfile: async (data: { fullName?: string; phoneNumber?: string; preferences?: string; lifestyle?: string; isLookingForRoommate?: boolean }) => {
    return request<any>('/profiles/customer', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  getLandlordProfile: async () => {
    return request<any>('/profiles/landlord');
  },

  updateLandlordProfile: async (data: { fullName?: string; phoneNumber?: string }) => {
    return request<any>('/profiles/landlord', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
};

// 8. ROOMMATES API
export const roommatesApi = {
  getPosts: async (location?: string, maxBudget?: number, genderPreference?: string) => {
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (maxBudget) params.append('maxBudget', maxBudget.toString());
    if (genderPreference) params.append('genderPreference', genderPreference);

    return request<any[]>(`/roommates?${params.toString()}`);
  },

  createPost: async (data: {
    title: string;
    description: string;
    budget: number;
    location: string;
    moveInDate: string;
    genderPreference?: string;
    lifestyleTraits?: string;
  }) => {
    return request<any>('/roommates', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getRecommendations: async () => {
    return request<any[]>('/roommates/recommendations');
  }
};

// 9. REVIEWS API
export const reviewsApi = {
  getRoomReviews: async (roomId: string) => {
    return request<any>(`/rooms/${roomId}/reviews`);
  },

  addReview: async (roomId: string, rating: number, comment: string) => {
    return request<any>(`/rooms/${roomId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment })
    });
  }
};

// 10. ADMIN API
export const adminApi = {
  getStats: async () => {
    return request<any>('/admin/stats');
  },

  getUsers: async (role?: number) => {
    return request<any[]>(`/admin/users${role !== undefined ? `?role=${role}` : ''}`);
  },

  getPendingVerifications: async () => {
    return request<any[]>('/admin/verifications');
  },

  approveVerification: async (landlordId: string, approved: boolean) => {
    return request<any>(`/admin/verifications/${landlordId}`, {
      method: 'PATCH',
      body: JSON.stringify({ approved })
    });
  },

  getRoomsForModeration: async () => {
    return request<any[]>('/admin/rooms');
  },

  updateRoomStatus: async (roomId: string, status: number) => {
    return request<any>(`/admin/rooms/${roomId}/status?status=${status}`, {
      method: 'PATCH'
    });
  }
};

// 11. LANDLORD DASHBOARD API
export const landlordApi = {
  getAnalytics: async () => {
    return request<any>('/landlord/analytics');
  },

  getBilling: async () => {
    return request<any[]>('/landlord/billing');
  },

  checkout: async (planName: string) => {
    return request<any>('/landlord/checkout', {
      method: 'POST',
      body: JSON.stringify({ planName })
    });
  }
};
