import { useState } from 'react';
import { useStore, type Listing } from '../../store/useStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function RoomManagement() {
  const { currentUser, listings, updateListing, addListing } = useStore();
  const myRooms = listings.filter(room => room.landlordId === currentUser?.id);
  
  const [editingRoom, setEditingRoom] = useState<Listing | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newRoom, setNewRoom] = useState({
    title: '',
    price: 0,
    address: '',
    type: 'Studio'
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      updateListing(editingRoom.id, {
        title: editingRoom.title,
        price: editingRoom.price,
        status: editingRoom.status
      });
      setEditingRoom(null);
    }
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    addListing({
      title: newRoom.title,
      price: newRoom.price,
      address: newRoom.address,
      type: newRoom.type,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80',
      trustScore: 100,
      status: 'Available',
      views: 0,
      leads: 0
    });
    setIsAdding(false);
    setNewRoom({ title: '', price: 0, address: '', type: 'Studio' });
  };

  // ponytail: RoomManagement using Functional Clay (Level 2 Soft Clay property cards, Inset Clay modal inputs)
  return (
    <div className="space-y-6 relative bg-[#F5F7FA]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-bold text-[#0F172A]">Phòng của tôi</h1>
          <p className="text-body text-[#64748B]">Quản lý danh sách phòng trọ và tình trạng cho thuê.</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>+ Thêm phòng mới</Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {myRooms.map(room => (
          <Card key={room.id} className="flex flex-col md:flex-row p-4 gap-6 items-center bg-white rounded-[18px] shadow-clay-soft border-none hover:-translate-y-[2px] transition-all">
            <div className="w-full h-48 md:w-48 md:h-32 bg-[#EEF2F6] rounded-[14px] overflow-hidden shrink-0">
              <img src={room.image} className="w-full h-full object-cover" alt="Room" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-h3 text-[#0F172A]">{room.title}</h3>
                <span className={`px-3 py-1 text-caption font-bold rounded-full border ${room.status === 'Available' ? 'bg-[#F0FDF4] text-[#16803C] border-[#DCFCE7]' : 'bg-[#F5F7FA] text-[#64748B] border-[#E2E8F0]'}`}>
                  {room.status === 'Available' ? 'Còn trống' : 'Đã thuê'}
                </span>
              </div>
              <p className="text-[#64748B] text-caption">{room.address}</p>
              <div className="flex flex-wrap gap-4 text-caption pt-1">
                <p><span className="font-semibold text-[#0F172A]">Giá:</span> {room.price.toLocaleString('vi-VN')}₫/tháng</p>
                <p><span className="font-semibold text-[#0F172A]">Lượt xem:</span> {room.views}</p>
                <p><span className="font-semibold text-[#0F172A]">Liên hệ:</span> {room.leads}</p>
              </div>
            </div>
            <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto mt-4 md:mt-0">
              <Button variant="secondary" size="sm" className="w-full" onClick={() => setEditingRoom(room)}>Sửa</Button>
              <Button variant="ghost" size="sm" className="w-full text-[#00153D]">Quảng cáo</Button>
            </div>
          </Card>
        ))}
        {myRooms.length === 0 && (
          <div className="py-12 text-center text-[#64748B] bg-white rounded-[18px] shadow-clay-soft border border-dashed border-[#E2E8F0]">
            Bạn chưa đăng phòng nào.
          </div>
        )}
      </div>

      {/* Edit Property Modal */}
      {editingRoom && (
        <div className="fixed inset-0 bg-[#0F172A]/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 bg-white rounded-[18px] shadow-clay-primary border-none">
            <h2 className="text-h2 font-bold text-[#0F172A] mb-4">Chỉnh sửa phòng</h2>
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
                  onChange={e => setEditingRoom({...editingRoom, status: e.target.value as 'Available' | 'Rented'})}
                  className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white min-h-[44px]"
                >
                  <option value="Available">Còn trống</option>
                  <option value="Rented">Đã thuê</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="secondary" onClick={() => setEditingRoom(null)}>Hủy</Button>
                <Button type="submit">Lưu thay đổi</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add Property Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-[#0F172A]/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 bg-white rounded-[18px] shadow-clay-primary border-none">
            <h2 className="text-h2 font-bold text-[#0F172A] mb-4">Thêm phòng mới</h2>
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
                    value={newRoom.type}
                    onChange={e => setNewRoom({...newRoom, type: e.target.value})}
                    className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white min-h-[44px]"
                  >
                    <option value="Studio">Studio</option>
                    <option value="1 Bedroom">1 Phòng ngủ</option>
                    <option value="Shared Room">Phòng ở ghép</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>Hủy</Button>
                <Button type="submit">Tạo tin đăng</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
