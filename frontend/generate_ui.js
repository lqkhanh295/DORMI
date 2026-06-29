import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure directories exist
const dirs = [
  'src/components/ui',
  'src/layouts',
  'src/components/shared'
];
dirs.forEach(d => fs.mkdirSync(path.join(__dirname, d), { recursive: true }));

const files = {
  // --- COMPONENTS ---
  'src/components/ui/Button.tsx': `import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg transition-micro focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-800",
    outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button 
      className={\`\${baseStyle} \${variants[variant]} \${sizes[size]} \${widthStyle} \${className}\`}
      {...props}
    >
      {children}
    </button>
  );
};
`,
  'src/components/ui/Input.tsx': `import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
        <input
          ref={ref}
          className={\`w-full rounded-lg border \${error ? 'border-red-500' : 'border-gray-300'} bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-micro \${className}\`}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
`,
  'src/components/ui/Card.tsx': `import React from 'react';

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={\`bg-white rounded-xl shadow-card overflow-hidden \${className}\`}>
    {children}
  </div>
);
`,

  // --- LAYOUTS ---
  'src/layouts/MainLayout.tsx': `import { Outlet, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <header className="sticky top-0 z-50 glass-panel border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-gray-900">
            DORMI.
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link to="/search" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-micro">Find Rooms</Link>
            <Link to="/tenant/match" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-micro">Roommates</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/auth"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link to="/auth"><Button variant="primary" size="sm">Sign up</Button></Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">© 2026 Dormi Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
`,
  'src/layouts/TenantLayout.tsx': `import { Outlet, Link } from 'react-router-dom';

export default function TenantLayout() {
  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-6">
          <Link to="/" className="text-xl font-bold tracking-tight text-gray-900">DORMI.</Link>
        </div>
        <nav className="px-4 py-4 space-y-1">
          <Link to="/tenant" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-900 bg-gray-100">Dashboard</Link>
          <Link to="/tenant/match" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">Roommates</Link>
          <Link to="/tenant/chat" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">Messages</Link>
          <Link to="/tenant/profile" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">Profile</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">T</div>
        </header>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
`,
  'src/layouts/LandlordLayout.tsx': `import { Outlet, Link } from 'react-router-dom';

export default function LandlordLayout() {
  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white hidden md:block">
        <div className="p-6">
          <Link to="/" className="text-xl font-bold tracking-tight text-white">DORMI <span className="text-blue-400 text-xs ml-1">LANDLORD</span></Link>
        </div>
        <nav className="px-4 py-4 space-y-1">
          <Link to="/landlord" className="block px-3 py-2 rounded-md text-sm font-medium text-white bg-gray-800">Overview</Link>
          <Link to="/landlord/rooms" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800">My Properties</Link>
          <Link to="/landlord/analytics" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800">Analytics</Link>
          <Link to="/landlord/chat" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800">Messages</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">L</div>
        </header>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
`
};

for (const [filepath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(__dirname, filepath), content);
  console.log("Created " + filepath);
}
