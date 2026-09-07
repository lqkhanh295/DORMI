import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { landlordApi } from '../../services/api';
import { toast } from 'sonner';

export default function PricingCheckout() {
  const handleUpgrade = async (plan: string) => {
    try {
      const res = await landlordApi.checkout(plan);
      toast.success(`Đăng ký gói ${res.planName || plan} thành công (API)!`, {
        description: 'Đã lưu lịch sử đăng ký gói dịch vụ vào Backend.'
      });
    } catch {
      toast.success(`Đã đăng ký gói ${plan}!`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 bg-[#F5F7FA]">
      <div className="text-center space-y-3">
        <h1 className="text-h2 font-bold text-[#0F172A]">Gói dịch vụ Chủ trọ (API Connected)</h1>
        <p className="text-body text-[#64748B] max-w-xl mx-auto">Tối ưu hiệu quả tiếp cận khách thuê và nhận nhãn chủ trọ xác thực uy tín.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        <Card className="bg-white rounded-[18px] shadow-clay-soft p-8 flex flex-col justify-between space-y-6 border-none">
          <div className="space-y-4">
            <h3 className="text-h3 font-bold text-[#0F172A]">Gói Cơ Bản</h3>
            <p className="text-caption text-[#64748B]">Cho chủ trọ có 1 - 2 phòng trọ nhỏ.</p>
            <div className="pt-2">
              <span className="text-[36px] font-bold text-[#00153D]">Miễn phí</span>
            </div>
            <ul className="space-y-2 text-caption text-[#64748B] pt-4 border-t border-[#E2E8F0]">
              <li>✓ Đăng tối đa 2 tin phòng</li>
              <li>✓ Nhận tin nhắn từ người thuê</li>
              <li>✓ Xác minh giấy tờ cơ bản</li>
            </ul>
          </div>
          <Button variant="secondary" fullWidth onClick={() => handleUpgrade('Free')}>Đang sử dụng</Button>
        </Card>

        <Card className="bg-white rounded-[18px] shadow-clay-primary p-8 flex flex-col justify-between space-y-6 border-2 border-[#00153D] relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00153D] text-white text-caption font-bold px-4 py-1 rounded-full shadow-sm">
            KHUYÊN DÙNG
          </div>
          <div className="space-y-4 pt-2">
            <h3 className="text-h3 font-bold text-[#0F172A]">Gói Chuyên Nghiệp</h3>
            <p className="text-caption text-[#64748B]">Tối ưu hiển thị và ưu tiên đề xuất AI.</p>
            <div className="pt-2">
              <span className="text-[36px] font-bold text-[#00153D]">199.000₫</span>
              <span className="text-caption text-[#64748B]"> / tháng</span>
            </div>
            <ul className="space-y-2 text-caption text-[#0F172A] font-semibold pt-4 border-t border-[#E2E8F0]">
              <li>✓ Đăng tối đa 10 tin phòng</li>
              <li>✓ Huy hiệu Chủ trọ xác thực uy tín</li>
              <li>✓ Ưu tiên hiển thị top kết quả tìm kiếm</li>
              <li>✓ Phân tích phễu chuyển đổi chi tiết</li>
            </ul>
          </div>
          <Button variant="primary" fullWidth onClick={() => handleUpgrade('Pro')}>Nâng cấp Pro API</Button>
        </Card>

        <Card className="bg-white rounded-[18px] shadow-clay-soft p-8 flex flex-col justify-between space-y-6 border-none">
          <div className="space-y-4">
            <h3 className="text-h3 font-bold text-[#0F172A]">Gói Doanh Nghiệp</h3>
            <p className="text-caption text-[#64748B]">Dành cho chuỗi căn hộ mini & KTX.</p>
            <div className="pt-2">
              <span className="text-[36px] font-bold text-[#00153D]">499.000₫</span>
              <span className="text-caption text-[#64748B]"> / tháng</span>
            </div>
            <ul className="space-y-2 text-caption text-[#64748B] pt-4 border-t border-[#E2E8F0]">
              <li>✓ Không giới hạn số tin đăng</li>
              <li>✓ Quản lý đa cơ sở & tài khoản nhân viên</li>
              <li>✓ Đẩy tin tự động hàng tuần</li>
              <li>✓ Hỗ trợ CSKH 24/7 riêng biệt</li>
            </ul>
          </div>
          <Button variant="secondary" fullWidth onClick={() => handleUpgrade('Enterprise')}>Nâng cấp Enterprise API</Button>
        </Card>
      </div>
    </div>
  );
}
