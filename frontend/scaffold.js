import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pages = [
  // Public
  { path: 'pages/public/LandingPage.tsx', name: 'LandingPage' },
  { path: 'pages/public/SearchResults.tsx', name: 'SearchResults' },
  { path: 'pages/public/RoomDetail.tsx', name: 'RoomDetail' },
  { path: 'pages/public/AuthPage.tsx', name: 'AuthPage' },
  { path: 'pages/public/ForgotPassword.tsx', name: 'ForgotPassword' },
  
  // Tenant
  { path: 'pages/tenant/TenantDashboard.tsx', name: 'TenantDashboard' },
  { path: 'pages/tenant/RoommateMatcher.tsx', name: 'RoommateMatcher' },
  { path: 'pages/tenant/CreateRoommatePost.tsx', name: 'CreateRoommatePost' },
  { path: 'pages/tenant/TenantChatCenter.tsx', name: 'TenantChatCenter' },
  { path: 'pages/tenant/TenantProfile.tsx', name: 'TenantProfile' },
  { path: 'pages/tenant/TenantSettings.tsx', name: 'TenantSettings' },
  
  // Landlord
  { path: 'pages/landlord/LandlordDashboard.tsx', name: 'LandlordDashboard' },
  { path: 'pages/landlord/LeadAnalytics.tsx', name: 'LeadAnalytics' },
  { path: 'pages/landlord/SmartListingForm.tsx', name: 'SmartListingForm' },
  { path: 'pages/landlord/RoomManagement.tsx', name: 'RoomManagement' },
  { path: 'pages/landlord/TenantDiscovery.tsx', name: 'TenantDiscovery' },
  { path: 'pages/landlord/PricingCheckout.tsx', name: 'PricingCheckout' },
  { path: 'pages/landlord/BillingHistory.tsx', name: 'BillingHistory' },
  { path: 'pages/landlord/VerificationCenter.tsx', name: 'VerificationCenter' },
  { path: 'pages/landlord/LandlordChatCenter.tsx', name: 'LandlordChatCenter' },
  { path: 'pages/landlord/LandlordSettings.tsx', name: 'LandlordSettings' },
  
  // Admin
  { path: 'pages/admin/AdminDashboard.tsx', name: 'AdminDashboard' },
  { path: 'pages/admin/VerificationModeration.tsx', name: 'VerificationModeration' },
  { path: 'pages/admin/ContentModeration.tsx', name: 'ContentModeration' },

  // Layouts
  { path: 'layouts/MainLayout.tsx', name: 'MainLayout', isLayout: true },
  { path: 'layouts/TenantLayout.tsx', name: 'TenantLayout', isLayout: true },
  { path: 'layouts/LandlordLayout.tsx', name: 'LandlordLayout', isLayout: true },
  { path: 'layouts/AdminLayout.tsx', name: 'AdminLayout', isLayout: true },
];

pages.forEach(page => {
  const fullPath = path.join(__dirname, 'src', page.path);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const content = page.isLayout 
    ? `import { Outlet } from 'react-router-dom';\n\nexport default function ${page.name}() {\n  return (\n    <div className="min-h-screen bg-neutral-50">\n      {/* Navbar goes here */}\n      <main>\n        <Outlet />\n      </main>\n    </div>\n  );\n}\n`
    : `export default function ${page.name}() {\n  return (\n    <div className="p-8">\n      <h1 className="text-2xl font-semibold text-gray-800">${page.name}</h1>\n      <p className="mt-4 text-gray-600">This is the ${page.name} screen.</p>\n    </div>\n  );\n}\n`;

  fs.writeFileSync(fullPath, content);
  console.log(`Created ${page.path}`);
});
