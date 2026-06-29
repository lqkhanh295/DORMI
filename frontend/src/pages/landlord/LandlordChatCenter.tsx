import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';

export default function LandlordChatCenter() {
  const { currentUser, messages, sendMessage } = useStore();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // We hardcode the conversation with tenant (u1) for MVP
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

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-white rounded-2xl shadow-card overflow-hidden border border-gray-100">
      {/* Sidebar: Conversation List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="w-full bg-gray-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-gray-100 cursor-pointer transition-micro flex gap-3 bg-blue-50/50">
            <div className="w-10 h-10 rounded-full bg-green-100 flex-shrink-0 flex items-center justify-center text-green-700 font-bold">
              A
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="font-semibold text-gray-900 truncate">Alex Nguyen (Tenant)</h4>
              </div>
              <p className="text-sm truncate font-medium text-gray-900">
                {chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].text : 'Start a conversation'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">A</div>
            <div>
              <h3 className="font-bold text-gray-900">Alex Nguyen</h3>
              <p className="text-xs text-green-600 font-medium flex items-center gap-1">● Online (Looking for Studio)</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Schedule Viewing</Button>
            <Button variant="primary" size="sm">Create Contract</Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto bg-white flex flex-col gap-4">
          <div className="text-center">
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Today</span>
          </div>
          
          {chatMessages.map(msg => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex-shrink-0 mt-auto flex items-center justify-center text-green-700 font-bold text-xs">A</div>
                  )}
                  <div className={`${isMe ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm'} p-3 shadow-sm`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <span className={`text-[10px] block mt-1 ${isMe ? 'text-blue-200 text-right' : 'text-gray-400'}`}>
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
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-end gap-2 bg-white rounded-xl border border-gray-200 p-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-micro">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-micro">
              📎
            </button>
            <textarea 
              placeholder="Reply to Alex..." 
              className="flex-1 max-h-32 bg-transparent resize-none outline-none py-2 text-sm text-gray-900"
              rows={1}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            ></textarea>
            <Button size="sm" className="mb-0.5 rounded-lg px-4" onClick={handleSend}>Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
