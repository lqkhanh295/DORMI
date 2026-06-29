import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function VerificationModeration() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Identity Verification</h1>
          <p className="text-gray-500">Review landlord submissions to grant Verified Badges.</p>
        </div>
        <div className="flex gap-2 text-sm text-gray-500">
          <span>84 Pending in queue</span>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left Column: Queue List */}
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
          {[1,2,3,4,5].map(i => (
            <Card key={i} className={`p-4 cursor-pointer transition-micro ${i===1 ? 'border-2 border-blue-500' : 'hover:border-blue-300'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-900">Tran Thi C</p>
                  <p className="text-xs text-gray-500 mt-1">Submitted: 2 hours ago</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Pending</span>
              </div>
              <div className="mt-3 flex gap-2">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">ID Card</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">Business License</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Right Column: Split View Detail */}
        <Card className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Tran Thi C's Submission</h2>
            <div className="flex gap-2">
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
              <Button className="bg-green-600 hover:bg-green-700">Approve & Verify</Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">User Information</h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div><p className="text-xs text-gray-500">Full Name</p><p className="font-medium text-gray-900">Tran Thi C</p></div>
                <div><p className="text-xs text-gray-500">Phone</p><p className="font-medium text-gray-900">0901234567</p></div>
                <div><p className="text-xs text-gray-500">Registered Email</p><p className="font-medium text-gray-900">tranthic@example.com</p></div>
                <div><p className="text-xs text-gray-500">Role</p><p className="font-medium text-gray-900">Landlord</p></div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">ID Card (CCCD)</h3>
              <div className="flex gap-4 h-64">
                <div className="flex-1 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300 relative">
                  <span className="text-gray-400 font-medium">Front Side Image</span>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/20 transition-micro cursor-zoom-in">🔍</div>
                </div>
                <div className="flex-1 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300 relative">
                  <span className="text-gray-400 font-medium">Back Side Image</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Business License / Property Ownership</h3>
              <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
                <span className="text-gray-400 font-medium">Document Image</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
