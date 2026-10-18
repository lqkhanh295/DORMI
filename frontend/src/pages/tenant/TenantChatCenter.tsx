import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';
import { Hand, Paperclip, MessageCircle } from 'lucide-react';
import { messagesApi } from '../../services/api';
import { signalRService } from '../../services/signalr';
import { chatMessageItemVariants } from '../../utils/motion';

export default function TenantChatCenter() {
  const { currentUser, messages, sendMessageWithApi, fetchMessageHistoryWithApi, likedRoommates } = useStore();
  const location = useLocation();
  const [inputText, setInputText] = useState('');
  const [apiConversations, setApiConversations] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Parse location state passed from RoomDetail
  const targetUserId = location.state?.targetUserId;
  const targetUserName = location.state?.targetUserName;
  const targetUserRole = location.state?.targetUserRole;

  // SignalR real-time messaging connection
  useEffect(() => {
    if (currentUser?.id) {
      signalRService.startConnection(currentUser.id, currentUser.token);
    }
    return () => {
      // Keep alive during chat session
    };
  }, [currentUser?.id, currentUser?.token]);

  // Load active conversations from backend on mount
  useEffect(() => {
    messagesApi.getConversations()
      .then(res => {
        if (Array.isArray(res)) {
          setApiConversations(res);
        }
      })
      .catch(() => {});
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
    const existing = contactsMap.get(c.otherUserId);
    if (!existing) {
      contactsMap.set(c.otherUserId, {
        id: c.otherUserId,
        name: c.otherUserName || 'Người dùng',
        role: 'User',
        online: true,
        avatar: c.otherUserAvatar || '',
        lastMessage: c.lastMessage
      });
    } else {
      if (c.otherUserName && (existing.name === 'Chủ trọ' || existing.name === 'Người dùng')) {
        existing.name = c.otherUserName;
      }
      if (c.otherUserAvatar && !existing.avatar) {
        existing.avatar = c.otherUserAvatar;
      }
      if (c.lastMessage) {
        existing.lastMessage = c.lastMessage;
      }
    }
  });

  if (targetUserId && targetUserName) {
    const target = contactsMap.get(targetUserId);
    if (target && (target.name === 'Người dùng' || target.name === 'Chủ trọ' || !target.name)) {
      target.name = targetUserName;
    }
  }


  // Liked Roommates (Real DB profiles only)
  (likedRoommates || [])
    .filter(r => r && r.customerId)
    .forEach(r => {
      const rId = r.customerId!;
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
    if (selectedContact?.id) {
      setLoadingHistory(true);
      fetchMessageHistoryWithApi(selectedContact.id)
        .finally(() => setLoadingHistory(false));
    }
  }, [selectedContact?.id]);

  const chatMessages = messages.filter(m => {
    const s = (m.senderId || '').toLowerCase();
    const r = (m.receiverId || '').toLowerCase();
    const u = (currentUser?.id || '').toLowerCase();
    const c = (selectedContact?.id || '').toLowerCase();
    return (s === u && r === c) || (s === c && r === u);
  });

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = async () => {
    if (!inputText.trim() || !selectedContact) return;
    const msgText = inputText;
    setInputText('');
    setApiConversations(prev => {
      const idx = prev.findIndex(c => c.otherUserId === selectedContact.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], lastMessage: msgText, lastMessageTime: new Date().toISOString() };
        return updated;
      }
      return prev;
    });
    await sendMessageWithApi(selectedContact.id, msgText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 min-h-0 flex bg-white rounded-[18px] shadow-clay-soft overflow-hidden border border-[#E2E8F0]">
      {/* Sidebar */}
          <div className="hidden md:flex w-1/3 border-r border-[#E2E8F0] flex-col bg-[#F8FAFC]">
            <div className="p-4 border-b border-[#E2E8F0] bg-white">
              <input 
                type="text" 
                placeholder="Tìm kiếm tin nhắn..." 
                className="w-full bg-[#F8FAFC] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00153D]"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {contacts.length === 0 ? (
                <div className="p-6 text-center text-[#64748B] text-caption space-y-2">
                  <MessageCircle size={24} className="mx-auto text-[#94A3B8]" />
                  <p>Chưa có cuộc trò chuyện nào</p>
                </div>
              ) : (
                contacts.map(contact => {
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
                    className={`p-4 border-b border-[#E2E8F0] cursor-pointer transition-colors duration-150 flex gap-3 ${
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
                        <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {contact.role === 'Landlord' ? 'Chủ nhà' : (contact.role === 'Roommate' ? 'Bạn ở ghép' : 'Liên hệ')}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${isSelected ? 'font-semibold text-[#00153D]' : 'text-[#64748B]'}`}>
                        {lastMessage}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 min-w-0 flex flex-col bg-white">
            {selectedContact ? (
              <>
                <div className="h-16 shrink-0 border-b border-[#E2E8F0] px-6 flex items-center justify-between bg-white z-10">
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
                        <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {selectedContact.role === 'Landlord' ? 'Chủ nhà' : (selectedContact.role === 'Roommate' ? 'Bạn ở ghép' : 'Liên hệ')}
                        </span>
                      </h3>
                      <p className="text-xs text-[#16803C] font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#16803C] block"></span> Trực tuyến
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  ref={messagesContainerRef}
                  className="flex-1 p-4 overflow-y-auto bg-[#F8FAFC] flex flex-col gap-3"
                >
                  <div className="text-center">
                    <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md font-medium">Hôm nay</span>
                  </div>
                  
                  {loadingHistory ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#64748B]">
                      <div className="w-8 h-8 border-4 border-[#00153D] border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p>Đang tải tin nhắn...</p>
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#64748B]">
                      <div className="w-16 h-16 bg-white shadow-clay-soft rounded-full flex items-center justify-center text-[#00153D] mb-4">
                        <Hand size={32} />
                      </div>
                      <p>Hãy gửi tin nhắn đầu tiên đến {selectedContact.name}!</p>
                    </div>
                  ) : null}

                  {!loadingHistory && chatMessages.map(msg => {
                    const isMe = (msg.senderId || '').toLowerCase() === (currentUser?.id || '').toLowerCase();
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
                      </motion.div>
                    );
                  })}
                </div>

                <div className="p-4 border-t border-[#E2E8F0] bg-white shrink-0">
                  <div className="flex items-end gap-2 bg-[#F8FAFC] shadow-clay-inset rounded-[12px] border border-[#E2E8F0] p-2 focus-within:bg-white focus-within:ring-1 focus-within:ring-[#00153D] transition-[background-color,box-shadow,border-color] duration-150">
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
                    <Button size="sm" className="mb-0.5 px-4" onClick={handleSend}>Gửi</Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#64748B] p-6 space-y-3">
                <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center text-[#94A3B8]">
                  <MessageCircle size={32} />
                </div>
                <h3 className="font-bold text-[#0F172A] text-h3">Chưa có hội thoại</h3>
                <p className="text-body text-center max-w-sm">
                  {contacts.length === 0
                    ? 'Bạn chưa có cuộc trò chuyện nào. Hãy kết nối với bạn ở ghép hoặc liên hệ chủ phòng trọ để bắt đầu trao đổi.'
                    : 'Chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu trò chuyện.'}
                </p>
              </div>
            )}
          </div>
    </div>
  );
}
