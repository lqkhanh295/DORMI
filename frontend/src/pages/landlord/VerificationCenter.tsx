import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';

export default function VerificationCenter() {
  const [submitted, setSubmitted] = useState(false);
  const [idNumber, setIdNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Đã gửi yêu cầu xác thực thành công!', {
      description: 'Ban quản trị sẽ kiểm duyệt giấy tờ trong vòng 24 giờ.'
    });
  };

  // ponytail: VerificationCenter using Level 2 Soft Clay cards and Inset Clay form fields
  return (
    <div className="max-w-3xl mx-auto space-y-6 bg-[#F5F7FA]">
      <div>
        <h1 className="text-h2 font-bold text-[#0F172A]">Xác minh danh tính chủ trọ</h1>
        <p className="text-body text-[#64748B]">Xác thực thông tin định danh để tăng độ tin cậy và nhận nhãn chủ trọ xác thực.</p>
      </div>

      <Card className="bg-white rounded-[18px] shadow-clay-soft p-8 border-none space-y-6">
        {submitted ? (
          <div className="p-6 bg-[#F0FDF4] border border-[#DCFCE7] rounded-[12px] text-center space-y-2">
            <h3 className="text-h3 font-bold text-[#16803C]">✓ Hồ sơ đang được kiểm duyệt</h3>
            <p className="text-caption text-[#16803C]">Cảm ơn bạn đã gửi thông tin. Chúng tôi sẽ phản hồi kết quả sớm nhất.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Số Căn cước công dân (CCCD)" 
              placeholder="Nhập 12 chữ số trên CCCD"
              value={idNumber}
              onChange={e => setIdNumber(e.target.value)}
              required
            />

            <div className="space-y-2">
              <label className="text-caption font-semibold text-[#64748B] block">Ảnh chụp CCCD (Mặt trước & Mặt sau)</label>
              <div className="border-2 border-dashed border-[#CBD5E1] rounded-[14px] p-8 text-center bg-[#F5F7FA] shadow-clay-inset hover:bg-white transition-all cursor-pointer">
                <p className="text-body text-[#64748B] mb-2">Tải lên ảnh chụp mặt trước và mặt sau CCCD</p>
                <Button type="button" variant="secondary" size="sm">Tải ảnh lên</Button>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" className="px-8">Gửi xác thực ngay</Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
