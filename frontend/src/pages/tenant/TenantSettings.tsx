import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function TenantSettings() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500">Manage your preferences, security, and notifications.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4">
          {/* Settings Sidebar */}
          <div className="bg-gray-50 border-r border-gray-100 p-4 space-y-2">
            <button className="w-full text-left px-4 py-2 bg-white rounded-lg text-sm font-medium text-blue-600 shadow-sm border border-gray-200">Notifications</button>
            <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-micro">Privacy & Security</button>
            <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-micro">Connected Apps</button>
            <button className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-micro mt-8">Danger Zone</button>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-3 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Email Notifications</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">New Roommate Matches</h4>
                  <p className="text-xs text-gray-500">Get notified when AI finds a &gt;90% match.</p>
                </div>
                <div className="w-11 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Chat Messages</h4>
                  <p className="text-xs text-gray-500">Email me when I receive a new message and I'm offline.</p>
                </div>
                <div className="w-11 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Marketing & Promos</h4>
                  <p className="text-xs text-gray-500">Receive offers from verified landlords.</p>
                </div>
                <div className="w-11 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm"></div>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2 mt-8">Push Notifications</h2>
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Enable Push Notifications</p>
                <p className="text-xs text-blue-700">Stay updated even when the app is closed.</p>
              </div>
              <Button size="sm">Enable</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
