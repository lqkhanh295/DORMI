import { create } from 'zustand';
import {
  mockAdminUsers,
  mockAppointments,
  mockLandlords,
  mockMaintenanceTickets,
  mockNotifications,
  mockPendingKYC,
  mockPendingRooms,
  mockReports,
  mockRooms,
  mockSavedRooms,
  mockVouchers,
} from '../data/mockData';

export type Room = (typeof mockRooms)[number];
export type Appointment = (typeof mockAppointments)[number];
export type Ticket = (typeof mockMaintenanceTickets)[number];
export interface PendingRoom {
  id: string;
  title: string;
  address: string;
  district?: string;
  price: number;
  area: number;
  type: string;
  landlordId: string;
  landlordName: string;
  landlordKYC: string;
  images: string[];
  submittedAt: string;
  adminStatus: 'pending' | 'approved' | 'rejected';
  adminNote: string | null;
  deposit?: number;
  electricPrice?: number;
  waterPrice?: number;
  lat?: number;
  lng?: number;
  amenities?: string[];
  has360?: boolean;
}
export interface PendingKYC {
  id: string;
  landlordId: string;
  fullName: string;
  email: string;
  phone: string;
  cccdNumber: string;
  dateOfBirth: string;
  address: string;
  frontIdImage: string;
  backIdImage: string;
  selfieImage: string;
  submittedAt: string;
  status: string;
  adminNote: string | null;
}
export type AdminUser = (typeof mockAdminUsers)[number];
export type Landlord = (typeof mockLandlords)[number];
export type Notification = (typeof mockNotifications)[number];
export type Voucher = (typeof mockVouchers)[number];
export type Report = (typeof mockReports)[number];

let sequence = 1000;
const nextId = (prefix: string) => `${prefix}-${++sequence}`;

const roomFromPending = (pending: PendingRoom): Room => ({
  id: pending.id.replace('pending-', ''),
  title: pending.title,
  address: pending.address,
  district: pending.address.includes('Bình Thạnh') ? 'Bình Thạnh' : pending.address.includes('Quận 3') ? 'Quận 3' : 'Quận 10',
  price: pending.price,
  area: pending.area,
  type: pending.type,
  lat: 10.7769,
  lng: 106.7009,
  images: pending.images,
  amenities: ['Wifi', 'Giữ xe', 'Camera an ninh'],
  landlordId: pending.landlordId,
  landlordName: pending.landlordName,
  landlordAvatar: 'https://i.pravatar.cc/100?img=33',
  landlordVerified: pending.landlordKYC === 'verified',
  landlordRating: 4.6,
  landlordTotalReviews: 12,
  deposit: pending.price,
  electricPrice: 3500,
  waterPrice: 80000,
  maxOccupants: 2,
  currentOccupants: 0,
  lookingForRoommate: false,
  availableFrom: '2025-08-01',
  nearbyUniversities: ['ĐH Bách Khoa HCM (1.5km)'],
  description: 'Tin đăng đã được quản trị viên duyệt và hiển thị công khai trên DORMI.',
  trustScore: pending.landlordKYC === 'verified' ? 90 : 72,
  isVerified: pending.landlordKYC === 'verified',
  isFeatured: false,
  totalViews: 0,
  savedCount: 0,
  createdAt: new Date().toISOString().split('T')[0],
  status: 'Đang cho thuê',
  panoramaUrl: null,
  reviews: [],
});

interface AppDataState {
  rooms: Room[];
  landlords: Landlord[];
  appointments: Appointment[];
  tickets: Ticket[];
  pendingRooms: PendingRoom[];
  pendingKYC: PendingKYC[];
  adminUsers: AdminUser[];
  notifications: Notification[];
  vouchers: Voucher[];
  reports: Report[];
  savedRoomIds: string[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  toggleSavedRoom: (roomId: string) => boolean;
  removeSavedRoom: (roomId: string) => void;
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'resolvedAt'>) => Ticket;
  updateTicketStatus: (id: string, status: Ticket['status'], landlordNote?: string) => void;
  submitPendingRoom: (room: PendingRoom) => void;
  approvePendingRoom: (id: string) => void;
  rejectPendingRoom: (id: string, reason: string) => void;
  approveKYC: (id: string) => void;
  rejectKYC: (id: string, reason: string) => void;
  toggleUserBan: (id: string) => void;
  addReport: (report: Omit<Report, 'id' | 'createdAt' | 'status' | 'adminNote'>) => Report;
  addRoomReview: (roomId: string, rating: number, content: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (message: string, type?: Notification['type']) => void;
  addVoucher: (voucher: Voucher) => void;
}

export const useAppDataStore = create<AppDataState>((set, get) => ({
  rooms: [...mockRooms] as Room[],
  landlords: [...mockLandlords] as Landlord[],
  appointments: [...mockAppointments] as Appointment[],
  tickets: [...mockMaintenanceTickets] as Ticket[],
  pendingRooms: [...mockPendingRooms] as PendingRoom[],
  pendingKYC: [...mockPendingKYC] as PendingKYC[],
  adminUsers: [...mockAdminUsers] as AdminUser[],
  notifications: [...mockNotifications] as Notification[],
  vouchers: [...mockVouchers] as Voucher[],
  reports: [...mockReports] as Report[],
  savedRoomIds: [...mockSavedRooms] as string[],

  addAppointment: (appointment) => {
    const created = {
      ...appointment,
      id: nextId('appt'),
      createdAt: new Date().toISOString().split('T')[0],
    } as Appointment;
    set((state) => ({
      appointments: [created, ...state.appointments],
      notifications: [
        {
          id: nextId('n'),
          type: 'appointment',
          message: `${created.tenantName} vừa đặt lịch xem phòng ${created.roomTitle}.`,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...state.notifications,
      ],
    }));
    return created;
  },

  updateAppointmentStatus: (id, status) => {
    set((state) => ({
      appointments: state.appointments.map((item) => (item.id === id ? { ...item, status } : item)),
      notifications: [
        {
          id: nextId('n'),
          type: 'appointment',
          message: `Lịch hẹn đã được cập nhật thành "${status === 'confirmed' ? 'Đã xác nhận' : status === 'completed' ? 'Hoàn thành' : status === 'cancelled' ? 'Đã hủy' : 'Chờ xác nhận'}".`,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...state.notifications,
      ],
    }));
  },

  toggleSavedRoom: (roomId) => {
    const isSaved = get().savedRoomIds.includes(roomId);
    set((state) => ({
      savedRoomIds: isSaved ? state.savedRoomIds.filter((id) => id !== roomId) : [...state.savedRoomIds, roomId],
      rooms: state.rooms.map((room) => (
        room.id === roomId
          ? { ...room, savedCount: Math.max(0, room.savedCount + (isSaved ? -1 : 1)) }
          : room
      )),
    }));
    return !isSaved;
  },

  removeSavedRoom: (roomId) => {
    set((state) => ({
      savedRoomIds: state.savedRoomIds.filter((id) => id !== roomId),
      rooms: state.rooms.map((room) => (room.id === roomId ? { ...room, savedCount: Math.max(0, room.savedCount - 1) } : room)),
    }));
  },

  addTicket: (ticket) => {
    const created = {
      ...ticket,
      id: nextId('ticket'),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      resolvedAt: null,
    } as Ticket;
    set((state) => ({ tickets: [created, ...state.tickets] }));
    return created;
  },

  updateTicketStatus: (id, status, landlordNote = '') => {
    set((state) => ({
      tickets: state.tickets.map((ticket) => (
        ticket.id === id
          ? ({ ...ticket, status, landlordNote, updatedAt: new Date().toISOString().split('T')[0], resolvedAt: status === 'resolved' ? new Date().toISOString().split('T')[0] : ticket.resolvedAt } as Ticket)
          : ticket
      )),
    }));
  },

  submitPendingRoom: (room) => {
    set((state) => ({ pendingRooms: [{ ...room, id: nextId('pending-room') }, ...state.pendingRooms] }));
  },

  approvePendingRoom: (id) => {
    const room = get().pendingRooms.find((item) => item.id === id);
    if (!room) return;
    set((state) => ({
      pendingRooms: state.pendingRooms.filter((item) => item.id !== id),
      rooms: [roomFromPending(room), ...state.rooms],
    }));
  },

  rejectPendingRoom: (id, reason) => {
    set((state) => ({
      pendingRooms: state.pendingRooms.map((item) => (item.id === id ? ({ ...item, adminStatus: 'rejected', adminNote: reason } as PendingRoom) : item)).filter((item) => item.id !== id),
    }));
  },

  approveKYC: (id) => {
    const kyc = get().pendingKYC.find((item) => item.id === id);
    if (!kyc) return;
    set((state) => ({
      pendingKYC: state.pendingKYC.filter((item) => item.id !== id),
      landlords: state.landlords.map((landlord) => (landlord.id === kyc.landlordId ? ({ ...landlord, kycStatus: 'verified', kycVerifiedAt: new Date().toISOString().split('T')[0] } as Landlord) : landlord)),
      rooms: state.rooms.map((room) => (room.landlordId === kyc.landlordId ? ({ ...room, landlordVerified: true, isVerified: true, trustScore: Math.max(room.trustScore, 90) } as Room) : room)),
      adminUsers: state.adminUsers.map((user) => (user.id === kyc.landlordId ? ({ ...user, kycStatus: 'verified' } as AdminUser) : user)),
    }));
  },

  rejectKYC: (id, reason) => {
    set((state) => ({
      pendingKYC: state.pendingKYC.map((item) => (item.id === id ? ({ ...item, status: 'rejected', adminNote: reason } as PendingKYC) : item)).filter((item) => item.id !== id),
    }));
  },

  toggleUserBan: (id) => {
    set((state) => ({
      adminUsers: state.adminUsers.map((user) => (user.id === id ? { ...user, status: user.status === 'active' ? 'blocked' : 'active' } : user)),
    }));
  },

  addReport: (report) => {
    const created = {
      ...report,
      id: nextId('report'),
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      adminNote: null,
    } as Report;
    set((state) => ({ reports: [created, ...state.reports] }));
    return created;
  },

  addRoomReview: (roomId, rating, content) => {
    set((state) => ({
      rooms: state.rooms.map((room) => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          trustScore: Math.min(100, Math.round(room.trustScore * 0.9 + rating * 2)),
          reviews: [
            ...room.reviews,
            {
              id: nextId('review'),
              authorName: 'Nguyễn Minh Khoa',
              authorAvatar: 'https://i.pravatar.cc/40?img=52',
              rating,
              content,
              date: new Date().toISOString().split('T')[0],
            },
          ],
        } as Room;
      }),
    }));
  },

  markAllNotificationsRead: () => {
    set((state) => ({ notifications: state.notifications.map((item) => ({ ...item, isRead: true })) }));
  },

  addNotification: (message, type = 'appointment') => {
    set((state) => ({
      notifications: [{ id: nextId('n'), type, message, isRead: false, createdAt: new Date().toISOString() }, ...state.notifications],
    }));
  },

  addVoucher: (voucher) => {
    set((state) => ({ vouchers: [voucher, ...state.vouchers] }));
  },
}));
