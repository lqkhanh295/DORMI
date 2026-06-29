import { Button } from '../../components/ui/Button';

export default function TenantChatCenter() {
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
          {[1,2,3].map(i => (
            <div key={i} className={`p-4 border-b border-gray-100 cursor-pointer transition-micro flex gap-3 ${i===1 ? 'bg-blue-50/50' : 'hover:bg-gray-100'}`}>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-700 font-bold">
                {i === 1 ? 'L' : 'R'}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-semibold text-gray-900 truncate">{i === 1 ? 'Le Van B (Landlord)' : 'Alex (Roommate Match)'}</h4>
                  <span className="text-xs text-gray-500">10:42 AM</span>
                </div>
                <p className={`text-sm truncate ${i===1 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                  {i === 1 ? 'Yes, the room is still available.' : 'Sounds good! See you then.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">L</div>
            <div>
              <h3 className="font-bold text-gray-900">Le Van B</h3>
              <p className="text-xs text-green-600 font-medium flex items-center gap-1">● Online</p>
            </div>
          </div>
          <Button variant="outline" size="sm">View Listing</Button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto bg-white flex flex-col gap-4">
          <div className="text-center">
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Today, 9:00 AM</span>
          </div>
          
          <div className="flex justify-end">
            <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-[70%] shadow-sm">
              <p className="text-sm">Hi, I'm interested in the Studio in District 3. Is it still available for viewing tomorrow?</p>
              <span className="text-[10px] text-blue-200 block text-right mt-1">9:05 AM</span>
            </div>
          </div>
          
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[70%]">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 mt-auto flex items-center justify-center text-blue-700 font-bold text-xs">L</div>
              <div className="bg-gray-100 text-gray-900 p-3 rounded-2xl rounded-bl-sm shadow-sm">
                <p className="text-sm">Hello! Yes, the room is still available. I can show you around tomorrow at 2 PM. Does that work for you?</p>
                <span className="text-[10px] text-gray-400 block mt-1">10:42 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-end gap-2 bg-white rounded-xl border border-gray-200 p-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-micro">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-micro">
              📎
            </button>
            <textarea 
              placeholder="Type your message..." 
              className="flex-1 max-h-32 bg-transparent resize-none outline-none py-2 text-sm text-gray-900"
              rows={1}
            ></textarea>
            <Button size="sm" className="mb-0.5 rounded-lg px-4">Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
