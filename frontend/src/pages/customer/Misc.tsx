import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GlassCard } from '../../components/ui/GlassCard';
import { Send, MoreVertical, Image as ImageIcon } from 'lucide-react';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';

const MOCK_CONVERSATIONS = [
  { id: 1, name: 'Nguyễn Văn Chủ', role: 'Landlord', avatar: 'Landlord', lastMessage: 'Phòng còn nha em.', unread: 2, time: '10:30' },
  { id: 2, name: 'Lê Minh Tuấn', role: 'Roommate', avatar: 'Tuan', lastMessage: 'Ok bạn, tối nay gặp.', unread: 0, time: 'Hôm qua' },
];

export function Messages() {
  const location = useLocation();
  const autoMessage = location.state?.autoMessage;
  
  const [activeChat, setActiveChat] = useState(MOCK_CONVERSATIONS[0]);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Chào em, em muốn hỏi phòng nào?', sender: 'them', time: '10:00' },
    { id: 2, text: 'Dạ, phòng studio bên Nguyễn Hữu Cảnh ạ.', sender: 'me', time: '10:15' },
    { id: 3, text: 'Phòng còn nha em.', sender: 'them', time: '10:30' },
  ]);
  const [input, setInput] = useState('');

  // Handle autoMessage from Contextual Chat
  useEffect(() => {
    if (autoMessage) {
      setMessages(prev => [...prev, { id: Date.now(), text: autoMessage, sender: 'me', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    }
  }, [autoMessage]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), text: input, sender: 'me', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setInput('');
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-4">
      {/* Cột trái: Danh sách hội thoại (30%) */}
      <GlassCard className="w-1/3 !p-0 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/20 bg-white/30 backdrop-blur-md">
          <h2 className="text-xl font-bold">Tin nhắn</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {MOCK_CONVERSATIONS.map(conv => (
            <div 
              key={conv.id} 
              onClick={() => setActiveChat(conv)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${activeChat.id === conv.id ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/40'}`}
            >
              <div className="relative">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.avatar}`} alt="avatar" className="w-12 h-12 rounded-full bg-slate-200" />
                {conv.unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold border-2 border-white">
                    {conv.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-bold text-sm truncate">{conv.name}</h4>
                  <span className="text-xs text-foreground/50">{conv.time}</span>
                </div>
                <p className={`text-sm truncate ${conv.unread > 0 ? 'font-bold text-foreground' : 'text-foreground/60'}`}>
                  {conv.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Cột phải: Khung chat chi tiết (70%) */}
      <GlassCard className="flex-1 !p-0 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="h-16 px-6 border-b border-white/20 bg-white/30 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat.avatar}`} alt="avatar" className="w-10 h-10 rounded-full bg-slate-200" />
            <div>
              <h3 className="font-bold">{activeChat.name}</h3>
              <p className="text-xs text-emerald-600 font-medium">{activeChat.role}</p>
            </div>
          </div>
          <button className="p-2 hover:bg-white/50 rounded-full text-foreground/60">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col max-w-[75%] ${msg.sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`}>
              <div className={`px-4 py-2 rounded-2xl ${
                msg.sender === 'me' 
                  ? 'bg-primary text-white rounded-br-none shadow-md' 
                  : 'bg-white/80 border border-white/40 text-foreground rounded-bl-none shadow-sm'
              }`}>
                {msg.text}
              </div>
              <span className="text-xs text-foreground/40 mt-1">{msg.time}</span>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white/30 backdrop-blur-md border-t border-white/20 flex gap-2 items-center">
          <button className="p-2 text-primary hover:bg-white/50 rounded-full transition-colors">
            <ImageIcon className="w-6 h-6" />
          </button>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập tin nhắn..." 
            className="flex-1 bg-white/70 border border-white/40 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <GlassButton onClick={handleSend} className="!rounded-full !p-3">
            <Send className="w-5 h-5" />
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
}

export function SavedRooms() {
  return (
    <GlassCard className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
      <h2 className="text-2xl font-bold mb-2">Phòng đã lưu</h2>
      <p className="text-foreground/60">Danh sách các phòng bạn đã thích sẽ hiển thị ở đây.</p>
    </GlassCard>
  );
}
