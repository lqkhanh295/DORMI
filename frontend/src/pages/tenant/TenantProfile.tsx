import { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { profilesApi, imagesApi } from '../../services/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdropVariants, modalContentVariants } from '../../utils/motion';
import { Users, Camera, Upload, Link as LinkIcon, Loader2, Plus, Tag, X, Check, Sparkles } from 'lucide-react';

const SUGGESTED_LIFESTYLE_TAGS = [
  'Thích nấu ăn',
  'Yêu thú cưng',
  'Không nuôi thú cưng',
  'Hướng nội',
  'Hướng ngoại',
  'Dậy sớm',
  'Thức khuya',
  'Thích thể thao',
  'Ăn chay',
  'Không nhậu nhẹt',
  'Gọn gàng sạch sẽ',
  'Tập trung học tập',
  'Tôn trọng riêng tư',
  'Thân thiện hòa đồng'
];

export default function TenantProfile() {
  const { currentUser, updateUser } = useStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLookingForRoommate, setIsLookingForRoommate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Khung thêm thẻ phong cách sống (Add tag modal state)
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const newTagInputRef = useRef<HTMLInputElement>(null);

  // Khung dán URL ảnh đại diện (Avatar URL modal state)
  const [isAvatarUrlModalOpen, setIsAvatarUrlModalOpen] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');

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
  }, []); // Run ONCE on mount to prevent infinite request loop

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = /\.(jpg|jpeg|jfif|png|webp|gif|bmp|svg|avif|ico|heic|heif|tiff|tif)$/i;
    if (!file.type.startsWith('image/') && !file.name.match(allowedExtensions)) {
      toast.error('Định dạng ảnh không được hỗ trợ. Chấp nhận: JPG, PNG, WEBP, GIF, SVG, AVIF, BMP, ICO, HEIC, TIFF.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Dung lượng ảnh vượt quá giới hạn 20MB.');
      return;
    }

    setIsUploadingAvatar(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        setIsUploadingAvatar(false);
        return;
      }

      // 1. Hiển thị ngay lập tức không bị chớp hay mất ảnh
      setAvatar(dataUrl);
      updateUser({ avatar: dataUrl });

      let savedUrl = dataUrl;
      try {
        const uploadRes = await imagesApi.uploadImage(file);
        if (uploadRes?.imageUrl && !uploadRes.imageUrl.includes('522708323590-d24dbb6b0267')) {
          savedUrl = uploadRes.imageUrl;
          setAvatar(savedUrl);
          updateUser({ avatar: savedUrl });
        }

        await profilesApi.updateCustomerProfile({
          fullName: [lastName, firstName].filter(Boolean).join(' ').trim(),
          avatarUrl: savedUrl
        });

        toast.success('Cập nhật ảnh đại diện thành công!');
      } catch (err: any) {
        console.warn('Upload image API fallback to local dataUrl:', err);
        try {
          await profilesApi.updateCustomerProfile({
            fullName: [lastName, firstName].filter(Boolean).join(' ').trim(),
            avatarUrl: dataUrl
          });
          toast.success('Đã lưu ảnh đại diện thành công!');
        } catch {
          toast.success('Đã áp dụng ảnh đại diện mới!');
        }
      } finally {
        setIsUploadingAvatar(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      setIsUploadingAvatar(false);
      toast.error('Không thể đọc tập tin ảnh.');
    };

    reader.readAsDataURL(file);
  };

  const handleOpenAvatarUrlModal = () => {
    setAvatarUrlInput(avatar.startsWith('data:') ? '' : avatar);
    setIsAvatarUrlModalOpen(true);
  };

  const handleConfirmAvatarUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = avatarUrlInput.trim();
    if (!cleanUrl) {
      toast.error('Vui lòng nhập đường dẫn (URL) ảnh hợp lệ.');
      return;
    }

    setAvatar(cleanUrl);
    updateUser({ avatar: cleanUrl });
    setIsAvatarUrlModalOpen(false);

    try {
      await profilesApi.updateCustomerProfile({
        fullName: [lastName, firstName].filter(Boolean).join(' ').trim(),
        avatarUrl: cleanUrl
      });
      toast.success('Đã lưu đường dẫn ảnh đại diện!');
    } catch (err: any) {
      toast.error('Không thể lưu ảnh đại diện: ' + (err?.message || 'Lỗi'));
    }
  };

  const handleOpenAddTagModal = () => {
    setNewTagInput('');
    setIsAddTagModalOpen(true);
    setTimeout(() => {
      newTagInputRef.current?.focus();
    }, 100);
  };

  const handleConfirmAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTag = newTagInput.trim();
    if (!cleanTag) return;

    const existingIndex = tags.findIndex(t => t.name.toLowerCase() === cleanTag.toLowerCase());
    if (existingIndex >= 0) {
      if (!tags[existingIndex].active) {
        const next = [...tags];
        next[existingIndex].active = true;
        setTags(next);
        toast.success(`Đã kích hoạt thẻ "${tags[existingIndex].name}"`);
      } else {
        toast.info(`Thẻ "${tags[existingIndex].name}" đã có trong danh sách.`);
      }
    } else {
      setTags([...tags, { name: cleanTag, active: true }]);
      toast.success(`Đã thêm thẻ "${cleanTag}"!`);
    }

    setNewTagInput('');
    setIsAddTagModalOpen(false);
  };

  const handleAddPresetTag = (presetName: string) => {
    const existingIndex = tags.findIndex(t => t.name.toLowerCase() === presetName.toLowerCase());
    if (existingIndex >= 0) {
      if (!tags[existingIndex].active) {
        const next = [...tags];
        next[existingIndex].active = true;
        setTags(next);
        toast.success(`Đã kích hoạt thẻ "${tags[existingIndex].name}"`);
      } else {
        toast.info(`Thẻ "${tags[existingIndex].name}" đã có trong danh sách.`);
      }
    } else {
      setTags([...tags, { name: presetName, active: true }]);
      toast.success(`Đã thêm thẻ "${presetName}"!`);
    }
  };

  const handleRemoveTag = (index: number) => {
    const removedName = tags[index]?.name;
    setTags(tags.filter((_, i) => i !== index));
    if (removedName) {
      toast.info(`Đã gỡ thẻ "${removedName}"`);
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
            accept="image/*,.jpg,.jpeg,.jfif,.png,.webp,.gif,.bmp,.svg,.avif,.ico,.heic,.heif,.tiff,.tif" 
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
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80";
              }}
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
              onClick={handleOpenAvatarUrlModal}
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
                <div key={index} className="inline-flex items-center group relative">
                  <button 
                    type="button"
                    onClick={() => toggleTag(index)}
                    className={`px-3.5 py-2 rounded-[12px] text-caption font-semibold transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-95 flex items-center gap-1.5 ${
                      tag.active 
                        ? 'btn-clay-primary' 
                        : 'bg-[#F5F7FA] text-[#64748B] shadow-clay-soft hover:bg-white hover:text-[#0F172A]'
                    }`}
                  >
                    {tag.active && <Check className="w-3.5 h-3.5 text-white" />}
                    <span>{tag.name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(index);
                    }}
                    title={`Xóa thẻ "${tag.name}"`}
                    aria-label={`Xóa thẻ ${tag.name}`}
                    className="ml-1 p-1 text-[#94A3B8] hover:text-red-500 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button 
                type="button"
                onClick={handleOpenAddTagModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-dashed border-[#CBD5E1] text-[#64748B] rounded-[12px] text-caption font-semibold hover:border-[#00153D] hover:text-[#00153D] transition-colors shadow-xs hover:shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm thẻ mới</span>
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Khung thêm thẻ phong cách sống (Add Tag Modal) */}
      <AnimatePresence>
        {isAddTagModalOpen && (
          <motion.div
            key="add-tag-modal-backdrop"
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setIsAddTagModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 p-4 backdrop-blur-xs"
          >
            <motion.div
              key="add-tag-modal-content"
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[20px] shadow-clay-primary max-w-md w-full p-6 space-y-5 overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#00153D] flex items-center justify-center">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-h3 font-bold text-[#0F172A]">Thêm thẻ phong cách sống</h3>
                    <p className="text-caption text-[#64748B]">Tạo thẻ mô tả thói quen hoặc sở thích của bạn</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddTagModalOpen(false)}
                  className="p-1.5 rounded-full text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleConfirmAddTag} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-caption font-semibold text-[#0F172A]">
                    Tên thẻ
                  </label>
                  <input
                    ref={newTagInputRef}
                    type="text"
                    maxLength={30}
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="VD: Thích nấu ăn, Dậy sớm, Nuôi mèo..."
                    className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-3.5 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
                    autoFocus
                  />
                  <div className="flex justify-between text-[11px] text-[#94A3B8]">
                    <span>Nhấn Enter để thêm nhanh</span>
                    <span>{newTagInput.trim().length}/30 ký tự</span>
                  </div>
                </div>

                {/* Popular Presets */}
                <div className="space-y-2">
                  <label className="text-caption font-semibold text-[#64748B] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Gợi ý phổ biến</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {SUGGESTED_LIFESTYLE_TAGS.map((suggested) => {
                      const isAlreadyAdded = tags.some(t => t.name.toLowerCase() === suggested.toLowerCase());
                      return (
                        <button
                          key={suggested}
                          type="button"
                          disabled={isAlreadyAdded}
                          onClick={() => {
                            if (!isAlreadyAdded) {
                              handleAddPresetTag(suggested);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-[10px] text-[12px] font-medium transition-all duration-150 flex items-center gap-1 ${
                            isAlreadyAdded
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              : 'bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0] hover:text-[#0F172A] border border-[#E2E8F0] active:scale-95'
                          }`}
                        >
                          {isAlreadyAdded ? <Check className="w-3 h-3 text-emerald-600" /> : <Plus className="w-3 h-3 text-[#64748B]" />}
                          <span>{suggested}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => setIsAddTagModalOpen(false)}
                    className="px-4 py-2 rounded-[12px] text-caption font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
                  >
                    Hủy
                  </button>
                  <Button
                    type="submit"
                    disabled={!newTagInput.trim()}
                    className="px-5 py-2 inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm thẻ</span>
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Khung dán URL ảnh đại diện (Avatar URL Modal) */}
      <AnimatePresence>
        {isAvatarUrlModalOpen && (
          <motion.div
            key="avatar-url-modal-backdrop"
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setIsAvatarUrlModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 p-4 backdrop-blur-xs"
          >
            <motion.div
              key="avatar-url-modal-content"
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[20px] shadow-clay-primary max-w-md w-full p-6 space-y-5 overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#00153D] flex items-center justify-center">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-h3 font-bold text-[#0F172A]">Dán URL ảnh đại diện</h3>
                    <p className="text-caption text-[#64748B]">Sử dụng đường dẫn ảnh trực tiếp từ internet</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvatarUrlModalOpen(false)}
                  className="p-1.5 rounded-full text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleConfirmAvatarUrl} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-caption font-semibold text-[#0F172A]">
                    Đường dẫn ảnh (URL)
                  </label>
                  <input
                    type="url"
                    value={avatarUrlInput}
                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-3.5 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
                    autoFocus
                  />
                </div>

                {avatarUrlInput.trim() && (
                  <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#E2E8F0] flex items-center gap-3">
                    <img
                      src={avatarUrlInput.trim()}
                      alt="Preview"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    <div className="text-caption text-[#64748B] overflow-hidden truncate">
                      Xem trước ảnh đại diện
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => setIsAvatarUrlModalOpen(false)}
                    className="px-4 py-2 rounded-[12px] text-caption font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
                  >
                    Hủy
                  </button>
                  <Button
                    type="submit"
                    disabled={!avatarUrlInput.trim()}
                    className="px-5 py-2 inline-flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Áp dụng ảnh</span>
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
