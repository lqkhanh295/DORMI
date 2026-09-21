import * as signalR from '@microsoft/signalr';
import { toast } from 'sonner';
import { useStore, type Message } from '../store/useStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5167/api';
const HUB_URL = API_BASE.replace(/\/api\/?$/, '') + '/hubs/chat';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnecting: boolean = false;

  public async startConnection(userId: string, token?: string, role?: string) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      if (role?.toLowerCase() === 'admin') {
        try {
          await this.connection.invoke('JoinAdminGroup');
        } catch {
          // Ignore
        }
      }
      return;
    }

    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
          accessTokenFactory: () => token || '',
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      // 1. Real-time Chat message listener
      this.connection.on('ReceiveMessage', (payload: any) => {
        if (!payload) return;
        const msg: Message = {
          id: payload.id || Math.random().toString(36).substring(2, 9),
          senderId: payload.senderId,
          receiverId: payload.receiverId,
          text: payload.text,
          timestamp: payload.timestamp || new Date().toISOString()
        };

        const currentMessages = useStore.getState().messages;
        const exists = currentMessages.some(m => 
          m.id === msg.id || 
          (m.senderId.toLowerCase() === msg.senderId.toLowerCase() &&
           m.receiverId.toLowerCase() === msg.receiverId.toLowerCase() &&
           m.text === msg.text &&
           Math.abs(new Date(m.timestamp).getTime() - new Date(msg.timestamp).getTime()) < 5000)
        );
        if (!exists) {
          useStore.setState({ messages: [...currentMessages, msg] });
        }
      });

      // 2. Real-time Room Status Notification (Sent to landlord)
      this.connection.on('RoomStatusUpdated', (payload: any) => {
        if (!payload) return;
        if (payload.newStatus === 0) {
          toast.success(`Tin đăng "${payload.title}" đã được Admin duyệt công khai.`);
        } else if (payload.newStatus === 3) {
          toast.error(`Tin đăng "${payload.title}" đã bị từ chối hoặc ẩn bởi Admin.`);
        } else {
          toast.info(`Tin đăng "${payload.title}" đã chuyển sang trạng thái: ${payload.statusName || payload.newStatus}.`);
        }

        window.dispatchEvent(new CustomEvent('room-status-updated', { detail: payload }));
      });

      // 3. Real-time New Room Pending Approval (Sent to admins)
      this.connection.on('NewRoomPendingApproval', (payload: any) => {
        if (!payload) return;
        const currentRole = useStore.getState().currentUser?.role;
        if (currentRole?.toLowerCase() === 'admin') {
          toast.info(`Phòng mới chờ duyệt: "${payload.title}" từ chủ trọ ${payload.landlordName || 'Chủ trọ'}.`);
        }

        window.dispatchEvent(new CustomEvent('new-room-pending', { detail: payload }));
      });

      // 4. Real-time Room Moderation sync for all admin screens
      this.connection.on('RoomModerated', (payload: any) => {
        if (!payload) return;
        window.dispatchEvent(new CustomEvent('room-moderated', { detail: payload }));
      });

      // 5. Global Room Status changed (for public room list sync)
      this.connection.on('RoomStatusChanged', (payload: any) => {
        if (!payload) return;
        window.dispatchEvent(new CustomEvent('room-status-changed', { detail: payload }));
      });

      await this.connection.start();

      if (userId) {
        await this.connection.invoke('JoinUserGroup', userId);
      }

      if (role?.toLowerCase() === 'admin') {
        await this.connection.invoke('JoinAdminGroup');
      }
    } catch (err) {
      console.warn('[SignalR Notice]: WebSocket could not connect, will use API fallback polling:', err);
    } finally {
      this.isConnecting = false;
    }
  }

  public async stopConnection() {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch {
        // Ignore
      }
      this.connection = null;
    }
  }
}

export const signalRService = new SignalRService();
