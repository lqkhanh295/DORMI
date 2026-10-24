import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { roommatesApi } from '../../services/api';
import { toast } from 'sonner';
import { Calendar, DollarSign, MapPin, Users, Check, Home, X, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';

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
  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get('id') || searchParams.get('edit');

  const roomState = location.state as { roomId?: string; roomTitle?: string; roomAddress?: string; roomPrice?: number } | null;

  const [loadingInitial, setLoadingInitial] = useState(!!editId);
  const [submitting, setSubmitting] = useState(false);

  const [attachedRoomId, setAttachedRoomId] = useState<string | undefined>(roomState?.roomId);
  const [attachedRoomTitle, setAttachedRoomTitle] = useState<string | undefined>(roomState?.roomTitle);
  const [attachedRoomAddress, setAttachedRoomAddress] = useState<string | undefined>(roomState?.roomAddress);
  const [attachedRoomPrice, setAttachedRoomPrice] = useState<number | undefined>(roomState?.roomPrice);

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
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!editId) return;

    let isMounted = true;
    setLoadingInitial(true);

    roommatesApi.getPostById(editId)
      .then(post => {
        if (!isMounted || !post) return;
        setTitle(post.title || '');
        setDistrict(post.location || 'Quận 10');
        setBudget(post.budget || 3500000);
        if (post.moveInDate) {
          setMoveInDate(post.moveInDate.split('T')[0]);
        }
        setGenderPreference(post.genderPreference || 'Any');
        if (post.lifestyleTraits) {
          const traits = post.lifestyleTraits.split(',').map(s => s.trim()).filter(Boolean);
          setSelectedTraits(traits);
        }
        setBio(post.description || '');
        setIsActive(post.isActive ?? true);

        if (post.roomId) {
          setAttachedRoomId(post.roomId);
          setAttachedRoomTitle(post.roomTitle);
          setAttachedRoomAddress(post.roomAddress);
          setAttachedRoomPrice(post.roomPrice);
        }
      })
      .catch((err: any) => {
        if (!isMounted) return;
        toast.error(err?.message || 'Không tìm thấy bài đăng hoặc bạn không có quyền chỉnh sửa.');
        navigate('/tenant/match?tab=my-posts');
      })
      .finally(() => {
        if (isMounted) setLoadingInitial(false);
      });

    return () => { isMounted = false; };
  }, [editId, navigate]);

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
      const payload = {
        title: title.trim(),
        description: bio.trim() || 'Tìm bạn cùng phòng hòa đồng, giữ gìn vệ sinh chung.',
        budget: numBudget,
        location: district,
        moveInDate: new Date(moveInDate).toISOString(),
        genderPreference: genderPreference,
        lifestyleTraits: selectedTraits.join(', '),
        roomId: attachedRoomId,
        isActive: isActive
      };

      if (editId) {
        await roommatesApi.updatePost(editId, payload);
        toast.success('Đã cập nhật bài đăng tìm bạn ở ghép!');
      } else {
        await roommatesApi.createPost(payload);
        toast.success('Đã đăng tin tìm bạn ở ghép!');
      }

      navigate('/tenant/match?tab=my-posts');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể lưu bài đăng. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="max-w-3xl mx-auto py-16 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#00153D]" />
        <p className="text-body text-[#64748B]">Đang tải dữ liệu bài đăng...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 md:py-8 space-y-6 bg-[#F8FAFC]">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link 
              to="/tenant/match?tab=my-posts"
              className="inline-flex items-center gap-1 text-caption font-semibold text-[#64748B] hover:text-[#00153D] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại bài đăng của tôi</span>
            </Link>
          </div>
          <h1 className="text-h2 font-bold text-[#0F172A]">
            {editId ? 'Chỉnh sửa tin tìm bạn ở ghép' : 'Tạo tin tìm bạn ở ghép'}
          </h1>
          <p className="text-body text-[#64748B]">
            {editId 
              ? 'Cập nhật thói quen sống và mong muốn của bạn để thuật toán kết nối bạn ở ghép tốt nhất.'
              : 'Chia sẻ thói quen sống và mong muốn của bạn để thuật toán kết nối bạn ở ghép phù hợp nhất.'}
          </p>
        </div>

        <Link
          to="/tenant/match?tab=my-posts"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-caption font-bold text-[#00153D] hover:bg-slate-50 transition-colors shadow-xs shrink-0 self-start sm:self-center"
        >
          <span>Quản lý bài của tôi</span>
        </Link>
      </div>

      {attachedRoomId && (
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-[18px] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-700">Phòng trọ được gắn kèm tin đăng</span>
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

      <Card className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          
          {/* Post Visibility Status (When editing) */}
          {editId && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                  {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-caption font-bold text-slate-900">
                    Trạng thái hiển thị tin: {isActive ? 'Đang hiển thị' : 'Đã tạm dừng'}
                  </h4>
                  <p className="text-[12px] text-slate-500">
                    {isActive 
                      ? 'Bài viết của bạn đang công khai và được hiển thị trong mục gợi ý ở ghép.' 
                      : 'Bài viết đã tạm ẩn, người khác sẽ không nhìn thấy cho đến khi bạn bật lại.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(prev => !prev)}
                className={`px-3.5 py-1.5 rounded-lg text-caption font-bold transition-colors shrink-0 ${
                  isActive 
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {isActive ? 'Tạm dừng hiển thị' : 'Mở hiển thị lại'}
              </button>
            </div>
          )}

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
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-body text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00153D]/10 focus:border-[#00153D] transition-colors min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-[#0F172A] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-500" /> Khu vực mong muốn
              </label>
              <select 
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00153D]/10 focus:border-[#00153D] transition-colors min-h-[44px]"
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
                <DollarSign className="w-4 h-4 text-slate-500" /> Ngân sách tối đa (VND/tháng) <span className="text-rose-500">*</span>
              </label>
              <input 
                type="number"
                min={500000}
                step={100000}
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="Ví dụ: 3500000"
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-body text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00153D]/10 focus:border-[#00153D] transition-colors min-h-[44px]"
              />
              <p className="text-[11px] text-slate-500">
                = {Number(budget || 0).toLocaleString('vi-VN')} đ/tháng
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Move-in Date */}
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-[#0F172A] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-500" /> Ngày dự kiến dọn vào
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={moveInDate}
                onChange={e => setMoveInDate(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00153D]/10 focus:border-[#00153D] transition-colors min-h-[44px]"
              />
            </div>

            {/* Gender Preference */}
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-[#0F172A] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-500" /> Ưu tiên giới tính
              </label>
              <select
                value={genderPreference}
                onChange={e => setGenderPreference(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00153D]/10 focus:border-[#00153D] transition-colors min-h-[44px]"
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
                    className={`px-3.5 py-1.5 rounded-full text-caption font-semibold transition-all duration-150 active:scale-95 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#00153D] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700'
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
              className="w-full bg-white border border-slate-200 rounded-xl p-4 text-body text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00153D]/10 focus:border-[#00153D] transition-colors"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => navigate('/tenant/match?tab=my-posts')}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              className="px-8 flex items-center gap-2" 
              disabled={submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting 
                ? (editId ? 'Đang cập nhật...' : 'Đang đăng tin...') 
                : (editId ? 'Lưu thay đổi' : 'Đăng bài ngay')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
