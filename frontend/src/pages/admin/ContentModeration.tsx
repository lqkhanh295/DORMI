import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function ContentModeration() {
  const [reports, setReports] = useState([
    { id: 1, type: 'Listing', target: 'Luxury 1BR Apartment - Thao Dien', reason: 'Fake photos', reporter: 'alex.nguyen', status: 'Pending' },
    { id: 2, type: 'User', target: 'Le Van B', reason: 'Spam messages', reporter: 'minh.tran', status: 'Pending' },
  ]);

  const [selectedReport, setSelectedReport] = useState<number | null>(null);

  const handleAction = (id: number, action: 'takedown' | 'ignore') => {
    setReports(reports.filter(r => r.id !== id));
    setSelectedReport(null);
    alert(`Report ${action === 'takedown' ? 'taken down' : 'ignored'} successfully.`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-500">Review reported listings and user behavior.</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Panel - Queue */}
        <div className="w-1/3 flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex justify-between">
              Pending Reports
              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{reports.length}</span>
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {reports.map(report => (
              <div 
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-3 rounded-lg cursor-pointer border transition-micro ${selectedReport === report.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 hover:border-blue-200'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded uppercase">{report.type}</span>
                  <span className="text-xs text-gray-500">2h ago</span>
                </div>
                <p className="font-medium text-gray-900 text-sm line-clamp-1">{report.target}</p>
                <p className="text-xs text-gray-500 mt-1">Reason: <span className="font-medium">{report.reason}</span></p>
              </div>
            ))}
            {reports.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">
                No pending reports.
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Details */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          {selectedReport ? (
            <>
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Report Details</h2>
                    <p className="text-sm text-gray-500">Reported by: <span className="font-medium">{reports.find(r => r.id === selectedReport)?.reporter}</span></p>
                  </div>
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">Pending Review</span>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                <Card className="p-4 bg-gray-50 border-dashed border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-2">Report Target</h4>
                  <p className="text-gray-900">{reports.find(r => r.id === selectedReport)?.target}</p>
                </Card>
                <Card className="p-4 bg-red-50 border-red-100 mt-4 text-red-900">
                  <h4 className="font-semibold mb-2 text-red-800">Violation Reason</h4>
                  <p>{reports.find(r => r.id === selectedReport)?.reason}</p>
                </Card>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => handleAction(selectedReport, 'ignore')}>Ignore Report</Button>
                <Button variant="primary" className="bg-red-600 hover:bg-red-700 focus:ring-red-500" onClick={() => handleAction(selectedReport, 'takedown')}>Take Down Content</Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Select a report from the queue to review</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
