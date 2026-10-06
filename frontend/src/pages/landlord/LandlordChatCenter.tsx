import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';
import { messagesApi, appointmentsApi } from '../../services/api';
import { signalRService } from '../../services/signalr';
import { Hand, Paperclip, CheckCircle2, Circle, Search, Home, Send } from 'lucide-react';
import { chatMessageItemVariants } from '../../utils/motion';

export default function LandlordChatCenter() {
  const { currentUser, messages, sendMessageWithApi } = useStore();
  const location = useLocation();

  // Location state passed when navigating from Applications, Leases, Viewings, or Discovery
  const targetUserId = location.state?.targetUserId as string | undefined;
  const targetUserName = location.state?.targetUserName as string | undefined;
  const targetUserRole = location.state?.targetUserRole as string | undefined;
  const targetRoomTitle = location.state?.targetRoomTitle as string | undefined;

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [apiConversations, setApiConversations] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>(targetUserId || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-select contact when targetUserId is provided via navigation state
  useEffect(() => {
    if (targetUserId) {
      setSelectedContactId(targetUserId);
    }
  }, [targetUserId]);

  // SignalR real-time messaging connection
  useEffect(() => {
    if (currentUser?.id) {
      signalRService.startConnection(currentUser.id, currentUser.token);
    }
  }, [currentUser]);

  // Load backend conversations
  useEffect(() => {
    messagesApi.getConversations()
      .then(res => {
        if (Array.isArray(res)) {
          setApiConversations(res);
        }
      })
      .catch(() => {});
  }, [messages]);

  // Load viewing appointments for this landlord
  useEffect(() => {
    appointmentsApi.getMyAppointments()
      .then(res => {
        if (Array.isArray(res)) {
          setAppointments(res);
        }
      })
      .catch(() => {});
  }, []);

  // Build dynamic contact list
  const contactsMap = new Map<string, any>();

  // 1. If navigated from other pages with a targeted contact
  if (targetUserId) {
    contactsMap.set(targetUserId, {
      id: targetUserId,
      name: targetUserName || 'Khách thuê',
      role: targetUserRole || 'Tenant',
      online: true,
      avatar: '',
      roomTitle: targetRoomTitle,
      lastMessage: ''
    });
  }

  // 2. From viewing appointments
  appointments.forEach(a => {
    const partnerId = a.customerId === currentUser?.id ? a.landlordId : a.customerId;
    const partnerName = a.customerId === currentUser?.id ? a.landlordName : a.customerName;
    if (partnerId && partnerId !== currentUser?.id) {
      const existing = contactsMap.get(partnerId);
      if (!existing) {
        contactsMap.set(partnerId, {
          id: partnerId,
          name: partnerName || 'Khách xem phòng',
          role: 'Tenant',
          online: true,
          avatar: a.customerAvatar || '',
          roomTitle: a.roomTitle,
          appointmentId: a.id,
          appointmentStatus: a.status
        });
      } else {
        if (partnerName && (existing.name === 'Khách xem phòng' || existing.name === 'Khách thuê' || existing.name === 'Người dùng' || !existing.name)) {
          existing.name = partnerName;
        }
        if (a.customerAvatar && !existing.avatar) {
          existing.avatar = a.customerAvatar;
        }
        if (a.id) existing.appointmentId = a.id;
        if (a.status) existing.appointmentStatus = a.status;
        if (a.roomTitle && !existing.roomTitle) existing.roomTitle = a.roomTitle;
      }
    }
  });

  // 3. From API conversations
  apiConversations.forEach(c => {
    const existing = contactsMap.get(c.otherUserId);
    if (!existing) {
      contactsMap.set(c.otherUserId, {
        id: c.otherUserId,
        name: c.otherUserName || 'Khách thuê',
        role: 'Tenant',
        online: c.isOnline ?? true,
        avatar: c.otherUserAvatar || '',
        lastMessage: c.lastMessage
      });
    } else {
      if (c.otherUserName && (existing.name === 'Khách xem phòng' || existing.name === 'Khách thuê' || existing.name === 'Người dùng' || !existing.name)) {
        existing.name = c.otherUserName;
      }
      if (c.otherUserAvatar && !existing.avatar) {
        existing.avatar = c.otherUserAvatar;
      }
      if (c.lastMessage) {
        existing.lastMessage = c.lastMessage;
      }
      if (c.isOnline !== undefined) {
        existing.online = c.isOnline;
      }
    }
  });

  // 4. Ensure targetUserName is preserved if explicitly provided from navigation
  if (targetUserId && targetUserName) {
    const target = contactsMap.get(targetUserId);
    if (target) {
      if (target.name === 'Khách xem phòng' || target.name === 'Khách thuê' || target.name === 'Người dùng' || !target.name) {
        target.name = targetUserName;
      }
      if (targetRoomTitle && !target.roomTitle) {
        target.roomTitle = targetRoomTitle;
      }
    }
  }

  const contacts = Array.from(contactsMap.values());
  const activeContactId = selectedContactId || targetUserId || contacts[0]?.id;
  const selectedContact = contacts.find(c => c.id === activeContactId) || contacts[0];

  useEffect(() => {
    if (selectedContact?.id) {
      messagesApi.getHistory(selectedContact.id).catch(() => {});
    }
  }, [selectedContact?.id]);

  const chatMessages = messages.filter(m => 
    (m.senderId === currentUser?.id && m.receiverId === selectedContact?.id) ||
    (m.senderId === selectedContact?.id && m.receiverId === currentUser?.id)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!inputText.trim() || !selectedContact) return;
    const text = inputText;
    setInputText('');
    await sendMessageWithApi(selectedContact.id, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleConfirmAppointment = async (apptId: string) => {
    try {
      await appointmentsApi.updateStatus(apptId, 'Confirmed');
      setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: 'Confirmed' } : a));
    } catch (err) {
      console.error('Update appointment status failed:', err);
    }
  };

  const filteredContacts = contacts.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.roomTitle?.toLowerCase().includes(q) ||
      c.lastMessage?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-white rounded-[18px] shadow-clay-soft overflow-hidden border border-[#E2E8F0]">
      {/* Sidebar: Conversation List */}
      <div className="hidden md:flex w-1/3 border-r border-[#E2E8F0] flex-col bg-[#F5F7FA]">
        <div className="p-4 border-b border-[#E2E8F0] bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm hội thoại..." 
              className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00153D]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#94A3B8]">
              Chưa có cuộc hội thoại nào
            </div>
          ) : (
            filteredContacts.map(contact => {
              const isSelected = contact.id === activeContactId;
              const contactMessages = messages.filter(m => 
                (m.senderId === currentUser?.id && m.receiverId === contact.id) ||
                (m.senderId === contact.id && m.receiverId === currentUser?.id)
              );
              const lastMsg = contact.lastMessage || 
                (contactMessages.length > 0 ? contactMessages[contactMessages.length - 1].text : 'Bắt đầu trò chuyện');

              const initialLetter = (contact.name && contact.name.trim().length > 0) 
                ? contact.name.trim().charAt(0).toUpperCase() 
                : 'U';

              return (
                <div 
                  key={contact.id}
                  onClick={() => setSelectedContactId(contact.id)}
                  className={`p-4 border-b border-[#E2E8F0] cursor-pointer transition-all flex gap-3 ${
                    isSelected ? 'bg-white font-semibold border-l-4 border-l-[#00153D] shadow-sm' : 'hover:bg-white/50'
                  }`}
                >
                  {contact.avatar ? (
                    <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#00153D] text-white flex-shrink-0 flex items-center justify-center font-bold text-sm">
                      {initialLetter}
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-[#0F172A] truncate text-sm">{contact.name || 'Người dùng'}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16803C] border border-[#DCFCE7] flex-shrink-0">
                        {contact.role === 'Tenant' ? 'Khách thuê' : contact.role || 'Khách'}
                      </span>
                    </div>
                    {contact.roomTitle && (
                      <p className="text-xs text-[#64748B] truncate mb-0.5 flex items-center gap-1">
                        <Home className="w-3 h-3 text-[#94A3B8] flex-shrink-0" />
                        <span className="truncate">{contact.roomTitle}</span>
                      </p>
                    )}
                    <p className={`text-xs truncate ${isSelected ? 'font-semibold text-[#00153D]' : 'text-[#64748B]'}`}>
                      {lastMsg}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-[#E2E8F0] px-6 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {selectedContact.avatar ? (
                  <img src={selectedContact.avatar} alt={selectedContact.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#00153D] text-white flex-shrink-0 flex items-center justify-center font-bold text-sm">
                    {selectedContact.name ? selectedContact.name.trim().charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#0F172A] truncate text-base">{selectedContact.name || 'Người dùng'}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16803C] border border-[#DCFCE7] flex-shrink-0">
                      {selectedContact.role === 'Tenant' ? 'Khách thuê' : selectedContact.role || 'Khách'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <p className="text-xs text-[#16803C] font-semibold flex items-center gap-1 flex-shrink-0">
                      <Circle className="w-2 h-2 fill-[#16803C] text-[#16803C]" />
                      <span>Trực tuyến</span>
                    </p>
                    {selectedContact.roomTitle && (
                      <p className="text-xs text-[#64748B] truncate hidden sm:flex items-center gap-1">
                        <span>•</span>
                        <Home className="w-3 h-3 text-[#94A3B8] flex-shrink-0" />
                        <span className="truncate max-w-[280px]">{selectedContact.roomTitle}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {selectedContact.appointmentId && (
                <div className="flex items-center gap-2">
                  {selectedContact.appointmentStatus === 'Confirmed' ? (
                    <span className="text-caption font-bold text-[#16803C] bg-[#F0FDF4] border border-[#DCFCE7] px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16803C]" /> Lịch hẹn đã duyệt
                    </span>
                  ) : (
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleConfirmAppointment(selectedContact.appointmentId)}
                    >
                      Duyệt lịch xem phòng
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto bg-[#F5F7FA] flex flex-col gap-4">
              <div className="text-center">
                <span className="text-caption text-[#64748B] bg-white border border-[#E2E8F0] px-3 py-1 rounded-full font-medium">Hôm nay</span>
              </div>
              
              {chatMessages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-[#64748B]">
                  <div className="w-16 h-16 bg-white shadow-clay-soft rounded-full flex items-center justify-center text-[#00153D] mb-4">
                    <Hand className="w-8 h-8" />
                  </div>
                  <p>Hãy gửi tin nhắn đầu tiên đến {selectedContact.name || 'khách thuê'}!</p>
                </div>
              )}

              {chatMessages.map(msg => {
                const isMe = msg.senderId === currentUser?.id;
                return (
                  <motion.div 
                    key={msg.id} 
                    variants={chatMessageItemVariants}
                    initial="hidden"
                    animate="visible"
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isMe && (
                        selectedContact.avatar ? (
                          <img src={selectedContact.avatar} alt={selectedContact.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-auto" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#00153D] text-white flex-shrink-0 mt-auto flex items-center justify-center font-bold text-xs">
                            {selectedContact.name ? selectedContact.name.trim().charAt(0).toUpperCase() : 'U'}
                          </div>
                        )
                      )}
                      <div className={`${isMe ? 'btn-clay-primary rounded-[14px] rounded-tr-xs' : 'bg-white shadow-clay-soft text-[#0F172A] rounded-[14px] rounded-bl-xs'} p-3`}>
                        <p className="text-body whitespace-pre-wrap">{msg.text}</p>
                        <span className={`text-[10px] block mt-1 ${isMe ? 'text-white/80 text-right' : 'text-[#64748B]'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[#E2E8F0] bg-white">
              <div className="flex items-end gap-2 bg-[#F5F7FA] shadow-clay-inset rounded-[12px] border border-[#E2E8F0] p-2 focus-within:bg-white focus-within:ring-1 focus-within:ring-[#00153D] transition-all">
                <button type="button" className="p-2 text-[#64748B] hover:text-[#0F172A] rounded-full transition-colors flex-shrink-0">
                  <Paperclip className="w-5 h-5" />
                </button>
                <textarea 
                  placeholder={`Trả lời ${selectedContact.name || 'khách thuê'}...`} 
                  className="flex-1 max-h-32 bg-transparent resize-none outline-none py-2 text-body text-[#0F172A]"
                  rows={1}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button size="sm" className="mb-0.5 px-4 flex items-center gap-1.5" onClick={handleSend}>
                  <Send className="w-4 h-4" />
                  <span>Gửi</span>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#64748B]">
            Chọn một cuộc hội thoại để bắt đầu
          </div>
        )}
      </div>
    </div>
  );
}
