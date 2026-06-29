import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';

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
    { name: 'Quiet', active: true },
    { name: 'Non-smoker', active: true },
    { name: 'Pet-friendly', active: false },
    { name: 'Night Owl', active: true },
    { name: 'Early Bird', active: false },
    { name: 'Vegetarian', active: false },
  ]);

  const handleAddTag = () => {
    const newTag = window.prompt('Enter new lifestyle tag (e.g., Gym Lover, Student):');
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
    alert('Profile saved successfully!');
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Hồ sơ cá nhân</h1>
          <p className="text-neutral-500 text-sm">Cập nhật thông tin và phong cách sống.</p>
        </div>
        <Button onClick={handleSave}>Lưu thay đổi</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 md:p-5 md:col-span-1 flex flex-col items-center text-center space-y-4">
          <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden relative group cursor-pointer border-4 border-white shadow-sm">
            <img src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"} alt="Profile" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-micro">
              <span className="text-white text-sm font-medium">Edit Photo</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">{currentUser?.name || 'Alex Nguyen'}</h3>
            <p className="text-sm text-neutral-500">Người thuê trọ</p>
          </div>
          <div className="w-full pt-4 border-t border-neutral-100">
            <p className="text-xs text-neutral-400 uppercase tracking-wider mb-2">Độ hoàn thiện hồ sơ</p>
            <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div className="bg-primary-500 h-full rounded-full" style={{width: '85%'}}></div>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-5 md:col-span-2 space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">Thông tin cơ bản</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
              <Input label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
              <Input label="Email" type="email" defaultValue={currentUser?.email || "alex.nguyen@example.com"} />
              <Input label="Phone Number" defaultValue="0901234567" />
            </div>
          </div>

          <div className="pt-5 border-t border-neutral-100">
            <h3 className="text-lg font-semibold text-neutral-900 mb-1.5">Phong cách sống (AI Matcher)</h3>
            <p className="text-sm text-neutral-500 mb-3">Chọn các thẻ mô tả đúng nhất lối sống của bạn để AI ghép đôi bạn cùng phòng.</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span 
                  key={index}
                  onClick={() => toggleTag(index)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                    tag.active 
                      ? 'bg-primary-50 text-primary-700 border border-primary-100' 
                      : 'bg-neutral-100 text-neutral-600 border border-transparent hover:bg-neutral-200'
                  }`}
                >
                  {tag.name}
                </span>
              ))}
              <span 
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-white border border-dashed border-neutral-300 text-neutral-500 rounded-md text-sm font-medium cursor-pointer hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
              >
                + Thêm thẻ mới
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
