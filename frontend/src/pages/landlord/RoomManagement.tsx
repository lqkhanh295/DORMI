import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { roomsApi, type RoomResponse } from '../../services/api';
import { toast } from 'sonner';

export default function RoomManagement() {
  const [myRooms, setMyRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState<RoomResponse | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newRoom, setNewRoom] = useState({
    title: '',
    price: 0,
    address: '',
    roomType: 'Studio',
    description: 'Phòng trọ mới đăng',
    area: 25,
    utilities: 'Wifi, Máy lạnh'
  });

  const loadRooms = async () => {
    try {
      setLoading(true);
      const res = await roomsApi.getRooms({ page: 1, pageSize: 50 });
      if (res?.data) {
        setMyRooms(res.data);
      }
    } catch (err) {
      console.warn('Failed to load rooms from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    try {
      await roomsApi.updateRoom(editingRoom.id, {
        title: editingRoom.title,
        description: editingRoom.description || 'Mô tả phòng trọ',
        price: editingRoom.price,
        area: editingRoom.area || 25,
        utilities: editingRoom.utilities || 'Wifi',
        roomType: editingRoom.roomType || 'Studio',
        address: editingRoom.address,
        status: editingRoom.status
      });
      toast.success('Đã lưu thay đổi thông tin phòng (API)!');
      setEditingRoom(null);
      loadRooms();
    } catch {
      toast.error('Không thể lưu thay đổi.');
    }
  };

  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await roomsApi.createRoom({
        title: newRoom.title,
        price: newRoom.price,
        address: newRoom.address,
        roomType: newRoom.roomType,
        description: newRoom.description,
        area: newRoom.area,
        utilities: newRoom.utilities,
        imageUrls: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80']
      });
      toast.success('Tạo tin đăng phòng trọ mới thành công (API)!');
      setIsAdding(false);
      setNewRoom({ title: '', price: 0, address: '', roomType: 'Studio', description: 'Phòng trọ mới đăng', area: 25, utilities: 'Wifi, Máy lạnh' });
      loadRooms();
    } catch {
      toast.error('Không thể thêm phòng trọ mới.');
    }
  };

  return (
    <div className="space-y-6 relative bg-[#F5F7FA]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-bold text-[#0F172A]">Phòng của tôi (API Connected)</h1>
          <p className="text-body text-[#64748B]">Quản lý danh sách phòng trọ và tình trạng cho thuê thời gian thực.</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>+ Thêm phòng mới</Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-12 text-center text-[#64748B] bg-white rounded-[18px]">Đang tải danh sách phòng...</div>
        ) : (
          myRooms.map(room => (
            <Card key={room.id} className="flex flex-col md:flex-row p-4 gap-6 items-center bg-white rounded-[18px] shadow-clay-soft border-none hover:-translate-y-[2px] transition-all">
              <div className="w-full h-48 md:w-48 md:h-32 bg-[#EEF2F6] rounded-[14px] overflow-hidden shrink-0">
                <img 
                  src={room.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80'} 
                  className="w-full h-full object-cover" 
                  alt="Room" 
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-h3 text-[#0F172A]">{room.title}</h3>
                  <span className={`px-3 py-1 text-caption font-bold rounded-full border ${room.status === 0 ? 'bg-[#F0FDF4] text-[#16803C] border-[#DCFCE7]' : 'bg-[#F5F7FA] text-[#64748B] border-[#E2E8F0]'}`}>
                    {room.status === 0 ? 'Còn trống' : 'Đã thuê'}
                  </span>
                </div>
                <p className="text-[#64748B] text-caption">{room.address}</p>
                <div className="flex flex-wrap gap-4 text-caption pt-1">
                  <p><span className="font-semibold text-[#0F172A]">Giá:</span> {Number(room.price).toLocaleString('vi-VN')}₫/tháng</p>
                  <p><span className="font-semibold text-[#0F172A]">Diện tích:</span> {room.area}m²</p>
                  <p><span className="font-semibold text-[#0F172A]">Loại:</span> {room.roomType}</p>
                </div>
              </div>
              <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                <Button variant="secondary" size="sm" className="w-full" onClick={() => setEditingRoom(room)}>Sửa API</Button>
              </div>
            </Card>
          ))
        )}
        {!loading && myRooms.length === 0 && (
          <div className="py-12 text-center text-[#64748B] bg-white rounded-[18px] shadow-clay-soft border border-dashed border-[#E2E8F0]">
            Bạn chưa có phòng trọ nào. Hãy bấm "+ Thêm phòng mới" để tạo bài đăng!
          </div>
        )}
      </div>

      {editingRoom && (
        <div className="fixed inset-0 bg-[#0F172A]/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 bg-white rounded-[18px] shadow-clay-primary border-none">
            <h2 className="text-h2 font-bold text-[#0F172A] mb-4">Chỉnh sửa phòng (API)</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-caption font-semibold text-[#64748B] mb-1">Tiêu đề</label>
                <input 
                  type="text" 
                  value={editingRoom.title}
                  onChange={e => setEditingRoom({...editingRoom, title: e.target.value})}
                  className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-caption font-semibold text-[#64748B] mb-1">Giá (VNĐ)</label>
                <input 
                  type="number" 
                  value={editingRoom.price}
                  onChange={e => setEditingRoom({...editingRoom, price: Number(e.target.value)})}
                  className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-caption font-semibold text-[#64748B] mb-1">Trạng thái</label>
                <select 
                  value={editingRoom.status}
                  onChange={e => setEditingRoom({...editingRoom, status: Number(e.target.value)})}
                  className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white min-h-[44px]"
                >
                  <option value={0}>Còn trống</option>
                  <option value={1}>Đã thuê</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="secondary" onClick={() => setEditingRoom(null)}>Hủy</Button>
                <Button type="submit">Lưu vào Backend API</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-[#0F172A]/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 bg-white rounded-[18px] shadow-clay-primary border-none">
            <h2 className="text-h2 font-bold text-[#0F172A] mb-4">Thêm phòng mới (API)</h2>
            <form onSubmit={handleAddNew} className="space-y-4">
              <div>
                <label className="block text-caption font-semibold text-[#64748B] mb-1">Tiêu đề</label>
                <input 
                  type="text" 
                  required
                  value={newRoom.title}
                  onChange={e => setNewRoom({...newRoom, title: e.target.value})}
                  className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
                  placeholder="VD: Căn hộ Studio Quận 1"
                />
              </div>
              <div>
                <label className="block text-caption font-semibold text-[#64748B] mb-1">Địa chỉ</label>
                <input 
                  type="text" 
                  required
                  value={newRoom.address}
                  onChange={e => setNewRoom({...newRoom, address: e.target.value})}
                  className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
                  placeholder="VD: 123 Nguyễn Trãi, Q1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-caption font-semibold text-[#64748B] mb-1">Giá (VNĐ)</label>
                  <input 
                    type="number" 
                    required
                    value={newRoom.price || ''}
                    onChange={e => setNewRoom({...newRoom, price: Number(e.target.value)})}
                    className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
                    placeholder="5000000"
                  />
                </div>
                <div>
                  <label className="block text-caption font-semibold text-[#64748B] mb-1">Loại phòng</label>
                  <select 
                    value={newRoom.roomType}
                    onChange={e => setNewRoom({...newRoom, roomType: e.target.value})}
                    className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white min-h-[44px]"
                  >
                    <option value="Studio">Studio</option>
                    <option value="1 Bedroom">1 Phòng ngủ</option>
                    <option value="Phòng trọ">Phòng trọ</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>Hủy</Button>
                <Button type="submit">Gửi API Tạo tin</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
