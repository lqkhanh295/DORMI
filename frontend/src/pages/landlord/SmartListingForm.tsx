import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function SmartListingForm() {
  const [step, setStep] = useState(1);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const simulateAI = () => {
    setAiAnalyzing(true);
    setTimeout(() => {
      setAiAnalyzing(false);
      setStep(4);
    }, 1500);
  };

  // ponytail: SmartListingForm using Level 2 Soft Clay form container and Deep Navy progress bar
  return (
    <div className="max-w-3xl mx-auto space-y-6 bg-[#F5F7FA]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-h2 font-bold text-[#0F172A]">Tạo tin đăng phòng trọ</h1>
        <div className="flex gap-2">
          {[1,2,3,4].map(s => (
            <div key={s} className={`w-12 h-2.5 rounded-full transition-all ${step >= s ? 'bg-[#00153D]' : 'bg-[#E2E8F0]'}`} />
          ))}
        </div>
      </div>

      <Card className="p-8 bg-white rounded-[18px] shadow-clay-soft border-none">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-h3 font-bold text-[#0F172A] mb-4">Bước 1: Thông tin cơ bản</h2>
            <Input label="Tên tin đăng" placeholder="Ví dụ: Căn hộ Studio hiện đại gần Đại học" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Giá thuê hàng tháng (VND)" type="number" placeholder="5000000" />
              <Input label="Tiền cọc (VND)" type="number" placeholder="5000000" />
            </div>
            <div className="pt-4 flex justify-end">
              <Button onClick={() => setStep(2)}>Tiếp theo</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-h3 font-bold text-[#0F172A] mb-4">Bước 2: Hình ảnh thực tế</h2>
            <div className="border-2 border-dashed border-[#CBD5E1] rounded-[14px] p-12 text-center bg-[#F5F7FA] shadow-clay-inset hover:bg-white transition-all cursor-pointer">
              <div className="text-[#64748B] text-body mb-3">Kéo & thả hình ảnh phòng trọ thực tế vào đây</div>
              <Button variant="secondary" size="sm">Chọn hình ảnh</Button>
            </div>
            <div className="pt-4 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Quay lại</Button>
              <Button onClick={() => setStep(3)}>Tiếp theo</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center py-12">
            <h2 className="text-h3 font-bold text-[#0F172A] mb-2">Bước 3: Kiểm tra chất lượng tin đăng</h2>
            <p className="text-body text-[#64748B] mb-8 max-w-md mx-auto">
              Hệ thống đối soát chất lượng ảnh và xác thực nội dung tin đăng để đảm bảo tính thực tế.
            </p>
            {aiAnalyzing ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-[#00153D] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#00153D] font-semibold text-body">Đang đối soát dữ liệu...</p>
              </div>
            ) : (
              <Button size="lg" onClick={simulateAI}>Bắt đầu đối soát tin</Button>
            )}
            <div className="pt-12 flex justify-start">
              <Button variant="ghost" onClick={() => setStep(2)} disabled={aiAnalyzing}>Quay lại</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-[#F0FDF4] border border-[#DCFCE7] rounded-[12px]">
              <div className="text-[#16803C] text-xl font-bold">✓</div>
              <div>
                <h3 className="font-bold text-[#16803C] text-body">Tin đăng đạt yêu cầu xác thực</h3>
                <p className="text-[#16803C] text-caption mt-0.5">Hình ảnh thực tế đã được duyệt. Tiêu đề và từ khóa tìm kiếm đã được tối ưu.</p>
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
              <Input label="Tiêu đề chuẩn hóa" defaultValue="Studio Hiện Đại - Cách Đại Học Quốc Gia 5 Phút" />
              <div>
                <label className="text-caption font-semibold text-[#64748B]">Từ khóa đề xuất</label>
                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1 bg-[#F5F7FA] text-[#00153D] border border-[#E2E8F0] rounded-full text-caption font-semibold">Khu vực yên tĩnh</span>
                  <span className="px-3 py-1 bg-[#F5F7FA] text-[#00153D] border border-[#E2E8F0] rounded-full text-caption font-semibold">Wifi tốc độ cao</span>
                  <span className="px-3 py-1 bg-[#F5F7FA] text-[#00153D] border border-[#E2E8F0] rounded-full text-caption font-semibold-[#00153D]">Phù hợp sinh viên</span>
                </div>
              </div>
            </div>

            <div className="pt-8 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(3)}>Quay lại</Button>
              <Button>Đăng tin ngay</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
