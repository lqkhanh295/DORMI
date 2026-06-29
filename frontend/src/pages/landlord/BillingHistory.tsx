import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function BillingHistory() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing History</h1>
          <p className="text-gray-500">Manage your balance and download invoices.</p>
        </div>
        <Button>Deposit Funds</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gray-900 text-white flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Current Balance</h3>
            <p className="text-4xl font-bold mt-2">1.500.000₫</p>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-xs text-gray-300">Auto-renewal enabled for 2 listings</span>
          </div>
        </Card>

        <Card className="p-6 md:col-span-2 border-dashed border-2 border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Upgrade to Pro Landlord</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">Get 10 premium pushes per month, priority AI review, and advanced analytics for 500k/mo.</p>
          </div>
          <Button variant="outline" className="bg-white">View Plans</Button>
        </Card>
      </div>

      <Card className="mt-8 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
          <button className="text-sm text-blue-600 font-medium hover:underline">Download All (CSV)</button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">28/06/2026</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Listing Boost (Studio D3)</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">- 50.000₫</td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800 font-medium">Completed</span></td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><Button size="sm" variant="ghost">PDF</Button></td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">25/06/2026</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Funds Deposit (Momo)</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+ 1.000.000₫</td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800 font-medium">Completed</span></td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><Button size="sm" variant="ghost">PDF</Button></td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">01/06/2026</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Pro Landlord Subscription</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">- 500.000₫</td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800 font-medium">Completed</span></td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><Button size="sm" variant="ghost">PDF</Button></td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
