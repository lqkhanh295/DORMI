import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function TenantSettings() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Account Settings</h1>
        <p className="text-text-secondary">Manage your preferences, security, and notifications.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4">
          {/* Settings Sidebar */}
          <div className="bg-surface border-r border-border-subtle p-4 space-y-2">
            <button className="w-full text-left px-4 py-2 bg-white rounded-md text-sm font-medium text-primary shadow-sm border border-border-subtle">Notifications</button>
            <button className="w-full text-left px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-alt rounded-md transition-micro">Privacy & Security</button>
            <button className="w-full text-left px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-alt rounded-md transition-micro">Connected Apps</button>
            <button className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-micro mt-8">Danger Zone</button>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-3 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-text-primary border-b border-border-subtle pb-2">Email Notifications</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-text-primary">New Roommate Matches</h4>
                  <p className="text-xs text-text-secondary">Get notified when AI finds a &gt;90% match.</p>
                </div>
                <div className="w-11 h-6 bg-primary rounded-pill relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-pill absolute right-1 top-1"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-text-primary">Chat Messages</h4>
                  <p className="text-xs text-text-secondary">Email me when I receive a new message and I'm offline.</p>
                </div>
                <div className="w-11 h-6 bg-primary rounded-pill relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-pill absolute right-1 top-1"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-text-primary">Marketing & Promos</h4>
                  <p className="text-xs text-text-secondary">Receive offers from verified landlords.</p>
                </div>
                <div className="w-11 h-6 bg-gray-200 rounded-pill relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-pill absolute left-1 top-1 shadow-sm"></div>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-text-primary border-b border-border-subtle pb-2 mt-8">Push Notifications</h2>
            <div className="bg-primary-soft border border-blue-100 p-4 rounded-md flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Enable Push Notifications</p>
                <p className="text-xs text-primary-dark">Stay updated even when the app is closed.</p>
              </div>
              <Button size="sm">Enable</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
