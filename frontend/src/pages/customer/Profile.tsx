import { GlassButton } from '../../components/ui/GlassButton';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassInput } from '../../components/ui/GlassInput';

export function Profile() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <GlassCard tone="solid">
        <h2 className="mb-6 text-xl font-extrabold">Thông tin cá nhân</h2>
        <div className="mb-8 flex gap-6">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Customer" alt="Ảnh đại diện" className="h-24 w-24 rounded-full border-4 border-white bg-slate-100 shadow-sm" />
          <div className="flex flex-col justify-center gap-2">
            <GlassButton variant="secondary" size="sm">Đổi ảnh đại diện</GlassButton>
            <p className="text-sm text-muted">Ảnh rõ mặt giúp chủ phòng nhận diện khi xem phòng.</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <GlassInput label="Họ và tên" defaultValue="Trần Văn Khách" />
          <GlassInput label="Số điện thoại" defaultValue="0901234567" />
          <GlassInput label="Email" defaultValue="khach@example.com" disabled />
          <GlassInput label="Năm sinh" defaultValue="2002" />
        </div>
      </GlassCard>

      <GlassCard tone="solid">
        <h2 className="mb-2 text-xl font-extrabold">Khảo sát ghép phòng</h2>
        <p className="mb-6 text-muted">DORMI dùng các lựa chọn này để gợi ý bạn cùng phòng hợp hơn.</p>
        <div className="flex flex-col gap-6">
          <div>
            <label className="mb-3 block text-sm font-bold">Thói quen sinh hoạt</label>
            <div className="flex flex-wrap gap-2">
              {['Ngủ sớm', 'Không hút thuốc'].map((item) => (
                <span key={item} className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-white">{item}</span>
              ))}
              {['Thích nấu ăn', 'Nuôi thú cưng', 'Cần yên tĩnh'].map((item) => (
                <button key={item} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-muted hover:bg-slate-200 hover:text-foreground">{item}</button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <GlassButton>Lưu thông tin</GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
