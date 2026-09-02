import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function VerificationModeration() {
  const [queue, setQueue] = useState([
    { id: 1, name: 'Trần Thị C', time: '2 giờ trước', status: 'Chờ duyệt', email: 'tranthic@example.com', phone: '0901234567' },
    { id: 2, name: 'Lê Văn B', time: '3 giờ trước', status: 'Chờ duyệt', email: 'levanb@example.com', phone: '0907654321' },
    { id: 3, name: 'Nguyễn Thị A', time: '5 giờ trước', status: 'Chờ duyệt', email: 'nguyenthia@example.com', phone: '0901112233' },
  ]);
  const [selectedId, setSelectedId] = useState(1);

  const selectedItem = queue.find(item => item.id === selectedId);

  const handleAction = (id: number) => {
    const newQueue = queue.filter(item => item.id !== id);
    setQueue(newQueue);
    if (newQueue.length > 0) setSelectedId(newQueue[0].id);
    else setSelectedId(0);
  };

  // ponytail: VerificationModeration using Level 1 Primary Clay detail panel and Level 2 Soft Clay queue list
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#F5F7FA]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h2 font-bold text-[#0F172A]">Xác thực danh tính chủ trọ</h1>
          <p className="text-body text-[#64748B]">Xem xét hồ sơ chủ phòng để duyệt huy hiệu Xác minh.</p>
        </div>
        <div className="flex gap-2 text-caption font-semibold text-[#64748B]">
          <span>{queue.length} hồ sơ đang chờ</span>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left Column: Queue List */}
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
          {queue.length === 0 && (
            <p className="text-[#64748B] text-center py-8 bg-white rounded-[18px] shadow-clay-soft">Không có yêu cầu xác thực nào.</p>
          )}
          {queue.map(item => (
            <Card 
              key={item.id} 
              onClick={() => setSelectedId(item.id)}
              className={`p-4 cursor-pointer transition-all rounded-[18px] ${selectedId === item.id ? 'bg-white shadow-clay-primary border-2 border-[#00153D]' : 'bg-white shadow-clay-soft hover:-translate-y-[2px]'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-[#0F172A] text-body">{item.name}</p>
                  <p className="text-caption text-[#64748B] mt-1">Đã nộp: {item.time}</p>
                </div>
                <span className="bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] text-caption font-bold px-2.5 py-0.5 rounded-full">{item.status}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <span className="text-caption bg-[#F5F7FA] border border-[#E2E8F0] px-2.5 py-1 rounded-full text-[#64748B] font-semibold">CCCD/CMND</span>
                <span className="text-caption bg-[#F5F7FA] border border-[#E2E8F0] px-2.5 py-1 rounded-full text-[#64748B] font-semibold">Giấy phép KD</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Right Column: Split View Detail */}
        {selectedItem ? (
          <Card className="flex-1 flex flex-col p-6 overflow-hidden bg-white rounded-[18px] shadow-clay-primary border-none">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E2E8F0]">
              <h2 className="text-h3 font-bold text-[#0F172A]">Hồ sơ của {selectedItem.name}</h2>
              <div className="flex gap-2">
                <Button variant="secondary" className="bg-[#FEF2F2] text-[#C62828] border border-[#FECACA]" onClick={() => handleAction(selectedItem.id)}>Từ chối</Button>
                <Button variant="primary" onClick={() => handleAction(selectedItem.id)}>Phê duyệt & Xác thực</Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6">
              <div>
                <h3 className="text-caption font-semibold text-[#64748B] uppercase tracking-wider mb-3">Thông tin người dùng</h3>
                <div className="grid grid-cols-2 gap-4 bg-[#F5F7FA] shadow-clay-inset p-4 rounded-[12px]">
                  <div><p className="text-caption text-[#64748B]">Họ và tên</p><p className="font-bold text-[#0F172A] text-body">{selectedItem.name}</p></div>
                  <div><p className="text-caption text-[#64748B]">Số điện thoại</p><p className="font-bold text-[#0F172A] text-body">{selectedItem.phone}</p></div>
                  <div><p className="text-caption text-[#64748B]">Email đăng ký</p><p className="font-bold text-[#0F172A] text-body">{selectedItem.email}</p></div>
                  <div><p className="text-caption text-[#64748B]">Vai trò</p><p className="font-bold text-[#0F172A] text-body">Chủ phòng</p></div>
                </div>
              </div>

              <div>
                <h3 className="text-caption font-semibold text-[#64748B] uppercase tracking-wider mb-3">Căn cước công dân (CCCD)</h3>
                <div className="flex gap-4 h-56">
                  <div className="flex-1 bg-[#EEF2F6] rounded-[14px] flex items-center justify-center border border-[#E2E8F0] relative">
                    <span className="text-[#64748B] font-semibold text-caption">Mặt trước CCCD</span>
                  </div>
                  <div className="flex-1 bg-[#EEF2F6] rounded-[14px] flex items-center justify-center border border-[#E2E8F0] relative">
                    <span className="text-[#64748B] font-semibold text-caption">Mặt sau CCCD</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="flex-1 flex flex-col p-6 items-center justify-center text-[#64748B] bg-white rounded-[18px] shadow-clay-soft">
            <p className="text-body font-semibold">Chọn một hồ sơ để xem chi tiết.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
