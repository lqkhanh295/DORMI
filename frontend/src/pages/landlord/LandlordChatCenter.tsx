import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';

export default function LandlordChatCenter() {
  const { currentUser, messages, sendMessage } = useStore();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const TENANT_ID = 'u1';
  const chatMessages = messages.filter(m => 
    (m.senderId === currentUser?.id && m.receiverId === TENANT_ID) ||
    (m.senderId === TENANT_ID && m.receiverId === currentUser?.id)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(TENANT_ID, inputText);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ponytail: LandlordChatCenter using Level 2 Soft Clay container, Inset Clay input, Deep Navy sent messages
  return (
    <div className="flex h-[calc(100vh-10rem)] bg-white rounded-[18px] shadow-clay-soft overflow-hidden border border-[#E2E8F0]">
      {/* Sidebar: Conversation List */}
      <div className="hidden md:flex w-1/3 border-r border-[#E2E8F0] flex-col bg-[#F5F7FA]">
        <div className="p-4 border-b border-[#E2E8F0] bg-white">
          <input 
            type="text" 
            placeholder="Tìm kiếm hội thoại..." 
            className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00153D]"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-[#E2E8F0] cursor-pointer transition-all flex gap-3 bg-white border-l-4 border-l-[#00153D]">
            <div className="w-10 h-10 rounded-full bg-[#00153D] text-white flex-shrink-0 flex items-center justify-center font-bold">
              A
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="font-bold text-[#0F172A] truncate">Alex Nguyen (Người thuê)</h4>
              </div>
              <p className="text-sm truncate font-semibold text-[#00153D]">
                {chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].text : 'Bắt đầu trò chuyện'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="h-16 border-b border-[#E2E8F0] px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00153D] text-white flex items-center justify-center font-bold">A</div>
            <div>
              <h3 className="font-bold text-[#0F172A]">Alex Nguyen</h3>
              <p className="text-xs text-[#16803C] font-semibold flex items-center gap-1">● Trực tuyến (Đang tìm Studio)</p>
            </div>
          </div>
          <div className="hidden md:flex gap-2">
            <Button variant="secondary" size="sm">Hẹn lịch xem phòng</Button>
            <Button variant="primary" size="sm">Tạo hợp đồng</Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#F5F7FA] flex flex-col gap-4">
          <div className="text-center">
            <span className="text-caption text-[#64748B] bg-white border border-[#E2E8F0] px-3 py-1 rounded-full font-medium">Hôm nay</span>
          </div>
          
          {chatMessages.map(msg => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-[#00153D] text-white flex-shrink-0 mt-auto flex items-center justify-center font-bold text-xs">A</div>
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

        {/* Input Area */}
        <div className="p-4 border-t border-[#E2E8F0] bg-white">
          <div className="flex items-end gap-2 bg-[#F5F7FA] shadow-clay-inset rounded-[12px] border border-[#E2E8F0] p-2 focus-within:bg-white focus-within:ring-1 focus-within:ring-[#00153D] transition-all">
            <button className="p-2 text-[#64748B] hover:text-[#0F172A] rounded-full transition-colors flex-shrink-0">
              📎
            </button>
            <textarea 
              placeholder="Trả lời Alex..." 
              className="flex-1 max-h-32 bg-transparent resize-none outline-none py-2 text-body text-[#0F172A]"
              rows={1}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            ></textarea>
            <Button size="sm" className="mb-0.5 px-4" onClick={handleSend}>Gửi</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
