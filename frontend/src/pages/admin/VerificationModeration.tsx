import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function VerificationModeration() {
  const [queue, setQueue] = useState([
    { id: 1, name: 'Trần Thị C', time: '2 giờ trước', status: 'Chờ duyệt', email: 'tranthic@example.com', phone: '0901234567' },
    { id: 2, name: 'Lê Văn B', time: '3 giờ trước', status: 'Chờ duyệt', email: 'levanb@example.com', phone: '0907654321' },
    { id: 3, name: 'Nguyễn Thị A', time: '5 giờ trước', status: 'Chờ duyệt', email: 'nguyenthia@example.com', phone: '0901112233' },
    { id: 4, name: 'Phạm Văn D', time: '1 ngày trước', status: 'Chờ duyệt', email: 'phamvand@example.com', phone: '0909998877' }
  ]);
  const [selectedId, setSelectedId] = useState(1);

  const selectedItem = queue.find(item => item.id === selectedId);

  const handleAction = (id: number) => {
    const newQueue = queue.filter(item => item.id !== id);
    setQueue(newQueue);
    if (newQueue.length > 0) setSelectedId(newQueue[0].id);
    else setSelectedId(0);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Xác thực danh tính</h1>
          <p className="text-gray-500">Xem xét hồ sơ của chủ phòng để cấp huy hiệu Xác minh.</p>
        </div>
        <div className="flex gap-2 text-sm text-gray-500">
          <span>{queue.length} hồ sơ đang chờ</span>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left Column: Queue List */}
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
          {queue.length === 0 && (
            <p className="text-gray-500 text-center py-8 bg-white rounded-xl">Không có yêu cầu xác thực nào.</p>
          )}
          {queue.map(item => (
            <Card 
              key={item.id} 
              onClick={() => setSelectedId(item.id)}
              className={`p-4 cursor-pointer transition-micro ${selectedId === item.id ? 'border-2 border-blue-500 bg-blue-50/30' : 'hover:border-blue-300 bg-white'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Đã nộp: {item.time}</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">{item.status}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">CCCD/CMND</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">Giấy phép KD</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Right Column: Split View Detail */}
        {selectedItem ? (
          <Card className="flex-1 flex flex-col p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Hồ sơ của {selectedItem.name}</h2>
              <div className="flex gap-2">
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleAction(selectedItem.id)}>Từ chối</Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(selectedItem.id)}>Phê duyệt & Xác thực</Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Thông tin người dùng</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div><p className="text-xs text-gray-500">Họ và tên</p><p className="font-medium text-gray-900">{selectedItem.name}</p></div>
                  <div><p className="text-xs text-gray-500">Số điện thoại</p><p className="font-medium text-gray-900">{selectedItem.phone}</p></div>
                  <div><p className="text-xs text-gray-500">Email đăng ký</p><p className="font-medium text-gray-900">{selectedItem.email}</p></div>
                  <div><p className="text-xs text-gray-500">Vai trò</p><p className="font-medium text-gray-900">Chủ phòng</p></div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Căn cước công dân (CCCD)</h3>
                <div className="flex gap-4 h-64">
                  <div className="flex-1 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300 relative">
                    <span className="text-gray-400 font-medium">Mặt trước</span>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/20 transition-micro cursor-zoom-in">🔍</div>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300 relative">
                    <span className="text-gray-400 font-medium">Mặt sau</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Giấy phép kinh doanh / Quyền sở hữu</h3>
                <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
                  <span className="text-gray-400 font-medium">Ảnh chụp tài liệu</span>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="flex-1 flex flex-col p-6 items-center justify-center text-gray-500">
            <p>Chọn một hồ sơ để xem chi tiết.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
