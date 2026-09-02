import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';

export default function CreateRoommatePost() {
  const navigate = useNavigate();
  const [district, setDistrict] = useState('Quận 10');
  const [budget, setBudget] = useState('3M - 5M');
  const [bio, setBio] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Đăng bài tìm ở ghép thành công!');
    navigate('/tenant/match');
  };

  // ponytail: CreateRoommatePost with Level 2 Soft Clay form container and Level 1 Clay CTA
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6 bg-[#F5F7FA]">
      <div className="space-y-2">
        <h1 className="text-h2 font-bold text-[#0F172A]">Tạo tin tìm bạn ở ghép</h1>
        <p className="text-body text-[#64748B]">Chia sẻ thói quen sống và mong muốn của bạn để kết nối bạn ở ghép phù hợp.</p>
      </div>

      <Card className="bg-white rounded-[18px] shadow-clay-soft p-8 border-none">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-caption font-semibold text-[#64748B] block">Khu vực mong muốn</label>
            <select 
              value={district}
              onChange={e => setDistrict(e.target.value)}
              className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white min-h-[44px]"
            >
              <option value="Quận 10">Quận 10</option>
              <option value="Quận 7">Quận 7</option>
              <option value="Quận 3">Quận 3</option>
              <option value="Bình Thạnh">Bình Thạnh</option>
              <option value="Tân Bình">Tân Bình</option>
            </select>
          </div>

          <Input 
            label="Ngân sách dự kiến (VND / tháng)"
            placeholder="Ví dụ: 3M - 5M VND"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="text-caption font-semibold text-[#64748B] block">Giới thiệu bản thân & thói quen sinh hoạt</label>
            <textarea 
              rows={4}
              placeholder="Chia sẻ về giờ giấc sinh hoạt, tính cách, thói quen giữ vệ sinh..."
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] p-4 text-body text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Hủy</Button>
            <Button type="submit" variant="primary" className="px-8">Đăng bài ngay</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
