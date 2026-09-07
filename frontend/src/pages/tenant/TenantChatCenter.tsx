import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';
import { Hand, Paperclip } from 'lucide-react';
import { messagesApi } from '../../services/api';

export default function TenantChatCenter() {
  const { currentUser, messages, sendMessageWithApi, likedRoommates } = useStore();
  const location = useLocation();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contacts = [
    { id: 'u2', name: 'Lê Văn B (Chủ nhà)', role: 'Landlord', online: true, avatar: '' },
    ...likedRoommates.map(r => ({
      id: `r${r.id}`,
      name: r.name,
      role: 'Roommate',
      online: false,
      avatar: r.image
    }))
  ];

  const initialContactId = location.state?.targetUserId || contacts[0]?.id;
  const [selectedContactId, setSelectedContactId] = useState(initialContactId);
  const selectedContact = contacts.find(c => c.id === selectedContactId) || contacts[0];

  useEffect(() => {
    if (selectedContact) {
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
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-[18px] shadow-clay-soft overflow-hidden border border-[#E2E8F0]">
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
            const lastMessage = contactMessages.length > 0 ? contactMessages[contactMessages.length - 1].text : 'Bắt đầu trò chuyện (API Connected)';

            return (
              <div 
                key={contact.id} 
                onClick={() => setSelectedContactId(contact.id)}
                className={`p-4 border-b border-[#E2E8F0] cursor-pointer transition-all flex gap-3 ${isSelected ? 'bg-white font-semibold border-l-4 border-l-[#00153D] shadow-sm' : 'hover:bg-white/50'}`}
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
                      {contact.role === 'Landlord' ? 'Chủ nhà' : 'Bạn ở ghép'}
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
                      {selectedContact.role === 'Landlord' ? 'Chủ nhà' : 'Bạn ở ghép'}
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
  );
}
