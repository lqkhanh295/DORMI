import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function LandlordDashboard() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Landlord Overview</h1>
          <p className="text-gray-500">Manage your properties and analyze leads.</p>
        </div>
        <Button onClick={() => navigate('/landlord/rooms')}>+ Add New Listing</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-green-50 border-none">
          <h3 className="text-sm font-medium text-green-600 uppercase tracking-wide">Active Listings</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">4</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Leads (30d)</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">142</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Trust Score</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">98/100</p>
        </Card>
      </div>

      {/* Conversion Funnel Placeholder */}
      <Card className="p-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Lead Analytics Funnel</h3>
          <span className="text-sm text-gray-500">All properties</span>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Views</span>
            <span className="font-medium">1,240</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-blue-200 h-2 rounded-full" style={{width: '100%'}}></div></div>
          
          <div className="flex justify-between text-sm pt-2">
            <span>Saves</span>
            <span className="font-medium">210</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-blue-400 h-2 rounded-full" style={{width: '20%'}}></div></div>
          
          <div className="flex justify-between text-sm pt-2">
            <span>Contacts</span>
            <span className="font-medium">42</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{width: '5%'}}></div></div>
        </div>
      </Card>
    </div>
  );
}
