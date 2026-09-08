import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { roomsApi, imagesApi, type RoomResponse } from '../../services/api';
import { toast } from 'sonner';

const UTILITY_OPTIONS = [
  'Wifi', 'Máy lạnh', 'Tủ lạnh', 'Máy giặt', 'Ban công', 
  'Giờ giấc tự do', 'Thang máy', 'Bãi giữ xe', 'Nội thất đầy đủ', 
  'Bảo vệ 24/7', 'Bếp riêng', 'Không chung chủ'
];

export default function RoomManagement() {
  const [myRooms, setMyRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState<RoomResponse | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [newRoom, setNewRoom] = useState({
    title: '',
    price: 0,
    address: '',
    roomType: 'Studio',
    description: '',
    area: 25,
    utilities: ['Wifi', 'Máy lạnh'],
    virtual3DUrl: '',
    imageUrls: [] as string[]
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

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80');
      };
      img.src = url;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImage(true);

    try {
      for (const file of files) {
        // 1. Instant 800px Canvas Compression (0.02s) -> Fast 50KB JPEG Data URL
        const compressedUrl = await compressImage(file);

        if (isEdit) {
          setEditingRoom(prev => prev ? {
            ...prev,
            images: [
              ...(prev.images || []),
              { id: GuidRandom(), imageUrl: compressedUrl, isPrimary: (prev.images?.length || 0) === 0 }
            ]
          } : null);
        } else {
          setNewRoom(prev => ({
            ...prev,
            imageUrls: [...prev.imageUrls, compressedUrl]
          }));
        }

        // 2. Async Cloudinary sync in background
        imagesApi.uploadImage(file).then(res => {
          if (res?.imageUrl && !res.imageUrl.includes('unsplash')) {
            if (isEdit) {
              setEditingRoom(prev => prev ? {
                ...prev,
                images: prev.images.map(img => img.imageUrl === compressedUrl ? { ...img, imageUrl: res.imageUrl } : img)
              } : null);
            } else {
              setNewRoom(prev => ({
                ...prev,
                imageUrls: prev.imageUrls.map(url => url === compressedUrl ? res.imageUrl : url)
              }));
            }
          }
        }).catch(() => {});
      }

      toast.success(`Đã nạp và tối ưu ${files.length} ảnh phòng trọ!`);
    } catch (err) {
      toast.error('Không thể đọc file ảnh.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const GuidRandom = () => Math.random().toString(36).substring(2, 9);

  const toggleUtility = (utility: string, isEdit: boolean = false) => {
    if (isEdit && editingRoom) {
      const currentUtils = editingRoom.utilities ? editingRoom.utilities.split(',').map(u => u.trim()) : [];
      const updated = currentUtils.includes(utility)
        ? currentUtils.filter(u => u !== utility)
        : [...currentUtils, utility];
      setEditingRoom({ ...editingRoom, utilities: updated.join(', ') });
    } else {
      setNewRoom(prev => {
        const exists = prev.utilities.includes(utility);
        return {
          ...prev,
          utilities: exists ? prev.utilities.filter(u => u !== utility) : [...prev.utilities, utility]
        };
      });
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài đăng phòng trọ này không? Hành động này không thể hoàn tác.')) return;
    try {
      await roomsApi.deleteRoom(roomId);
      toast.success('Đã xóa phòng trọ thành công!');
      loadRooms();
    } catch {
      toast.error('Không thể xóa phòng trọ.');
    }
  };

  const handleToggleHideRoom = async (room: RoomResponse) => {
    const newStatus = room.status === 3 ? 0 : 3;
    try {
      await roomsApi.updateRoom(room.id, {
        title: room.title,
        description: room.description || 'Mô tả phòng trọ',
        price: room.price,
        area: room.area || 25,
        utilities: room.utilities || 'Wifi',
        roomType: room.roomType || 'Studio',
        address: room.address,
        virtual3DUrl: room.virtual3DUrl,
        status: newStatus,
        imageUrls: room.images ? room.images.map(img => img.imageUrl) : []
      });
      toast.success(newStatus === 3 ? 'Đã ẩn phòng trọ khỏi trang công khai (Home/Search)!' : 'Đã hiển thị phòng trọ trở lại!');
      loadRooms();
    } catch {
      toast.error('Thao tác ẩn/hiện tin không thành công.');
    }
  };

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
        virtual3DUrl: editingRoom.virtual3DUrl,
        status: editingRoom.status,
        imageUrls: editingRoom.images ? editingRoom.images.map(img => img.imageUrl) : []
      });
      toast.success('Đã lưu thay đổi thông tin phòng vào Backend API!');
      setEditingRoom(null);
      loadRooms();
    } catch {
      toast.error('Không thể lưu thay đổi.');
    }
  };

  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài đăng.');
      return;
    }
    if (!newRoom.address.trim()) {
      toast.error('Vui lòng nhập địa chỉ chi tiết.');
      return;
    }

    try {
      const finalImages = newRoom.imageUrls.length > 0 
        ? newRoom.imageUrls 
        : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'];

      await roomsApi.createRoom({
        title: newRoom.title,
        price: Number(newRoom.price),
        address: newRoom.address,
        roomType: newRoom.roomType,
        description: newRoom.description || 'Phòng trọ tiện nghi, không gian thoáng mát.',
        area: Number(newRoom.area) || 25,
        utilities: newRoom.utilities.join(', '),
        virtual3DUrl: newRoom.virtual3DUrl,
        imageUrls: finalImages
      });
      toast.success('Đăng bài phòng trọ mới thành công!');
      setIsAdding(false);
      setNewRoom({
        title: '',
        price: 0,
        address: '',
        roomType: 'Studio',
        description: '',
        area: 25,
        utilities: ['Wifi', 'Máy lạnh'],
        virtual3DUrl: '',
        imageUrls: []
      });
      loadRooms();
    } catch (err) {
      toast.error('Không thể tạo bài đăng phòng trọ mới.');
    }
  };

  const removeImage = (index: number, isEdit: boolean = false) => {
    if (isEdit && editingRoom) {
      const updated = [...editingRoom.images];
      updated.splice(index, 1);
      setEditingRoom({ ...editingRoom, images: updated });
    } else {
      setNewRoom(prev => ({
        ...prev,
        imageUrls: prev.imageUrls.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <div className="space-y-6 relative bg-[#F5F7FA]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-bold text-[#0F172A]">Phòng của tôi (API Connected)</h1>
          <p className="text-body text-[#64748B]">Quản lý danh sách phòng trọ, ẩn/hiện tin đăng và xóa phòng.</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>+ Thêm phòng mới</Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-12 text-center text-[#64748B] bg-white rounded-[18px]">Đang tải danh sách phòng...</div>
        ) : (
          myRooms.map(room => {
            const primaryImg = room.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80';
            return (
              <Card key={room.id} className="flex flex-col md:flex-row p-4 gap-6 items-center bg-white rounded-[18px] shadow-clay-soft border-none hover:-translate-y-[2px] transition-all">
                <div className="w-full h-48 md:w-48 md:h-32 bg-[#EEF2F6] rounded-[14px] overflow-hidden shrink-0">
                  <img 
                    src={primaryImg} 
                    className="w-full h-full object-cover" 
                    alt="Room" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-h3 text-[#0F172A]">{room.title}</h3>
                    {room.status === 0 && <span className="px-3 py-1 text-caption font-bold rounded-full border bg-[#F0FDF4] text-[#16803C] border-[#DCFCE7]">✓ Đã duyệt (Còn trống)</span>}
                    {room.status === 2 && <span className="px-3 py-1 text-caption font-bold rounded-full border bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]">⏳ Chờ phê duyệt</span>}
                    {room.status === 3 && <span className="px-3 py-1 text-caption font-bold rounded-full border bg-[#FEF2F2] text-[#C62828] border-[#FECACA]">✕ Bị từ chối / Ẩn</span>}
                    {room.status === 1 && <span className="px-3 py-1 text-caption font-bold rounded-full border bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]">Đã thuê</span>}
                  </div>
                  <p className="text-[#64748B] text-caption">{room.address}</p>
                  <div className="flex flex-wrap gap-4 text-caption pt-1">
                    <p><span className="font-semibold text-[#0F172A]">Giá:</span> {Number(room.price).toLocaleString('vi-VN')}₫/tháng</p>
                    <p><span className="font-semibold text-[#0F172A]">Diện tích:</span> {room.area}m²</p>
                    <p><span className="font-semibold text-[#0F172A]">Loại:</span> {room.roomType}</p>
                    {room.utilities && <p><span className="font-semibold text-[#0F172A]">Tiện ích:</span> {room.utilities}</p>}
                  </div>
                </div>
                <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                  <Button variant="secondary" size="sm" className="w-full" onClick={() => setEditingRoom(room)}>✏️ Chỉnh sửa</Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className={`w-full ${room.status === 3 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'}`}
                    onClick={() => handleToggleHideRoom(room)}
                  >
                    {room.status === 3 ? '👁️ Hiện tin' : '🙈 Ẩn tin'}
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                    onClick={() => handleDeleteRoom(room.id)}
                  >
                    🗑️ Xóa
                  </Button>
                </div>
              </Card>
            );
          })
        )}
        {!loading && myRooms.length === 0 && (
          <div className="py-12 text-center text-[#64748B] bg-white rounded-[18px] shadow-clay-soft border border-dashed border-[#E2E8F0]">
            Bạn chưa có phòng trọ nào. Hãy bấm "+ Thêm phòng mới" để tạo bài đăng!
          </div>
        )}
      </div>

      {/* Add New Room Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-[#0F172A]/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 md:p-8 bg-white rounded-[18px] shadow-clay-primary border-none max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-[#E2E8F0]">
              <h2 className="text-h2 font-bold text-[#0F172A]">Thêm phòng trọ mới (Nén ảnh HTML5 Canvas ⚡)</h2>
              <button onClick={() => setIsAdding(false)} className="text-[#64748B] hover:text-[#0F172A] text-xl font-bold">✕</button>
            </div>

            <form onSubmit={handleAddNew} className="space-y-5">
              <div>
                <label className="block text-caption font-semibold text-[#64748B] mb-1">Tiêu đề bài đăng *</label>
                <input 
                  type="text" 
                  required
                  value={newRoom.title}
                  onChange={e => setNewRoom({...newRoom, title: e.target.value})}
                  className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
                  placeholder="Ví dụ: Căn hộ Studio cao cấp Quận 1 ngập tràn ánh sáng"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-caption font-semibold text-[#64748B] mb-1">Loại phòng *</label>
                  <select 
                    value={newRoom.roomType}
                    onChange={e => setNewRoom({...newRoom, roomType: e.target.value})}
                    className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white min-h-[44px]"
                  >
                    <option value="Studio">Studio</option>
                    <option value="1 Bedroom">1 Phòng ngủ</option>
                    <option value="2 Bedrooms">2 Phòng ngủ</option>
                    <option value="Phòng trọ">Phòng trọ</option>
                    <option value="Ở ghép / KTX">Ở ghép / KTX</option>
                  </select>
                </div>

                <div>
                  <label className="block text-caption font-semibold text-[#64748B] mb-1">Giá thuê (VNĐ/tháng) *</label>
                  <input 
                    type="number" 
                    required
                    value={newRoom.price || ''}
                    onChange={e => setNewRoom({...newRoom, price: Number(e.target.value)})}
                    className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
                    placeholder="4500000"
                  />
                </div>

                <div>
                  <label className="block text-caption font-semibold text-[#64748B] mb-1">Diện tích (m²) *</label>
                  <input 
                    type="number" 
                    required
                    value={newRoom.area || ''}
                    onChange={e => setNewRoom({...newRoom, area: Number(e.target.value)})}
                    className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-caption font-semibold text-[#64748B] mb-1">Địa chỉ chi tiết *</label>
                <input 
                  type="text" 
                  required
                  value={newRoom.address}
                  onChange={e => setNewRoom({...newRoom, address: e.target.value})}
                  className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
                  placeholder="Ví dụ: 123 Nguyễn Đình Chiểu, Phường Võ Thị Sáu, Quận 3, TP.HCM"
                />
              </div>

              <div>
                <label className="block text-caption font-semibold text-[#64748B] mb-2">Tiện ích chọn nhanh</label>
                <div className="flex flex-wrap gap-2">
                  {UTILITY_OPTIONS.map(util => {
                    const active = newRoom.utilities.includes(util);
                    return (
                      <button
                        key={util}
                        type="button"
                        onClick={() => toggleUtility(util)}
                        className={`px-3 py-1.5 rounded-[10px] text-caption font-semibold transition-all ${
                          active 
                            ? 'btn-clay-primary' 
                            : 'bg-[#F5F7FA] text-[#64748B] border border-[#E2E8F0] hover:bg-white hover:text-[#0F172A]'
                        }`}
                      >
                        {active ? `✓ ${util}` : `+ ${util}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-caption font-semibold text-[#64748B] mb-1">Mô tả chi tiết phòng trọ</label>
                <textarea 
                  rows={3}
                  value={newRoom.description}
                  onChange={e => setNewRoom({...newRoom, description: e.target.value})}
                  className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
                  placeholder="Mô tả về nội thất, tình trạng phòng, quy định giờ giấc, tiền điện nước..."
                />
              </div>

              <div>
                <label className="block text-caption font-semibold text-[#64748B] mb-1">Link VR 3D Tour (Tùy chọn)</label>
                <input 
                  type="text" 
                  value={newRoom.virtual3DUrl}
                  onChange={e => setNewRoom({...newRoom, virtual3DUrl: e.target.value})}
                  className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
                  placeholder="https://my.matterport.com/show/?m=..."
                />
              </div>

              <div>
                <label className="block text-caption font-semibold text-[#64748B] mb-2">Hình ảnh thực tế (Tự động nén & Lưu CSDL)</label>
                
                <div className="border-2 border-dashed border-[#CBD5E1] rounded-[14px] p-6 text-center bg-[#F5F7FA] shadow-clay-inset hover:bg-white transition-all cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/bmp, image/heic, image/heif, image/*, .png, .jpg, .jpeg, .webp, .gif, .bmp, .heic, .heif"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => handleImageUpload(e, false)}
                    disabled={uploadingImage}
                  />
                  <p className="text-body font-semibold text-[#00153D] mb-1">
                    {uploadingImage ? '⏳ Đang tối ưu hóa ảnh...' : '📷 Bấm hoặc Kéo thả ảnh thực tế vào đây'}
                  </p>
                  <p className="text-caption text-[#64748B]">Ảnh tự động nén tối ưu hiển thị sắc nét và lưu trữ trực tiếp vào CSDL.</p>
                </div>

                {newRoom.imageUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {newRoom.imageUrls.map((url, idx) => (
                      <div key={idx} className="relative group rounded-[10px] overflow-hidden border border-[#E2E8F0] h-24 bg-black/5">
                        <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx, false)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>Hủy</Button>
                <Button type="submit">Đăng tin phòng trọ (API)</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Room Modal */}
      {editingRoom && (
        <div className="fixed inset-0 bg-[#0F172A]/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 md:p-8 bg-white rounded-[18px] shadow-clay-primary border-none max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-[#E2E8F0]">
              <h2 className="text-h2 font-bold text-[#0F172A]">Chỉnh sửa bài đăng phòng trọ</h2>
              <button onClick={() => setEditingRoom(null)} className="text-[#64748B] hover:text-[#0F172A] text-xl font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5">
              <div>
                <label className="block text-caption font-semibold text-[#64748B] mb-1">Tiêu đề</label>
                <input 
                  type="text" 
                  value={editingRoom.title}
                  onChange={e => setEditingRoom({...editingRoom, title: e.target.value})}
                  className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-caption font-semibold text-[#64748B] mb-1">Loại phòng</label>
                  <select 
                    value={editingRoom.roomType || 'Studio'}
                    onChange={e => setEditingRoom({...editingRoom, roomType: e.target.value})}
                    className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white min-h-[44px]"
                  >
                    <option value="Studio">Studio</option>
                    <option value="1 Bedroom">1 Phòng ngủ</option>
                    <option value="2 Bedrooms">2 Phòng ngủ</option>
                    <option value="Phòng trọ">Phòng trọ</option>
                    <option value="Ở ghép / KTX">Ở ghép / KTX</option>
                  </select>
                </div>

                <div>
                  <label className="block text-caption font-semibold text-[#64748B] mb-1">Giá thuê (VNĐ/tháng)</label>
                  <input 
                    type="number" 
                    value={editingRoom.price}
                    onChange={e => setEditingRoom({...editingRoom, price: Number(e.target.value)})}
                    className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-caption font-semibold text-[#64748B] mb-1">Diện tích (m²)</label>
                  <input 
                    type="number" 
                    value={editingRoom.area}
                    onChange={e => setEditingRoom({...editingRoom, area: Number(e.target.value)})}
                    className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-caption font-semibold text-[#64748B] mb-1">Trạng thái phòng</label>
                <select 
                  value={editingRoom.status}
                  onChange={e => setEditingRoom({...editingRoom, status: Number(e.target.value)})}
                  className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white min-h-[44px]"
                >
                  <option value={0}>✓ Đã duyệt (Công khai - Còn trống)</option>
                  <option value={2}>⏳ Chờ phê duyệt (Admin)</option>
                  <option value={1}>Đã thuê</option>
                  <option value={3}>✕ Tạm ẩn / Từ chối</option>
                </select>
              </div>

              <div>
                <label className="block text-caption font-semibold text-[#64748B] mb-1">Địa chỉ chi tiết</label>
                <input 
                  type="text" 
                  value={editingRoom.address}
                  onChange={e => setEditingRoom({...editingRoom, address: e.target.value})}
                  className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-caption font-semibold text-[#64748B] mb-2">Tiện ích đi kèm</label>
                <div className="flex flex-wrap gap-2">
                  {UTILITY_OPTIONS.map(util => {
                    const currentUtils = editingRoom.utilities ? editingRoom.utilities.split(',').map(u => u.trim()) : [];
                    const active = currentUtils.includes(util);
                    return (
                      <button
                        key={util}
                        type="button"
                        onClick={() => toggleUtility(util, true)}
                        className={`px-3 py-1.5 rounded-[10px] text-caption font-semibold transition-all ${
                          active 
                            ? 'btn-clay-primary' 
                            : 'bg-[#F5F7FA] text-[#64748B] border border-[#E2E8F0] hover:bg-white hover:text-[#0F172A]'
                        }`}
                      >
                        {active ? `✓ ${util}` : `+ ${util}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-caption font-semibold text-[#64748B] mb-1">Mô tả chi tiết</label>
                <textarea 
                  rows={3}
                  value={editingRoom.description || ''}
                  onChange={e => setEditingRoom({...editingRoom, description: e.target.value})}
                  className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-caption font-semibold text-[#64748B] mb-2">Thêm ảnh thực tế mới</label>
                <div className="border-2 border-dashed border-[#CBD5E1] rounded-[14px] p-6 text-center bg-[#F5F7FA] shadow-clay-inset hover:bg-white transition-all cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/bmp, image/heic, image/heif, image/*, .png, .jpg, .jpeg, .webp, .gif, .bmp, .heic, .heif"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => handleImageUpload(e, true)}
                  />
                  <p className="text-body font-semibold text-[#00153D] mb-1">
                    📷 Bấm để thêm ảnh phòng vào bài trọ này
                  </p>
                </div>

                {editingRoom.images && editingRoom.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {editingRoom.images.map((img, idx) => (
                      <div key={idx} className="relative group rounded-[10px] overflow-hidden border border-[#E2E8F0] h-24 bg-black/5">
                        <img src={img.imageUrl} alt={`Room ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx, true)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <Button type="button" variant="secondary" onClick={() => setEditingRoom(null)}>Hủy</Button>
                <Button type="submit">Lưu vào Backend API</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
