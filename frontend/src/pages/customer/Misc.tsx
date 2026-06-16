import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Image as ImageIcon, MoreVertical, Send } from 'lucide-react';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassCard } from '../../components/ui/GlassCard';

const MOCK_CONVERSATIONS = [
  { id: 1, name: 'Nguyễn Văn Chủ', role: 'Chủ phòng', avatar: 'Landlord', lastMessage: 'Phòng còn nha em.', unread: 2, time: '10:30' },
  { id: 2, name: 'Lê Minh Tuấn', role: 'Roommate', avatar: 'Tuan', lastMessage: 'Ok bạn, tối nay gặp.', unread: 0, time: 'Hôm qua' },
];

export function Messages() {
  const location = useLocation();
  const autoMessage = location.state?.autoMessage;
  const [activeChat, setActiveChat] = useState(MOCK_CONVERSATIONS[0]);
  const [messages, setMessages] = useState(() => {
    const baseMessages = [
      { id: 1, text: 'Chào em, em muốn hỏi phòng nào?', sender: 'them', time: '10:00' },
      { id: 2, text: 'Dạ, phòng studio bên Nguyễn Hữu Cảnh ạ.', sender: 'me', time: '10:15' },
      { id: 3, text: 'Phòng còn nha em.', sender: 'them', time: '10:30' },
    ];

    if (!autoMessage) return baseMessages;

    return [
      ...baseMessages,
      { id: Date.now(), text: autoMessage, sender: 'me', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ];
  });
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), text: input, sender: 'me', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
  };

  return (
    <div className="flex h-[calc(100vh-170px)] gap-4">
      <GlassCard noPadding tone="solid" className="hidden w-80 flex-col overflow-hidden md:flex">
        <div className="border-b border-line p-4">
          <h2 className="text-xl font-extrabold">Tin nhắn</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {MOCK_CONVERSATIONS.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => setActiveChat(conversation)}
              className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                activeChat.id === conversation.id ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50'
              }`}
            >
              <div className="relative">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.avatar}`} alt={conversation.name} className="h-12 w-12 rounded-full bg-slate-100" />
                {conversation.unread > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">{conversation.unread}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-baseline justify-between">
                  <h4 className="truncate text-sm font-bold">{conversation.name}</h4>
                  <span className="text-xs text-muted">{conversation.time}</span>
                </div>
                <p className="truncate text-sm text-muted">{conversation.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard noPadding tone="solid" className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-16 items-center justify-between border-b border-line px-6">
          <div className="flex items-center gap-3">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat.avatar}`} alt={activeChat.name} className="h-10 w-10 rounded-full bg-slate-100" />
            <div>
              <h3 className="font-bold">{activeChat.name}</h3>
              <p className="text-xs font-semibold text-emerald-600">{activeChat.role}</p>
            </div>
          </div>
          <button className="rounded-full p-2 text-muted hover:bg-slate-100" aria-label="Tùy chọn">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-slate-50 p-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex max-w-[75%] flex-col ${message.sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`}>
              <div className={`rounded-2xl px-4 py-2 ${message.sender === 'me' ? 'rounded-br-sm bg-primary text-white' : 'rounded-bl-sm bg-white text-foreground shadow-sm'}`}>
                {message.text}
              </div>
              <span className="mt-1 text-xs text-muted">{message.time}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-line bg-white p-4">
          <button className="rounded-full p-2 text-primary hover:bg-blue-50" aria-label="Gửi ảnh">
            <ImageIcon className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSend()}
            placeholder="Nhập tin nhắn..."
            className="h-11 flex-1 rounded-full border border-line bg-white px-4 focus:outline-none focus:ring-4 focus:ring-primary/10"
          />
          <GlassButton onClick={handleSend} className="!rounded-full !px-4" aria-label="Gửi tin nhắn">
            <Send className="w-5 h-5" />
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
}

export function SavedRooms() {
  return (
    <GlassCard tone="solid" className="mx-auto flex h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
      <h2 className="mb-2 text-2xl font-extrabold">Phòng đã lưu</h2>
      <p className="text-muted">Những phòng bạn đã thích sẽ hiển thị ở đây để so sánh và đặt lịch sau.</p>
    </GlassCard>
  );
}
