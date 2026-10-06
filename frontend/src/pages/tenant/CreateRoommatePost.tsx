import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { roommatesApi } from '../../services/api';
import { toast } from 'sonner';
import { Calendar, DollarSign, MapPin, Users, Check, Home, X } from 'lucide-react';

const COMMON_TRAITS = [
  'Không hút thuốc',
  'Sạch sẽ ngăn nắp',
  'Ngủ sớm',
  'Thức khuya',
  'Yên tĩnh',
  'Thân thiện hòa đồng',
  'Sinh viên',
  'Đi làm văn phòng',
  'Nấu ăn tại phòng',
  'Yêu thú cưng'
];

export default function CreateRoommatePost() {
  const navigate = useNavigate();
  const location = useLocation();
  const roomState = location.state as { roomId?: string; roomTitle?: string; roomAddress?: string; roomPrice?: number } | null;

  const [attachedRoomId, setAttachedRoomId] = useState<string | undefined>(roomState?.roomId);
  const [attachedRoomTitle, setAttachedRoomTitle] = useState<string | undefined>(roomState?.roomTitle);
  const [attachedRoomAddress, setAttachedRoomAddress] = useState<string | undefined>(roomState?.roomAddress);
  const [attachedRoomPrice, setAttachedRoomPrice] = useState<number | undefined>(roomState?.roomPrice);

  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState(roomState?.roomTitle ? `Tìm bạn ở ghép: ${roomState.roomTitle}` : '');
  const [district, setDistrict] = useState(roomState?.roomAddress || 'Quận 10');
  const [budget, setBudget] = useState<number | string>(roomState?.roomPrice ? Math.round(roomState.roomPrice / 2) : '3500000');
  const [moveInDate, setMoveInDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [genderPreference, setGenderPreference] = useState('Any');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([
    'Không hút thuốc',
    'Sạch sẽ ngăn nắp'
  ]);
  const [bio, setBio] = useState('');

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev => 
      prev.includes(trait) ? prev.filter(t => t !== trait) : [...prev, trait]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài đăng.');
      return;
    }

    const numBudget = Number(budget);
    if (isNaN(numBudget) || numBudget <= 0) {
      toast.error('Vui lòng nhập ngân sách hợp lệ (lớn hơn 0đ).');
      return;
    }

    try {
      setSubmitting(true);
      await roommatesApi.createPost({
        title: title.trim(),
        description: bio.trim() || 'Tìm bạn cùng phòng hòa đồng, giữ gìn vệ sinh chung.',
        budget: numBudget,
        location: district,
        moveInDate: new Date(moveInDate).toISOString(),
        genderPreference: genderPreference,
        lifestyleTraits: selectedTraits.join(', '),
        roomId: attachedRoomId
      });

      toast.success('Đã đăng bài tìm bạn ở ghép thành công!');
      navigate('/tenant/match');
    } catch (err: any) {
      toast.error(err?.message || 'Đăng tin thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6 bg-[#F5F7FA]">
      <div className="space-y-2">
        <h1 className="text-h2 font-bold text-[#0F172A]">
          Tạo tin tìm bạn ở ghép
        </h1>
        <p className="text-body text-[#64748B]">
          Chia sẻ thói quen sống và mong muốn của bạn để thuật toán kết nối bạn ở ghép phù hợp nhất.
        </p>
      </div>

      {attachedRoomId && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-[18px] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Phòng trọ được gắn kèm tin đăng</span>
              <h4 className="text-body font-bold text-slate-900">{attachedRoomTitle || 'Phòng trọ DORMI'}</h4>
              <p className="text-caption text-slate-500">
                {attachedRoomAddress} · Giá gốc: {attachedRoomPrice ? `${Number(attachedRoomPrice).toLocaleString('vi-VN')}đ/tháng` : 'Thương lượng'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setAttachedRoomId(undefined);
              setAttachedRoomTitle(undefined);
              setAttachedRoomAddress(undefined);
              setAttachedRoomPrice(undefined);
            }}
            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
            title="Gỡ liên kết phòng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <Card className="bg-white rounded-[18px] shadow-clay-soft p-8 border-none">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-caption font-semibold text-[#0F172A] block">
              Tiêu đề bài đăng <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ví dụ: Sinh viên Bách Khoa tìm bạn nam ở ghép phòng Q10 sạch sẽ"
              className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-[#0F172A] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#64748B]" /> Khu vực mong muốn
              </label>
              <select 
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white min-h-[44px]"
              >
                <option value="Quận 1">Quận 1</option>
                <option value="Quận 3">Quận 3</option>
                <option value="Quận 5">Quận 5</option>
                <option value="Quận 7">Quận 7</option>
                <option value="Quận 10">Quận 10</option>
                <option value="Bình Thạnh">Bình Thạnh</option>
                <option value="Phú Nhuận">Phú Nhuận</option>
                <option value="Tân Bình">Tân Bình</option>
                <option value="Gò Vấp">Gò Vấp</option>
                <option value="Thủ Đức">TP. Thủ Đức</option>
              </select>
            </div>

            {/* Budget */}
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-[#0F172A] flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#64748B]" /> Ngân sách tối đa (VND/tháng) <span className="text-rose-500">*</span>
              </label>
              <input 
                type="number"
                min={500000}
                step={100000}
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="Ví dụ: 3500000"
                required
                className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white min-h-[44px]"
              />
              <p className="text-[11px] text-[#64748B]">
                = {Number(budget || 0).toLocaleString('vi-VN')} đ/tháng
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Move-in Date */}
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-[#0F172A] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#64748B]" /> Ngày dự kiến dọn vào
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={moveInDate}
                onChange={e => setMoveInDate(e.target.value)}
                required
                className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white min-h-[44px]"
              />
            </div>

            {/* Gender Preference */}
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-[#0F172A] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#64748B]" /> Ưu tiên giới tính
              </label>
              <select
                value={genderPreference}
                onChange={e => setGenderPreference(e.target.value)}
                className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white min-h-[44px]"
              >
                <option value="Any">Không yêu cầu (Nam / Nữ đều được)</option>
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
              </select>
            </div>
          </div>

          {/* Lifestyle Traits Multi-Select */}
          <div className="space-y-2">
            <label className="text-caption font-semibold text-[#0F172A] block">
              Thói quen sinh hoạt & phong cách sống (Chọn nhiều)
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_TRAITS.map(trait => {
                const isSelected = selectedTraits.includes(trait);
                return (
                  <button
                    key={trait}
                    type="button"
                    onClick={() => toggleTrait(trait)}
                    className={`px-3.5 py-1.5 rounded-full text-caption font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#00153D] text-white shadow-sm'
                        : 'bg-[#F5F7FA] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    {trait}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bio / Description */}
          <div className="space-y-1.5">
            <label className="text-caption font-semibold text-[#0F172A] block">
              Giới thiệu bản thân & mong muốn ở ghép
            </label>
            <textarea 
              rows={4}
              placeholder="Chia sẻ về tính cách của bạn, giờ giấc đi làm/học, đồ đạc mang theo, hoặc yêu cầu đặc biệt..."
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] p-4 text-body text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" className="px-8" disabled={submitting}>
              {submitting ? 'Đang đăng tin...' : 'Đăng bài ngay'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
