import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function AdminDashboard() {
  const [verifications, setVerifications] = useState([
    { id: 1, name: 'Nguyen Van A', doc: 'Submitted ID & Business License' },
    { id: 2, name: 'Tran Thi B', doc: 'Submitted ID Only' },
    { id: 3, name: 'Le Ngoc C', doc: 'Submitted Business License' }
  ]);

  const [reports, setReports] = useState([
    { id: 1, title: 'Suspicious Listing #1001', reason: 'AI detected 98% match with known scam photos' },
    { id: 2, title: 'Suspicious Listing #1002', reason: 'Multiple user reports for fake address' }
  ]);

  const handleReview = (id: number) => {
    setVerifications(verifications.filter(v => v.id !== id));
  };

  const handleReportAction = (id: number) => {
    setReports(reports.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
          <p className="text-gray-500">Platform macro-statistics and moderation queue.</p>
        </div>
        <Button variant="outline">Download Report</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">12,450</p>
          <span className="text-xs text-green-600 font-medium">+12% this month</span>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Active Listings</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">3,210</p>
          <span className="text-xs text-green-600 font-medium">+5% this month</span>
        </Card>
        <Card className="p-6 bg-red-50 border-none">
          <h3 className="text-sm font-medium text-red-600 uppercase">Pending Verifications</h3>
          <p className="text-3xl font-bold text-red-700 mt-2">{84 - (3 - verifications.length)}</p>
          <span className="text-xs text-red-500 font-medium">Requires immediate action</span>
        </Card>
        <Card className="p-6 bg-yellow-50 border-none">
          <h3 className="text-sm font-medium text-yellow-700 uppercase">Reported Content</h3>
          <p className="text-3xl font-bold text-yellow-800 mt-2">{10 + reports.length}</p>
          <span className="text-xs text-yellow-600 font-medium">Scam or policy violations</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Verifications Queue</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {verifications.length === 0 && <p className="text-gray-500">No pending verifications.</p>}
            {verifications.map(v => (
              <div key={v.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                    {v.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{v.name}</p>
                    <p className="text-xs text-gray-500">{v.doc}</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => handleReview(v.id)}>Review</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">AI Flagged Content</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {reports.length === 0 && <p className="text-gray-500">No flagged content.</p>}
            {reports.map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                <div>
                  <p className="font-semibold text-red-900">{r.title}</p>
                  <p className="text-xs text-red-700">{r.reason}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleReportAction(r.id)}>Ignore</Button>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleReportAction(r.id)}>Takedown</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
