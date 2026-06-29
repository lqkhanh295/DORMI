import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = {
  // --- PUBLIC PAGES ---
  'src/pages/public/LandingPage.tsx': `import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="px-4 py-20 text-center bg-blue-50">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
          Find your perfect <span className="text-blue-600">room</span> & <span className="text-blue-600">roommate</span>.
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Dormi uses AI to match you with compatible roommates and verifies every listing with a Smart Trust Score.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/search"><Button size="lg">Explore Rooms</Button></Link>
          <Link to="/tenant/match"><Button variant="outline" size="lg">Find Roommates</Button></Link>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-2xl shadow-card col-span-1 md:col-span-2">
            <h3 className="text-2xl font-semibold mb-2">Smart AI Matching</h3>
            <p className="text-gray-500">Our recommendation engine analyzes lifestyle tags to find your ideal roommate match.</p>
          </div>
          <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-card">
            <h3 className="text-2xl font-semibold mb-2">3D Virtual Tours</h3>
            <p className="text-blue-100">Step inside your new home before you even visit.</p>
          </div>
          <div className="bg-green-50 p-8 rounded-2xl shadow-card">
            <h3 className="text-2xl font-semibold text-green-900 mb-2">Verified Trust Score</h3>
            <p className="text-green-700">Every landlord is verified to protect you from scams.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-card col-span-1 md:col-span-2 border border-gray-100">
            <h3 className="text-2xl font-semibold mb-2">Zero Hassle Booking</h3>
            <p className="text-gray-500">Schedule viewings, chat with landlords, and secure your room all in one place.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
`,
  'src/pages/public/AuthPage.tsx': `import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export default function AuthPage() {
  const [role, setRole] = useState<'Tenant' | 'Landlord'>('Tenant');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('user_role', role);
    if (role === 'Tenant') navigate('/tenant');
    else navigate('/landlord');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-neutral-50 px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-gray-500 mt-2">Please select your role to continue.</p>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
          <button 
            className={\`flex-1 py-2 text-sm font-medium rounded-md transition-micro \${role === 'Tenant' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}\`}
            onClick={() => setRole('Tenant')}
          >
            Tenant
          </button>
          <button 
            className={\`flex-1 py-2 text-sm font-medium rounded-md transition-micro \${role === 'Landlord' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}\`}
            onClick={() => setRole('Landlord')}
          >
            Landlord
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input label="Email address" type="email" placeholder="you@example.com" required />
          <Input label="Password" type="password" placeholder="••••••••" required />
          <Button type="submit" fullWidth>Sign in as {role}</Button>
        </form>
      </Card>
    </div>
  );
}
`,
  'src/pages/tenant/TenantDashboard.tsx': `import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function TenantDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenant Dashboard</h1>
          <p className="text-gray-500">Welcome back, here is your activity overview.</p>
        </div>
        <Button>Search New Rooms</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-blue-50 border-none">
          <h3 className="text-sm font-medium text-blue-600 uppercase tracking-wide">Upcoming Viewings</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">2</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Saved Rooms</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Roommate Matches</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">5</p>
        </Card>
      </div>
      
      {/* Activity list placeholder */}
      <Card className="p-6 mt-8">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="text-sm text-gray-500 py-4 border-t border-gray-100">
          Viewing scheduled for "Cozy Studio near Campus" on 12/07/2026.
        </div>
      </Card>
    </div>
  );
}
`,
  'src/pages/landlord/LandlordDashboard.tsx': `import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function LandlordDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Landlord Overview</h1>
          <p className="text-gray-500">Manage your properties and analyze leads.</p>
        </div>
        <Button>+ Add New Listing</Button>
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
`
};

for (const [filepath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(__dirname, filepath), content);
  console.log("Created " + filepath);
}
