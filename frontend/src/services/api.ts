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
  isVerifiedLandlord?: boolean;
  isBoosted?: boolean;
  boostType?: string;
  boostExpiresAt?: string;
  isPropertyVerified?: boolean;
  propertyVerifiedAt?: string;
  createdAt: string;
  images: RoomImage[];
}

export const RoomStatus = {
  Available: 0,
  Rented: 1,
  PendingApproval: 2,
  Hidden: 3
} as const;
export type RoomStatus = typeof RoomStatus[keyof typeof RoomStatus];

export const getAuthToken = (): string | null => {
  const directToken = localStorage.getItem('dormi_jwt_token');
  if (directToken) return directToken;
  try {
    const store = localStorage.getItem('dormi-storage-v5') || localStorage.getItem('dormi-storage');
    if (store) {
      const parsed = JSON.parse(store);
      if (parsed?.state?.currentUser?.token) {
        return parsed.state.currentUser.token;
      }
    }
  } catch {}
  return null;
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('dormi_jwt_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('dormi_jwt_token');
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  let userEmail = '';
  try {
    const store = localStorage.getItem('dormi-storage-v5') || localStorage.getItem('dormi-storage');
    if (store) {
      const parsed = JSON.parse(store);
      userEmail = parsed?.state?.currentUser?.email || '';
    }
  } catch {}

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(userEmail ? { 'X-User-Email': userEmail } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'API request failed' }));
    const error: any = new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    error.data = errorData;
    error.status = response.status;
    throw error;
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

  login: async (email: string, password: string, captchaToken?: string, captchaAnswer?: string) => {
    const res = await request<{
      token?: string;
      user?: any;
      requiresMfa?: boolean;
      mfaSessionToken?: string;
      requiresCaptcha?: boolean;
      captchaToken?: string;
      captchaQuestion?: string;
      remainingAttempts?: number;
      lockoutSeconds?: number;
      message?: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, captchaToken, captchaAnswer })
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  verifyMfa: async (data: { email: string; mfaSessionToken: string; otpCode: string }) => {
    const res = await request<{ token: string; user: any }>('/auth/verify-mfa', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  getCaptcha: async () => {
    return request<{ captchaToken: string; question: string }>('/auth/captcha');
  },

  getMe: async () => {
    return request<any>('/auth/me');
  },

  forgotPassword: async (email: string) => {
    return request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  verifyOtp: async (data: { email: string; otp: string }) => {
    return request<{ resetToken: string; message: string }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  resetPassword: async (data: { email?: string; token?: string; resetToken?: string; newPassword: string }) => {
    return request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    return request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  logout: () => {
    removeAuthToken();
  }
};

// 2. ROOMS API
export const roomsApi = {
  getRooms: async (params?: { 
    query?: string; 
    roomType?: string; 
    district?: string;
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    minPrice?: number; 
    maxPrice?: number; 
    sortBy?: string;
    page?: number; 
    pageSize?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);
    if (params?.roomType) searchParams.append('roomType', params.roomType);
    if (params?.district) searchParams.append('district', params.district);
    if (params?.latitude !== undefined) searchParams.append('latitude', params.latitude.toString());
    if (params?.longitude !== undefined) searchParams.append('longitude', params.longitude.toString());
    if (params?.radiusKm !== undefined) searchParams.append('radiusKm', params.radiusKm.toString());
    if (params?.minPrice !== undefined) searchParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
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
  },

  reportRoom: async (roomId: string, data: { reason: string; details?: string }) => {
    return request<any>(`/rooms/${roomId}/report`, {
      method: 'POST',
      body: JSON.stringify(data)
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to upload image to Cloudinary');
    }
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to upload room image');
    }
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

  updateStatus: async (id: string, status: string, reason?: string) => {
    return request<any>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason })
    });
  },

  rescheduleAppointment: async (id: string, newAppointmentDate: string, reason?: string) => {
    return request<any>(`/appointments/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ newAppointmentDate, reason })
    });
  }
};

// 4.1 APPLICATIONS API (Transaction Spine)
export interface ApplicationDocument {
  id?: string;
  documentType: string;
  fileUrl: string;
}

export interface RentalApplicationResponse {
  id: string;
  roomId: string;
  roomTitle: string;
  roomAddress: string;
  roomPrice: number;
  roomImageUrl?: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone?: string;
  tenantAvatar?: string;
  isTenantVerified: boolean;
  landlordId: string;
  landlordName: string;
  status: number;
  statusText: string;
  monthlyIncome: number;
  occupation: string;
  employerName?: string;
  occupantsCount: number;
  desiredMoveInDate: string;
  leaseDurationMonths: number;
  noteToLandlord?: string;
  rejectionReason?: string;
  landlordNotes?: string;
  createdAt: string;
  reviewedAt?: string;
  documents: ApplicationDocument[];
}

export const ApplicationStatus = {
  Draft: 0,
  Submitted: 1,
  UnderReview: 2,
  MoreInfoRequested: 3,
  Approved: 4,
  Rejected: 5,
  Withdrawn: 6,
  Expired: 7
} as const;

export const applicationsApi = {
  createApplication: async (data: {
    roomId: string;
    monthlyIncome: number;
    occupation: string;
    employerName?: string;
    occupantsCount: number;
    desiredMoveInDate: string;
    leaseDurationMonths: number;
    noteToLandlord?: string;
    documents?: { documentType: string; fileUrl: string }[];
  }) => {
    return request<RentalApplicationResponse>('/applications', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getMyApplications: async () => {
    return request<RentalApplicationResponse[]>('/applications/my');
  },

  getLandlordApplications: async (status?: number) => {
    const query = status !== undefined ? `?status=${status}` : '';
    return request<RentalApplicationResponse[]>(`/applications/landlord${query}`);
  },

  getApplicationById: async (id: string) => {
    return request<RentalApplicationResponse>(`/applications/${id}`);
  },

  reviewApplication: async (id: string, status: number, reason?: string, landlordNotes?: string) => {
    return request<any>(`/applications/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason, landlordNotes })
    });
  },

  withdrawApplication: async (id: string) => {
    return request<any>(`/applications/${id}/withdraw`, {
      method: 'POST'
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

export interface RoommatePostResponse {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  title: string;
  description: string;
  budget: number;
  location: string;
  moveInDate: string;
  genderPreference: string;
  lifestyleTraits: string;
  isActive: boolean;
  matchScore?: number;
  createdAt: string;
  roomId?: string;
  roomTitle?: string;
  roomAddress?: string;
  roomPrice?: number;
  roomImageUrl?: string;
}

// 8. ROOMMATES API
export const roommatesApi = {
  getPosts: async (location?: string, maxBudget?: number, genderPreference?: string) => {
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (maxBudget) params.append('maxBudget', maxBudget.toString());
    if (genderPreference) params.append('genderPreference', genderPreference);

    return request<RoommatePostResponse[]>(`/roommates?${params.toString()}`);
  },

  getPostById: async (id: string) => {
    return request<RoommatePostResponse>(`/roommates/${id}`);
  },

  createPost: async (data: {
    title: string;
    description: string;
    budget: number;
    location: string;
    moveInDate: string;
    genderPreference?: string;
    lifestyleTraits?: string;
    roomId?: string;
  }) => {
    return request<any>('/roommates', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getRecommendations: async () => {
    return request<RoommatePostResponse[]>('/roommates/recommendations');
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

  approveVerification: async (requestId: string, approved: boolean, rejectReason?: string) => {
    return request<any>(`/admin/verifications/${requestId}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ approved, rejectReason })
    });
  },

  getRoomsForModeration: async () => {
    return request<any[]>('/admin/rooms');
  },

  updateRoomStatus: async (roomId: string, status: number) => {
    return request<any>(`/admin/rooms/${roomId}/status?status=${status}`, {
      method: 'PATCH'
    });
  },

  getReports: async () => {
    return request<any[]>('/admin/reports');
  },

  updateReportStatus: async (reportId: string, status: string) => {
    return request<any>(`/admin/reports/${reportId}/status?status=${encodeURIComponent(status)}`, {
      method: 'PATCH'
    });
  },

  getRoommatePosts: async (status?: string) => {
    return request<any[]>(`/admin/roommate-posts${status ? `?status=${status}` : ''}`);
  },

  updateRoommatePostStatus: async (postId: string, isActive: boolean) => {
    return request<any>(`/admin/roommate-posts/${postId}/status?isActive=${isActive}`, {
      method: 'PATCH'
    });
  }
};

export interface TenantDiscoveryCandidate {
  id: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  preferences?: string;
  lifestyle?: string;
  matchScore: number;
  budgetRange?: string;
  isVerified: boolean;
  reputationRating: number;
  preferredLocation?: string;
}

// 11. LANDLORD DASHBOARD API
export const landlordApi = {
  getAnalytics: async () => {
    return request<any>('/landlord/analytics');
  },

  getLeadAnalytics: async () => {
    return request<any>('/landlord/lead-analytics');
  },

  getBilling: async () => {
    return request<any[]>('/landlord/billing');
  },

  checkout: async (planName: string) => {
    return request<any>('/landlord/checkout', {
      method: 'POST',
      body: JSON.stringify({ planName })
    });
  },

  verifyPayment: async (transactionRef: string, paymentMethod: string = 'VNPay') => {
    return request<any>('/landlord/payment/verify', {
      method: 'POST',
      body: JSON.stringify({ transactionRef, paymentMethod })
    });
  },

  checkPaymentStatus: async (transactionRef: string) => {
    return request<any>(`/landlord/payment/status/${transactionRef}`);
  },

  simulateGatewayPayment: async (transactionRef: string) => {
    return request<any>('/landlord/payment/simulate-gateway', {
      method: 'POST',
      body: JSON.stringify({ transactionRef })
    });
  },

  discoverTenants: async () => {
    return request<TenantDiscoveryCandidate[]>('/landlord/discover-tenants');
  },

  inviteTenantToRoom: async (data: {
    tenantId: string;
    roomId: string;
    message?: string;
  }) => {
    return request<any>('/landlord/invite-tenant', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  submitVerification: async (data: {
    documentType: string;
    documentNumber?: string;
    frontImageUrl: string;
    backImageUrl: string;
  }) => {
    return request<any>('/profiles/landlord/verification', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getVerificationStatus: async () => {
    return request<any>('/profiles/landlord/verification');
  },

  boostRoom: async (roomId: string, data: { boostType: string; paymentMethod?: string }) => {
    return request<any>(`/landlord/rooms/${roomId}/boost`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// 12. NOTIFICATIONS API
export const notificationsApi = {
  getNotifications: async () => {
    return request<any[]>('/notifications');
  },

  markAsRead: async (id: string) => {
    return request<any>(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
  },

  markAllAsRead: async () => {
    return request<any>('/notifications/read-all', {
      method: 'POST'
    });
  }
};

// 13. TENANT REVIEWS API (Reputation System)
export const tenantReviewsApi = {
  getMyLeases: async () => {
    return request<any[]>('/tenant-reviews/leases');
  },

  rateTenant: async (data: {
    tenantId: string;
    leaseContractId?: string;
    leaseId?: string;
    rating: number;
    punctuality?: number;
    cleanliness?: number;
    respectfulness?: number;
    punctualityScore?: number;
    cleanlinessScore?: number;
    respectScore?: number;
    comment: string;
    isAnonymous?: boolean;
  }) => {
    const payload = {
      tenantId: data.tenantId,
      leaseId: data.leaseId || data.leaseContractId,
      leaseContractId: data.leaseContractId || data.leaseId,
      rating: data.rating,
      punctualityScore: data.punctualityScore ?? data.punctuality ?? 5,
      cleanlinessScore: data.cleanlinessScore ?? data.cleanliness ?? 5,
      respectScore: data.respectScore ?? data.respectfulness ?? 5,
      comment: data.comment,
      isAnonymous: data.isAnonymous ?? true
    };
    return request<any>('/tenant-reviews', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getTenantReputation: async (tenantId: string) => {
    return request<any>(`/TenantReviews/tenant/${tenantId}`);
  }
};

// 14. LEASES API (Rental Transaction Spine)
export interface LeaseDocumentResponse {
  id: string;
  documentType: string;
  fileUrl: string;
  title?: string;
  uploadedAt: string;
}

export interface LeaseContractResponse {
  id: string;
  rentalApplicationId?: string;
  roomId: string;
  roomTitle: string;
  roomAddress: string;
  roomImageUrl?: string;
  landlordId: string;
  landlordName: string;
  landlordPhone?: string;
  landlordEmail: string;
  tenantId: string;
  tenantName: string;
  tenantPhone?: string;
  tenantEmail: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  utilitiesDescription?: string;
  termsAndConditions?: string;
  paymentCycleMonths: number;
  status: string; // 'Draft' | 'PendingSignature' | 'Active' | 'Expired' | 'Terminated' | 'Renewed'
  landlordSigned: boolean;
  landlordSignedAt?: string;
  tenantSigned: boolean;
  tenantSignedAt?: string;
  tenantSignatureData?: string;
  contractDocumentUrl?: string;
  createdAt: string;
  activatedAt?: string;
  terminatedAt?: string;
  terminationReason?: string;
  moveOutRequestedAt?: string;
  moveOutDate?: string;
  moveOutReason?: string;
  moveOutInspectionNotes?: string;
  moveOutDeductions?: number;
  moveOutDeductionReason?: string;
  moveOutSettledDeposit?: number;
  moveOutSettledAt?: string;
  renewalRequestedAt?: string;
  renewalProposedEndDate?: string;
  renewalStatus?: string;
  documents: LeaseDocumentResponse[];
}

export interface CreateLeasePayload {
  rentalApplicationId?: string;
  roomId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  utilitiesDescription?: string;
  termsAndConditions?: string;
  paymentCycleMonths?: number;
  contractDocumentUrl?: string;
  documents?: { documentType: string; fileUrl: string; title?: string }[];
}

export interface SignLeasePayload {
  signatureData: string;
  agreedToTerms: boolean;
}

export interface TerminateLeasePayload {
  reason: string;
}

export const leasesApi = {
  createLease: async (data: CreateLeasePayload) => {
    return request<LeaseContractResponse>('/leases', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getMyLeases: async () => {
    return request<LeaseContractResponse[]>('/leases/my');
  },

  getLeaseById: async (id: string) => {
    return request<LeaseContractResponse>(`/leases/${id}`);
  },

  signLease: async (id: string, data: SignLeasePayload) => {
    return request<LeaseContractResponse>(`/leases/${id}/sign`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  terminateLease: async (id: string, data: TerminateLeasePayload) => {
    return request<any>(`/leases/${id}/terminate`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// 12. POST-RENTAL LIFECYCLE (RAIL A PAYMENTS, MAINTENANCE, RENEWAL, MOVE-OUT)
export interface RentalPaymentScheduleResponse {
  id: string;
  leaseContractId: string;
  type: string;
  title: string;
  amount: number;
  dueDate: string;
  status: string;
  paidAt?: string;
  paymentReference?: string;
  paymentMethod?: string;
  landlordNotes?: string;
  createdAt: string;
}

export interface MaintenanceRequestResponse {
  id: string;
  leaseContractId: string;
  tenantId: string;
  tenantName: string;
  landlordId: string;
  landlordName: string;
  roomId: string;
  roomTitle: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  imageUrls?: string;
  assignedTo?: string;
  resolutionNotes?: string;
  estimatedCost?: number;
  actualCost?: number;
  tenantConfirmed: boolean;
  tenantFeedback?: string;
  tenantRating?: number;
  createdAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface PostRentalSummaryResponse {
  leaseId: string;
  leaseStatus: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  nextPaymentAmount?: number;
  nextPaymentDueDate?: string;
  pendingPaymentsCount: number;
  activeMaintenanceCount: number;
  isRenewalRequested: boolean;
  isMoveOutRequested: boolean;
}

export const postRentalApi = {
  getSummary: async (leaseId: string) => {
    return request<PostRentalSummaryResponse>(`/postrental/leases/${leaseId}/summary`);
  },

  getPayments: async (leaseId: string) => {
    return request<RentalPaymentScheduleResponse[]>(`/postrental/leases/${leaseId}/payments`);
  },

  createPayment: async (leaseId: string, data: {
    type: string;
    title: string;
    amount: number;
    dueDate: string;
    landlordNotes?: string;
  }) => {
    return request<RentalPaymentScheduleResponse>(`/postrental/leases/${leaseId}/payments`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  recordPayment: async (scheduleId: string, data: {
    paymentMethod?: string;
    paymentReference?: string;
    landlordNotes?: string;
    markAsPaid?: boolean;
  }) => {
    return request<RentalPaymentScheduleResponse>(`/postrental/payments/${scheduleId}/record`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getMaintenance: async (params?: { leaseId?: string; isLandlord?: boolean }) => {
    const sp = new URLSearchParams();
    if (params?.leaseId) sp.append('leaseId', params.leaseId);
    if (params?.isLandlord !== undefined) sp.append('isLandlord', String(params.isLandlord));
    const qs = sp.toString() ? `?${sp.toString()}` : '';
    return request<MaintenanceRequestResponse[]>(`/postrental/maintenance${qs}`);
  },

  getMaintenanceById: async (id: string) => {
    return request<MaintenanceRequestResponse>(`/postrental/maintenance/${id}`);
  },

  createMaintenance: async (data: {
    leaseContractId: string;
    title: string;
    description: string;
    category?: string;
    priority?: string;
    imageUrls?: string;
  }) => {
    return request<MaintenanceRequestResponse>('/postrental/maintenance', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateMaintenanceStatus: async (id: string, data: {
    status: string;
    assignedTo?: string;
    resolutionNotes?: string;
    estimatedCost?: number;
    actualCost?: number;
  }) => {
    return request<MaintenanceRequestResponse>(`/postrental/maintenance/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  confirmMaintenance: async (id: string, data: {
    tenantFeedback?: string;
    tenantRating?: number;
  }) => {
    return request<MaintenanceRequestResponse>(`/postrental/maintenance/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  requestRenewal: async (leaseId: string, data: {
    proposedEndDate: string;
    notes?: string;
  }) => {
    return request<LeaseContractResponse>(`/postrental/leases/${leaseId}/renewal/request`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  respondRenewal: async (leaseId: string, data: {
    accepted: boolean;
    counterEndDate?: string;
    reason?: string;
  }) => {
    return request<LeaseContractResponse>(`/postrental/leases/${leaseId}/renewal/respond`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  requestMoveOut: async (leaseId: string, data: {
    proposedMoveOutDate: string;
    reason: string;
  }) => {
    return request<LeaseContractResponse>(`/postrental/leases/${leaseId}/moveout/request`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  completeMoveOutInspection: async (leaseId: string, data: {
    inspectionNotes: string;
    deductionsAmount: number;
    deductionReason?: string;
    confirmCheckout?: boolean;
  }) => {
    return request<LeaseContractResponse>(`/postrental/leases/${leaseId}/moveout/inspection`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// 13. TRUST & SAFETY API
export interface TrustFactorItem {
  key: string;
  label: string;
  points: number;
  maxPoints: number;
  passed: boolean;
  explanation: string;
}

export interface TrustScoreBreakdown {
  totalScore: number;
  ratingLevel: string;
  identityPoints: number;
  propertyPoints: number;
  addressAndDetailsPoints: number;
  photosPoints: number;
  historyPoints: number;
  reviewsPoints: number;
  reportsDeduction: number;
  factors: TrustFactorItem[];
}

export interface ModerationReport {
  id: string;
  roomId: string;
  roomTitle: string;
  roomAddress: string;
  landlordId: string;
  landlordName: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reason: string;
  details: string;
  status: string;
  riskLevel: string;
  evidenceUrls?: string;
  moderatorNotes?: string;
  actionTaken?: string;
  moderatorId?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  actorId?: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export const trustSafetyApi = {
  getRoomTrustScore: async (roomId: string) => {
    return request<TrustScoreBreakdown>(`/trustsafety/rooms/${roomId}/score`);
  },

  submitPropertyVerification: async (data: {
    roomId?: string;
    documentType?: string;
    documentNumber: string;
    propertyAddress: string;
    frontImageUrl: string;
    backImageUrl: string;
  }) => {
    return request<any>('/trustsafety/property-verification', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getModerationQueue: async (params?: { status?: string; riskLevel?: string }) => {
    const sp = new URLSearchParams();
    if (params?.status) sp.append('status', params.status);
    if (params?.riskLevel) sp.append('riskLevel', params.riskLevel);
    const qs = sp.toString() ? `?${sp.toString()}` : '';
    return request<ModerationReport[]>(`/trustsafety/moderation/reports${qs}`);
  },

  resolveReport: async (id: string, data: {
    status: string;
    actionTaken: string;
    moderatorNotes: string;
  }) => {
    return request<any>(`/trustsafety/moderation/reports/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getAuditLogs: async (limit: number = 50) => {
    return request<AuditLogItem[]>(`/trustsafety/moderation/audit-logs?limit=${limit}`);
  }
};


