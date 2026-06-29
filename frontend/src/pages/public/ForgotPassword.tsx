import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function ForgotPassword() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-neutral-50 px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-blue-600 text-2xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-gray-500 text-sm mt-2">Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        <form className="space-y-6">
          <Input label="Email address" type="email" placeholder="you@example.com" required />
          <Button type="submit" fullWidth>Send Reset Link</Button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/auth" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-micro flex items-center justify-center gap-1">
            <span>←</span> Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
}
