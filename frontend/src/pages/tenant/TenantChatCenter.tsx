import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';
import { Hand, Paperclip, Calendar, MessageCircle, Clock, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { messagesApi, appointmentsApi } from '../../services/api';
import { signalRService } from '../../services/signalr';

export default function TenantChatCenter() {
  const { currentUser, messages, sendMessageWithApi, likedRoommates } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'chat' | 'appointments'>('chat');
  const [inputText, setInputText] = useState('');
  const [apiConversations, setApiConversations] = useState<any[]>([]);
  const [apiAppointments, setApiAppointments] = useState<any[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Parse location state passed from RoomDetail
  const targetUserId = location.state?.targetUserId;
  const targetUserName = location.state?.targetUserName;
  const targetUserRole = location.state?.targetUserRole;
  const initialTab = location.state?.tab;

  useEffect(() => {
    if (initialTab === 'appointments') {
      setActiveTab('appointments');
    }
  }, [initialTab]);

  // SignalR real-time messaging connection
  useEffect(() => {
    if (currentUser?.id) {
      signalRService.startConnection(currentUser.id, currentUser.token);
    }
    return () => {
      // Keep alive during chat session
    };
  }, [currentUser]);

  // Load active conversations from backend
  useEffect(() => {
    messagesApi.getConversations()
      .then(res => {
        if (Array.isArray(res)) {
          setApiConversations(res);
        }
      })
      .catch(() => {});
  }, [messages]);

  // Load appointments
  const fetchAppointments = () => {
    setLoadingAppts(true);
    appointmentsApi.getMyAppointments()
      .then(res => {
        if (Array.isArray(res)) {
          setApiAppointments(res);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingAppts(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Build dynamic contacts list
  const contactsMap = new Map<string, any>();

  // If navigated from RoomDetail with a specific landlord
  if (targetUserId) {
    contactsMap.set(targetUserId, {
      id: targetUserId,
      name: targetUserName || 'Chủ trọ',
      role: targetUserRole || 'Landlord',
      online: true,
      avatar: ''
    });
  }

  // Add backend conversations
  apiConversations.forEach(c => {
    if (!contactsMap.has(c.otherUserId)) {
      contactsMap.set(c.otherUserId, {
        id: c.otherUserId,
        name: c.otherUserName || 'Người dùng',
        role: 'User',
        online: true,
        avatar: c.otherUserAvatar || '',
        lastMessage: c.lastMessage
      });
    }
  });

  // Default seed landlord fallback
  if (!contactsMap.has('b0000000-0000-0000-0000-000000000001')) {
    contactsMap.set('b0000000-0000-0000-0000-000000000001', {
      id: 'b0000000-0000-0000-0000-000000000001',
      name: 'Trần Minh Tuấn (Chủ trọ)',
      role: 'Landlord',
      online: true,
      avatar: ''
    });
  }

  // Liked Roommates
  likedRoommates.forEach(r => {
    const rId = r.customerId || `r${r.id}`;
    if (!contactsMap.has(rId)) {
      contactsMap.set(rId, {
        id: rId,
        name: r.name,
        role: 'Roommate',
        online: false,
        avatar: r.image
      });
    }
  });

  const contacts = Array.from(contactsMap.values());
  const initialContactId = targetUserId || contacts[0]?.id;
  const [selectedContactId, setSelectedContactId] = useState(initialContactId);

  useEffect(() => {
    if (targetUserId) {
      setSelectedContactId(targetUserId);
    }
  }, [targetUserId]);

  const selectedContact = contacts.find(c => c.id === selectedContactId) || contacts[0];

  // Fetch message history when selected contact changes
  useEffect(() => {
    if (selectedContact && selectedContact.id) {
      messagesApi.getHistory(selectedContact.id).catch(() => {});
    }
  }, [selectedContact]);

  const chatMessages = messages.filter(m => 
    (m.senderId === currentUser?.id && m.receiverId === selectedContact?.id) ||
    (m.senderId === selectedContact?.id && m.receiverId === currentUser?.id)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!inputText.trim() || !selectedContact) return;
    const msgText = inputText;
    setInputText('');
    await sendMessageWithApi(selectedContact.id, msgText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-4">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 bg-white p-2 rounded-[14px] shadow-clay-soft border border-[#E2E8F0] w-fit">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-caption font-bold transition-all ${
            activeTab === 'chat'
              ? 'btn-clay-primary'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F5F7FA]'
          }`}
        >
          <MessageCircle size={18} />
          Hội thoại & Tin nhắn
        </button>
        <button
          onClick={() => {
            setActiveTab('appointments');
            fetchAppointments();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-caption font-bold transition-all ${
            activeTab === 'appointments'
              ? 'btn-clay-primary'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F5F7FA]'
          }`}
        >
          <Calendar size={18} />
          Lịch hẹn xem phòng ({apiAppointments.length})
        </button>
      </div>

      {activeTab === 'appointments' ? (
        /* APPOINTMENTS VIEW */
        <div className="bg-white rounded-[18px] shadow-clay-soft p-6 border border-[#E2E8F0] space-y-6">
          <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-4">
            <div>
              <h2 className="text-h3 font-bold text-[#0F172A]">Danh sách lịch hẹn xem phòng</h2>
              <p className="text-caption text-[#64748B]">Dữ liệu đồng bộ trực tiếp từ Backend API</p>
            </div>
            <Button size="sm" variant="secondary" onClick={fetchAppointments} disabled={loadingAppts}>
              {loadingAppts ? 'Đang tải...' : 'Làm mới'}
            </Button>
          </div>

          {apiAppointments.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 bg-[#F5F7FA] text-[#64748B] rounded-full flex items-center justify-center mx-auto">
                <Calendar size={32} />
              </div>
              <h3 className="text-h3 font-bold text-[#0F172A]">Chưa có lịch hẹn nào</h3>
              <p className="text-body text-[#64748B] max-w-md mx-auto">
                Bạn chưa đặt lịch xem phòng trọ nào. Hãy tìm kiếm phòng ưng ý và bấm "Đặt lịch xem phòng".
              </p>
              <Button onClick={() => navigate('/search')} className="mt-2">
                Khám phá phòng trọ
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apiAppointments.map(appt => {
                const isConfirmed = appt.status === 'Confirmed';
                return (
                  <div
                    key={appt.id}
                    className="p-5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-body text-[#0F172A] line-clamp-1">
                        {appt.roomTitle || 'Phòng trọ'}
                      </h4>
                      <span
                        className={`text-caption font-bold px-3 py-1 rounded-full flex items-center gap-1 flex-shrink-0 ${
                          isConfirmed
                            ? 'bg-[#F0FDF4] text-[#16803C] border border-[#DCFCE7]'
                            : 'bg-[#FEF9C3] text-[#854D0E] border border-[#FEF08A]'
                        }`}
                      >
                        {isConfirmed ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        {isConfirmed ? 'Đã xác nhận' : 'Chờ chủ nhà duyệt'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-caption text-[#64748B]">
                      {appt.roomAddress && (
                        <div className="flex items-center gap-2">
                          <MapPin size={15} className="text-[#64748B] flex-shrink-0" />
                          <span className="truncate">{appt.roomAddress}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock size={15} className="text-[#00153D] flex-shrink-0" />
                        <span className="font-semibold text-[#00153D]">
                          {new Date(appt.appointmentDate).toLocaleString('vi-VN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {appt.notes && (
                        <p className="italic bg-white p-2 rounded-[8px] border border-[#E2E8F0]">
                          "{appt.notes}"
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#E2E8F0] flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        fullWidth
                        onClick={() => navigate(`/room/${appt.roomId}`)}
                      >
                        Xem phòng
                      </Button>
                      <Button
                        size="sm"
                        fullWidth
                        onClick={() => {
                          setActiveTab('chat');
                          if (appt.landlordId) {
                            setSelectedContactId(appt.landlordId);
                          }
                        }}
                      >
                        Nhắn tin chủ trọ
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* CHAT VIEW */
        <div className="flex h-[calc(100vh-12rem)] bg-white rounded-[18px] shadow-clay-soft overflow-hidden border border-[#E2E8F0]">
          {/* Sidebar */}
          <div className="hidden md:flex w-1/3 border-r border-[#E2E8F0] flex-col bg-[#F5F7FA]">
            <div className="p-4 border-b border-[#E2E8F0] bg-white">
              <input 
                type="text" 
                placeholder="Tìm kiếm tin nhắn..." 
                className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00153D]"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {contacts.map(contact => {
                const isSelected = contact.id === selectedContactId;
                const contactMessages = messages.filter(m => 
                  (m.senderId === currentUser?.id && m.receiverId === contact.id) ||
                  (m.senderId === contact.id && m.receiverId === currentUser?.id)
                );
                const lastMessage = contact.lastMessage || 
                  (contactMessages.length > 0 ? contactMessages[contactMessages.length - 1].text : 'Bắt đầu trò chuyện');

                return (
                  <div 
                    key={contact.id} 
                    onClick={() => setSelectedContactId(contact.id)}
                    className={`p-4 border-b border-[#E2E8F0] cursor-pointer transition-all flex gap-3 ${
                      isSelected ? 'bg-white font-semibold border-l-4 border-l-[#00153D] shadow-sm' : 'hover:bg-white/50'
                    }`}
                  >
                    {contact.avatar ? (
                      <img src={contact.avatar} alt={contact.name} className="w-11 h-11 rounded-full object-cover border border-[#E2E8F0]" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[#00153D] text-white flex-shrink-0 flex items-center justify-center font-bold">
                        {contact.name.charAt(0)}
                      </div>
                    )}
                    
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-[#0F172A] truncate">{contact.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F7FA] text-[#64748B] border border-[#E2E8F0]">
                          {contact.role === 'Landlord' ? 'Chủ nhà' : (contact.role === 'Roommate' ? 'Bạn ở ghép' : 'Liên hệ')}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${isSelected ? 'font-semibold text-[#00153D]' : 'text-[#64748B]'}`}>
                        {lastMessage}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedContact ? (
              <>
                <div className="h-16 border-b border-[#E2E8F0] px-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedContact.avatar ? (
                      <img src={selectedContact.avatar} alt={selectedContact.name} className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0]" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#00153D] text-white flex items-center justify-center font-bold">
                        {selectedContact.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
                        {selectedContact.name}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F7FA] text-[#64748B]">
                          {selectedContact.role === 'Landlord' ? 'Chủ nhà' : (selectedContact.role === 'Roommate' ? 'Bạn ở ghép' : 'Liên hệ')}
                        </span>
                      </h3>
                      <p className="text-xs text-[#16803C] font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#16803C] block"></span> Trực tuyến (API Connected)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto bg-[#F5F7FA] flex flex-col gap-3">
                  <div className="text-center">
                    <span className="text-caption text-[#64748B] bg-white border border-[#E2E8F0] px-3 py-1 rounded-full font-medium">Hôm nay</span>
                  </div>
                  
                  {chatMessages.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#64748B]">
                      <div className="w-16 h-16 bg-white shadow-clay-soft rounded-full flex items-center justify-center text-[#00153D] mb-4">
                        <Hand size={32} />
                      </div>
                      <p>Hãy gửi tin nhắn đầu tiên đến {selectedContact.name}!</p>
                    </div>
                  )}

                  {chatMessages.map(msg => {
                    const isMe = msg.senderId === currentUser?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isMe && (
                            selectedContact.avatar ? (
                              <img src={selectedContact.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover mt-auto" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#00153D] text-white flex-shrink-0 mt-auto flex items-center justify-center font-bold text-xs">
                                {selectedContact.name.charAt(0)}
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
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-[#E2E8F0] bg-white">
                  <div className="flex items-end gap-2 bg-[#F5F7FA] shadow-clay-inset rounded-[12px] border border-[#E2E8F0] p-2 focus-within:bg-white focus-within:ring-1 focus-within:ring-[#00153D] transition-all">
                    <button className="p-2 text-[#64748B] hover:text-[#0F172A] rounded-full transition-colors flex-shrink-0">
                      <Paperclip size={20} />
                    </button>
                    <textarea 
                      placeholder="Nhập tin nhắn..." 
                      className="flex-1 max-h-32 bg-transparent resize-none outline-none py-2 text-body text-[#0F172A]"
                      rows={1}
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                    ></textarea>
                    <Button size="sm" className="mb-0.5 px-4" onClick={handleSend}>Gửi API</Button>
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
      )}
    </div>
  );
}
