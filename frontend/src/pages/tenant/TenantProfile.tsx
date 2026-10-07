import { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { profilesApi, imagesApi } from '../../services/api';
import { toast } from 'sonner';
import { Users, Camera, Upload, Link as LinkIcon, Loader2, Plus } from 'lucide-react';

export default function TenantProfile() {
  const { currentUser, updateUser } = useStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLookingForRoommate, setIsLookingForRoommate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatar, setAvatar] = useState<string>(
    currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
  );

  const [tags, setTags] = useState([
    { name: 'Yên tĩnh', active: true },
    { name: 'Không hút thuốc', active: true },
    { name: 'Yêu thú cưng', active: false },
    { name: 'Cú đêm', active: true },
    { name: 'Dậy sớm', active: false },
  ]);

  useEffect(() => {
    const parseName = (rawName: string) => {
      const parts = rawName.trim().split(/\s+/).filter(Boolean);
      if (parts.length <= 1) {
        setLastName('');
        setFirstName(parts[0] || '');
      } else {
        setLastName(parts.slice(0, -1).join(' '));
        setFirstName(parts[parts.length - 1]);
      }
    };

    if (currentUser?.name) {
      parseName(currentUser.name);
    }
    if (currentUser?.avatar) {
      setAvatar(currentUser.avatar);
    }

    let isMounted = true;
    profilesApi.getCustomerProfile()
      .then(res => {
        if (!isMounted) return;
        if (res?.fullName) {
          parseName(res.fullName);
        }
        if (res?.phoneNumber) {
          setPhoneNumber(res.phoneNumber);
        }
        if (res?.avatarUrl) {
          setAvatar(res.avatarUrl);
          updateUser({ avatar: res.avatarUrl });
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

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tập tin hình ảnh hợp lệ (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dung lượng ảnh không được vượt quá 10MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const previousAvatar = avatar;
    setAvatar(previewUrl);
    setIsUploadingAvatar(true);

    try {
      const uploadRes = await imagesApi.uploadImage(file);
      const newAvatarUrl = uploadRes.imageUrl;

      setAvatar(newAvatarUrl);
      updateUser({ avatar: newAvatarUrl });

      await profilesApi.updateCustomerProfile({
        fullName: [lastName, firstName].filter(Boolean).join(' ').trim(),
        avatarUrl: newAvatarUrl
      });

      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      setAvatar(previousAvatar);
      toast.error('Không thể tải ảnh lên: ' + (err?.message || 'Lỗi mạng'));
    } finally {
      setIsUploadingAvatar(false);
      URL.revokeObjectURL(previewUrl);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePasteAvatarUrl = () => {
    const url = window.prompt('Nhập đường dẫn (URL) ảnh đại diện của bạn:', avatar);
    if (url && url.trim() && url.trim() !== avatar) {
      const cleanUrl = url.trim();
      setAvatar(cleanUrl);
      updateUser({ avatar: cleanUrl });
      profilesApi.updateCustomerProfile({
        fullName: [lastName, firstName].filter(Boolean).join(' ').trim(),
        avatarUrl: cleanUrl
      }).then(() => {
        toast.success('Đã lưu đường dẫn ảnh đại diện!');
      }).catch((err: any) => {
        toast.error('Không thể lưu ảnh đại diện: ' + (err?.message || 'Lỗi'));
      });
    }
  };

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
    const fullName = [lastName, firstName].filter(Boolean).join(' ').trim();
    const lifestyle = tags.filter(t => t.active).map(t => t.name).join(', ');

    updateUser({ name: fullName, avatar });

    try {
      await profilesApi.updateCustomerProfile({
        fullName,
        phoneNumber,
        avatarUrl: avatar,
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
        <Button onClick={handleSave} className="px-6" disabled={loading || isUploadingAvatar}>Lưu thay đổi (API)</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-1 flex flex-col items-center text-center space-y-4 bg-white rounded-[18px] shadow-clay-soft">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarFileChange} 
            accept="image/*" 
            className="hidden" 
          />

          <div 
            onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
            className="w-32 h-32 bg-[#EEF2F6] rounded-full overflow-hidden relative group cursor-pointer border-4 border-white shadow-clay-soft transition-transform active:scale-95"
            title="Nhấn để đổi ảnh đại diện"
          >
            <img 
              src={avatar} 
              alt="Profile" 
              className="w-full h-full object-cover" 
            />
            <div className={`absolute inset-0 bg-[#0F172A]/50 flex flex-col items-center justify-center transition-opacity ${isUploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              {isUploadingAvatar ? (
                <>
                  <Loader2 className="w-6 h-6 text-white animate-spin mb-1" />
                  <span className="text-white text-[11px] font-medium">Đang tải...</span>
                </>
              ) : (
                <>
                  <Camera className="w-6 h-6 text-white mb-1" />
                  <span className="text-white text-[12px] font-semibold">Đổi ảnh</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[12px] font-medium bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải ảnh lên</span>
            </button>
            <button
              type="button"
              disabled={isUploadingAvatar}
              onClick={handlePasteAvatarUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[12px] font-medium bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] border border-[#E2E8F0] transition-colors"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Dán URL</span>
            </button>
          </div>

          <div>
            <h3 className="text-h3 text-[#0F172A]">{[lastName, firstName].filter(Boolean).join(' ') || currentUser?.name || 'Nguyễn Văn An'}</h3>
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
              <Input label="Họ & Tên đệm" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Nguyễn Văn" />
              <Input label="Tên" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="An" />
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
                  className={`px-4 py-2 rounded-[12px] text-caption font-semibold transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-95 ${
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
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-dashed border-[#CBD5E1] text-[#64748B] rounded-[12px] text-caption font-semibold hover:border-[#00153D] hover:text-[#00153D] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm thẻ mới</span>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
