import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';
import { Hand, Paperclip } from 'lucide-react';

export default function TenantChatCenter() {
  const { currentUser, messages, sendMessage, likedRoommates } = useStore();
  const location = useLocation();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Khởi tạo danh sách liên hệ (contacts) bao gồm Landlord (hardcode) và Roommates đã thích
  const contacts = [
    { id: 'u2', name: 'Le Van B', role: 'Landlord', online: true, avatar: '' },
    ...likedRoommates.map(r => ({
      id: `r${r.id}`, // prefix 'r' để tránh trùng lặp id nếu có
      name: r.name,
      role: 'Roommate',
      online: false,
      avatar: r.image
    }))
  ];

  const initialContactId = location.state?.targetUserId || contacts[0]?.id;
  const [selectedContactId, setSelectedContactId] = useState(initialContactId);
  const selectedContact = contacts.find(c => c.id === selectedContactId) || contacts[0];

  const chatMessages = messages.filter(m => 
    (m.senderId === currentUser?.id && m.receiverId === selectedContact?.id) ||
    (m.senderId === selectedContact?.id && m.receiverId === currentUser?.id)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    if (!inputText.trim() || !selectedContact) return;
    sendMessage(selectedContact.id, inputText);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-card overflow-hidden border border-neutral-200">
      {/* Sidebar: Conversation List */}
      <div className="hidden md:flex w-1/3 border-r border-gray-200 flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <input 
            type="text" 
            placeholder="Tìm kiếm tin nhắn..." 
            className="w-full bg-neutral-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.map(contact => {
            const isSelected = contact.id === selectedContactId;
            // Lấy tin nhắn cuối cùng với contact này
            const contactMessages = messages.filter(m => 
              (m.senderId === currentUser?.id && m.receiverId === contact.id) ||
              (m.senderId === contact.id && m.receiverId === currentUser?.id)
            );
            const lastMessage = contactMessages.length > 0 ? contactMessages[contactMessages.length - 1].text : 'Bắt đầu trò chuyện';

            return (
              <div 
                key={contact.id} 
                onClick={() => setSelectedContactId(contact.id)}
                className={`p-4 border-b border-neutral-100 cursor-pointer transition-micro flex gap-3 ${isSelected ? 'bg-primary-50/80 border-l-4 border-l-primary-500' : 'hover:bg-neutral-50'}`}
              >
                {contact.avatar ? (
                  <img src={contact.avatar} alt={contact.name} className="w-11 h-11 rounded-full object-cover shadow-sm" />
                ) : (
                  <div className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center font-bold shadow-sm ${contact.role === 'Landlord' ? 'bg-orange-100 text-orange-700' : 'bg-primary-100 text-primary-700'}`}>
                    {contact.name.charAt(0)}
                  </div>
                )}
                
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-900 truncate">{contact.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${contact.role === 'Landlord' ? 'bg-orange-100 text-orange-700' : 'bg-pink-100 text-pink-700'}`}>
                      {contact.role === 'Landlord' ? 'Chủ nhà' : 'Bạn ở ghép'}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${isSelected ? 'font-medium text-primary-800' : 'text-neutral-500'}`}>
                    {lastMessage}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        {selectedContact ? (
          <>
            <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedContact.avatar ? (
                  <img src={selectedContact.avatar} alt={selectedContact.name} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm ${selectedContact.role === 'Landlord' ? 'bg-orange-100 text-orange-700' : 'bg-primary-100 text-primary-700'}`}>
                    {selectedContact.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    {selectedContact.name}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedContact.role === 'Landlord' ? 'bg-orange-100 text-orange-700' : 'bg-pink-100 text-pink-700'}`}>
                      {selectedContact.role === 'Landlord' ? 'Chủ nhà' : 'Bạn ở ghép'}
                    </span>
                  </h3>
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 block"></span> {selectedContact.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              {selectedContact.role === 'Landlord' && (
                <Button variant="outline" size="sm">Xem phòng trọ</Button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-neutral-50/50 flex flex-col gap-3">
              <div className="text-center">
                <span className="text-[11px] text-neutral-400 bg-neutral-100 px-2.5 py-0.5 rounded-full font-medium">Hôm nay</span>
              </div>
              
              {chatMessages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
                  <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center text-primary-500 mb-4">
                    <Hand size={32} />
                  </div>
                  <p>Hãy gửi lời chào đến {selectedContact.name}!</p>
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
                          <div className={`w-8 h-8 rounded-full flex-shrink-0 mt-auto flex items-center justify-center font-bold text-xs ${selectedContact.role === 'Landlord' ? 'bg-orange-100 text-orange-700' : 'bg-primary-100 text-primary-700'}`}>
                            {selectedContact.name.charAt(0)}
                          </div>
                        )
                      )}
                      <div className={`${isMe ? 'bg-primary-600 text-white rounded-xl rounded-tr-sm' : 'bg-white border border-neutral-100 text-neutral-900 rounded-xl rounded-bl-sm'} p-2.5 shadow-sm`}>
                        <p className="text-[13px] whitespace-pre-wrap">{msg.text}</p>
                        <span className={`text-[10px] block mt-1 ${isMe ? 'text-primary-200 text-right' : 'text-neutral-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end gap-2 bg-neutral-50 rounded-xl border border-neutral-200 p-2 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-micro">
                <button className="p-2 text-neutral-400 hover:text-primary-600 rounded-full transition-colors flex-shrink-0">
                  <Paperclip size={20} />
                </button>
                <textarea 
                  placeholder="Nhập tin nhắn..." 
                  className="flex-1 max-h-32 bg-transparent resize-none outline-none py-2 text-sm text-gray-900"
                  rows={1}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                ></textarea>
                <Button size="sm" className="mb-0.5 rounded-lg px-4" onClick={handleSend}>Gửi</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Chọn một cuộc hội thoại để bắt đầu
          </div>
        )}
      </div>
    </div>
  );
}
