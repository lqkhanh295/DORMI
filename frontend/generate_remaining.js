import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultTemplate = (name) => \`import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function \${name}() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">\${name}</h1>
          <p className="text-gray-500">Manage your \${name.toLowerCase()} here.</p>
        </div>
        <Button>Action</Button>
      </div>
      <Card className="p-6">
        <p className="text-gray-600">This is the \${name} view. UI elements will be populated here.</p>
      </Card>
    </div>
  );
}
\`;

const files = [
  'src/pages/public/SearchResults.tsx',
  'src/pages/public/RoomDetail.tsx',
  'src/pages/public/ForgotPassword.tsx',
  'src/pages/tenant/RoommateMatcher.tsx',
  'src/pages/tenant/CreateRoommatePost.tsx',
  'src/pages/tenant/TenantChatCenter.tsx',
  'src/pages/tenant/TenantProfile.tsx',
  'src/pages/tenant/TenantSettings.tsx',
  'src/pages/landlord/LeadAnalytics.tsx',
  'src/pages/landlord/SmartListingForm.tsx',
  'src/pages/landlord/RoomManagement.tsx',
  'src/pages/landlord/TenantDiscovery.tsx',
  'src/pages/landlord/PricingCheckout.tsx',
  'src/pages/landlord/BillingHistory.tsx',
  'src/pages/landlord/VerificationCenter.tsx',
  'src/pages/landlord/LandlordChatCenter.tsx',
  'src/pages/landlord/LandlordSettings.tsx',
  'src/pages/admin/AdminDashboard.tsx',
  'src/pages/admin/VerificationModeration.tsx',
  'src/pages/admin/ContentModeration.tsx',
];

for (const filepath of files) {
  const name = path.basename(filepath, '.tsx');
  fs.writeFileSync(path.join(__dirname, filepath), defaultTemplate(name));
  console.log("Created " + filepath);
}
