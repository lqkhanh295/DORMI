import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';


export default function LeadAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phân tích hiệu quả</h1>
          <p className="text-gray-500">Theo dõi hiệu suất của các tin đăng qua từng giai đoạn chuyển đổi.</p>
        </div>
        <select className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Tất cả phòng</option>
          <option>Studio Quận 3</option>
          <option>Căn hộ 2PN Q7</option>
        </select>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Lượt xem & Tương tác (30 Ngày)</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs text-gray-500"><div className="w-3 h-3 bg-blue-600 rounded-sm"></div> Lượt xem</span>
              <span className="flex items-center gap-1 text-xs text-gray-500"><div className="w-3 h-3 bg-blue-300 rounded-sm"></div> Đã lưu</span>
            </div>
          </div>
          {/* Fake Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-2 border-b border-l border-gray-200 pb-2 pl-2">
            {[40, 60, 30, 80, 50, 90, 45, 70, 35, 85].map((val, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full flex justify-center items-end gap-1">
                  <div className="w-full max-w-[12px] bg-blue-300 rounded-t-sm" style={{height: `${val * 0.3}%`}}></div>
                  <div className="w-full max-w-[12px] bg-blue-600 rounded-t-sm" style={{height: `${val}%`}}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
            <span>1 Thg 5</span>
            <span>15 Thg 5</span>
            <span>30 Thg 5</span>
          </div>
        </Card>

        {/* Funnel */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Phễu chuyển đổi</h3>
            <div className="space-y-6">
              <div className="relative">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-medium text-gray-700">Lượt xem tin đăng</span>
                  <span className="text-lg font-bold text-gray-900">1,240</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{width: '100%'}}></div>
                </div>
              </div>
              <div className="relative">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-medium text-gray-700">Lượt thích (Lưu)</span>
                  <span className="text-lg font-bold text-gray-900">210</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{width: '17%'}}></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 text-right">tỉ lệ chuyển đổi 17%</p>
              </div>
              <div className="relative">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-medium text-gray-700">Liên hệ / Chat</span>
                  <span className="text-lg font-bold text-gray-900">42</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-blue-400 h-full rounded-full" style={{width: '3.3%'}}></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 text-right">tỉ lệ chuyển đổi 3.3%</p>
              </div>
            </div>
          </div>
          <Button variant="outline" className="mt-8 w-full">Xuất dữ liệu</Button>
        </Card>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Các phòng hiệu quả nhất</h3>
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lượt xem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liên hệ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-md"></div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">Studio Cao Cấp</div>
                    <div className="text-sm text-gray-500">Quận 3</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Còn trống</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">842</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">28</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Button size="sm" variant="ghost" className="text-blue-600">Đẩy tin</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
