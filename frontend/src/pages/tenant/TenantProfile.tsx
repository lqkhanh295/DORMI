import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { toast } from 'sonner';

export default function TenantProfile() {
  const { currentUser, updateUser } = useStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    if (currentUser?.name) {
      const parts = currentUser.name.split(' ');
      setFirstName(parts[0]);
      setLastName(parts.slice(1).join(' '));
    }
  }, [currentUser]);

  const [tags, setTags] = useState([
    { name: 'Yên tĩnh', active: true },
    { name: 'Không hút thuốc', active: true },
    { name: 'Yêu thú cưng', active: false },
    { name: 'Cú đêm', active: true },
    { name: 'Dậy sớm', active: false },
  ]);

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

  const handleSave = () => {
    updateUser({ name: `${firstName} ${lastName}`.trim() });
    toast.success('Lưu thông tin hồ sơ thành công!');
  };

  // ponytail: TenantProfile with Level 2 Soft Clay cards and Level 1 Clay tag toggles
  return (
    <div className="w-full space-y-6 bg-[#F5F7FA]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-bold text-[#0F172A]">Hồ sơ cá nhân</h1>
          <p className="text-[#64748B] text-body">Cập nhật thông tin và phong cách sống của bạn.</p>
        </div>
        <Button onClick={handleSave} className="px-6">Lưu thay đổi</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Profile Avatar Card */}
        <Card className="p-6 md:col-span-1 flex flex-col items-center text-center space-y-4 bg-white rounded-[18px] shadow-clay-soft">
          <div className="w-32 h-32 bg-[#EEF2F6] rounded-full overflow-hidden relative group cursor-pointer border-4 border-white shadow-clay-soft">
            <img src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"} alt="Profile" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[#0F172A]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-caption font-semibold">Sửa ảnh</span>
            </div>
          </div>
          <div>
            <h3 className="text-h3 text-[#0F172A]">{currentUser?.name || 'Alex Nguyen'}</h3>
            <p className="text-caption text-[#64748B]">Người thuê trọ</p>
          </div>
          <div className="w-full pt-4 border-t border-[#E2E8F0]">
            <p className="text-caption text-[#64748B] uppercase tracking-wider mb-2">Độ hoàn thiện hồ sơ</p>
            <div className="w-full h-2.5 bg-[#F5F7FA] shadow-clay-inset rounded-full overflow-hidden">
              <div className="bg-[#00153D] h-full rounded-full" style={{width: '85%'}}></div>
            </div>
          </div>
        </Card>

        {/* Right Info Form Card */}
        <Card className="p-6 md:col-span-2 space-y-6 bg-white rounded-[18px] shadow-clay-soft">
          <div>
            <h3 className="text-h3 text-[#0F172A] mb-4">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Tên" value={firstName} onChange={e => setFirstName(e.target.value)} />
              <Input label="Họ & Tên đệm" value={lastName} onChange={e => setLastName(e.target.value)} />
              <Input label="Email" type="email" defaultValue={currentUser?.email || "alex.nguyen@example.com"} />
              <Input label="Số điện thoại" defaultValue="0901234567" />
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
