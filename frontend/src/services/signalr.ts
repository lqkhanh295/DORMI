import * as signalR from '@microsoft/signalr';
import { useStore, type Message } from '../store/useStore';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnecting: boolean = false;

  public async startConnection(userId: string, token?: string) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5167/hubs/chat', {
          accessTokenFactory: () => token || '',
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      this.connection.on('ReceiveMessage', (payload: any) => {
        if (!payload) return;
        const msg: Message = {
          id: payload.id || Math.random().toString(36).substr(2, 9),
          senderId: payload.senderId,
          receiverId: payload.receiverId,
          text: payload.text,
          timestamp: payload.timestamp || new Date().toISOString()
        };

        const currentMessages = useStore.getState().messages;
        const exists = currentMessages.some(m => m.id === msg.id);
        if (!exists) {
          useStore.setState({ messages: [...currentMessages, msg] });
        }
      });

      await this.connection.start();

      if (userId) {
        await this.connection.invoke('JoinUserGroup', userId);
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
