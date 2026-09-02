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
    <div className="flex h-[calc(100vh-10rem)] bg-white rounded-bento shadow-card overflow-hidden border border-border-subtle">
      {/* Sidebar: Conversation List */}
      <div className="hidden md:flex w-1/3 border-r border-border-subtle flex-col bg-surface">
        <div className="p-4 border-b border-border-subtle bg-white">
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="w-full bg-surface-alt rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-border-subtle cursor-pointer transition-micro flex gap-3 bg-primary-soft/50">
            <div className="w-10 h-10 rounded-pill bg-green-100 flex-shrink-0 flex items-center justify-center text-green-700 font-bold">
              A
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="font-semibold text-text-primary truncate">Alex Nguyen (Tenant)</h4>
              </div>
              <p className="text-sm truncate font-medium text-text-primary">
                {chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].text : 'Start a conversation'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 border-b border-border-subtle px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-pill bg-green-100 flex items-center justify-center text-green-700 font-bold">A</div>
            <div>
              <h3 className="font-bold text-text-primary">Alex Nguyen</h3>
              <p className="text-xs text-green-600 font-medium flex items-center gap-1">● Online (Looking for Studio)</p>
            </div>
          </div>
          <div className="hidden md:flex gap-2">
            <Button variant="outline" size="sm">Schedule Viewing</Button>
            <Button variant="primary" size="sm">Create Contract</Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto bg-white flex flex-col gap-4">
          <div className="text-center">
            <span className="text-xs text-text-muted bg-surface px-2 py-1 rounded-pill">Today</span>
          </div>
          
          {chatMessages.map(msg => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-pill bg-green-100 flex-shrink-0 mt-auto flex items-center justify-center text-green-700 font-bold text-xs">A</div>
                  )}
                  <div className={`${isMe ? 'bg-primary text-white rounded-bento rounded-tr-sm' : 'bg-surface-alt text-text-primary rounded-bento rounded-bl-sm'} p-3 shadow-sm`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <span className={`text-[10px] block mt-1 ${isMe ? 'text-blue-200 text-right' : 'text-text-muted'}`}>
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
        <div className="p-4 border-t border-border-subtle bg-surface">
          <div className="flex items-end gap-2 bg-white rounded-md border border-border-subtle p-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-micro">
            <button className="p-2 text-text-muted hover:text-text-secondary rounded-pill transition-micro">
              📎
            </button>
            <textarea 
              placeholder="Reply to Alex..." 
              className="flex-1 max-h-32 bg-transparent resize-none outline-none py-2 text-sm text-text-primary"
              rows={1}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            ></textarea>
            <Button size="sm" className="mb-0.5 rounded-md px-4" onClick={handleSend}>Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
