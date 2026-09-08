import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { profilesApi } from '../../services/api';
import { toast } from 'sonner';
import { Users } from 'lucide-react';

export default function TenantProfile() {
  const { currentUser, updateUser } = useStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLookingForRoommate, setIsLookingForRoommate] = useState(false);
  const [loading, setLoading] = useState(true);

  const [tags, setTags] = useState([
    { name: 'Yên tĩnh', active: true },
    { name: 'Không hút thuốc', active: true },
    { name: 'Yêu thú cưng', active: false },
    { name: 'Cú đêm', active: true },
    { name: 'Dậy sớm', active: false },
  ]);

  useEffect(() => {
    if (currentUser?.name) {
      const parts = currentUser.name.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }

    let isMounted = true;
    profilesApi.getCustomerProfile()
      .then(res => {
        if (!isMounted) return;
        if (res?.fullName) {
          const parts = res.fullName.split(' ');
          setFirstName(parts[0] || '');
          setLastName(parts.slice(1).join(' ') || '');
        }
        if (res?.phoneNumber) {
          setPhoneNumber(res.phoneNumber);
        }
        if (res?.lifestyle) {
          const parsedTags = res.lifestyle.split(',').map((t: string) => t.trim()).filter(Boolean);
          if (parsedTags.length > 0) {
            setTags(parsedTags.map((name: string) => ({ name, active: true })));
          }
        }
        if (res?.isLookingForRoommate != null) {
          setIsLookingForRoommate(res.isLookingForRoommate);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch customer profile from API:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [currentUser]);

  const handleAddTag = () => {
    const newTag = window.prompt('Nhập thẻ phong cách sống mới:');
    if (newTag && newTag.trim()) {
      setTags([...tags, { name: newTag.trim(), active: true }]);
    }
  };

  const toggleTag = (index: number) => {
    const newTags = [...tags];
    newTags[index].active = !newTags[index].active;
    setTags(newTags);
  };

  const handleSave = async () => {
    const fullName = `${firstName} ${lastName}`.trim();
    const lifestyle = tags.filter(t => t.active).map(t => t.name).join(', ');

    updateUser({ name: fullName });

    try {
      await profilesApi.updateCustomerProfile({
        fullName,
        phoneNumber,
        lifestyle,
        preferences: 'Phòng yên tĩnh, sạch sẽ',
        isLookingForRoommate
      });
      toast.success('Lưu thông tin hồ sơ vào Backend API thành công!');
    } catch (err: any) {
      console.warn('Profile update warning:', err);
      toast.error('Không thể cập nhật hồ sơ: ' + (err?.message || 'Lỗi kết nối'));
    }
  };

  return (
    <div className="w-full space-y-6 bg-[#F5F7FA]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-bold text-[#0F172A]">Hồ sơ cá nhân (API Connected)</h1>
          <p className="text-[#64748B] text-body">Cập nhật thông tin và phong cách sống thời gian thực.</p>
        </div>
        <Button onClick={handleSave} className="px-6" disabled={loading}>Lưu thay đổi (API)</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-1 flex flex-col items-center text-center space-y-4 bg-white rounded-[18px] shadow-clay-soft">
          <div className="w-32 h-32 bg-[#EEF2F6] rounded-full overflow-hidden relative group cursor-pointer border-4 border-white shadow-clay-soft">
            <img src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"} alt="Profile" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[#0F172A]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-caption font-semibold">Sửa ảnh</span>
            </div>
          </div>
          <div>
            <h3 className="text-h3 text-[#0F172A]">{`${firstName} ${lastName}`.trim() || currentUser?.name || 'Nguyễn Văn A'}</h3>
            <p className="text-caption text-[#64748B]">Người thuê trọ</p>
          </div>
          <div className="w-full pt-4 border-t border-[#E2E8F0]">
            <p className="text-caption text-[#64748B] uppercase tracking-wider mb-2">Độ hoàn thiện hồ sơ</p>
            <div className="w-full h-2.5 bg-[#F5F7FA] shadow-clay-inset rounded-full overflow-hidden">
              <div className="bg-[#00153D] h-full rounded-full" style={{width: '90%'}}></div>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:col-span-2 space-y-6 bg-white rounded-[18px] shadow-clay-soft">
          <div>
            <h3 className="text-h3 text-[#0F172A] mb-4">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Tên" value={firstName} onChange={e => setFirstName(e.target.value)} />
              <Input label="Họ & Tên đệm" value={lastName} onChange={e => setLastName(e.target.value)} />
              <Input label="Email" type="email" value={currentUser?.email || "tenant@dormi.vn"} disabled />
              <Input label="Số điện thoại" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="0901234567" />
            </div>
          </div>
          <div className="pt-6 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLookingForRoommate ? 'bg-[#F0FDF4] text-[#16803C]' : 'bg-[#F5F7FA] text-[#64748B]'}`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-h3 text-[#0F172A]">Tìm người ở ghép</h3>
                  <p className="text-caption text-[#64748B]">Bật để hồ sơ của bạn xuất hiện trong gợi ý ở ghép cho người dùng khác.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLookingForRoommate(!isLookingForRoommate)}
                className={`relative w-12 h-7 rounded-full transition-colors ${isLookingForRoommate ? 'bg-[#16803C]' : 'bg-[#CBD5E1]'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isLookingForRoommate ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E2E8F0]">
            <h3 className="text-h3 text-[#0F172A] mb-1.5">Phong cách sống</h3>
            <p className="text-body text-[#64748B] mb-4">Chọn các thẻ mô tả đúng nhất lối sống của bạn để kết nối bạn ở ghép tương thích.</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <button 
                  key={index}
                  type="button"
                  onClick={() => toggleTag(index)}
                  className={`px-4 py-2 rounded-[12px] text-caption font-semibold transition-all ${
                    tag.active 
                      ? 'btn-clay-primary' 
                      : 'bg-[#F5F7FA] text-[#64748B] shadow-clay-soft hover:bg-white hover:text-[#0F172A]'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
              <button 
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-white border border-dashed border-[#CBD5E1] text-[#64748B] rounded-[12px] text-caption font-semibold hover:border-[#00153D] hover:text-[#00153D] transition-colors"
              >
                + Thêm thẻ mới
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
