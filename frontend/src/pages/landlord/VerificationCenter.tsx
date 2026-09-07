import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { profilesApi } from '../../services/api';
import { toast } from 'sonner';

export default function VerificationCenter() {
  const [submitted, setSubmitted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await profilesApi.updateLandlordProfile({
        phoneNumber: phoneNumber || '0901234567'
      });
      setSubmitted(true);
      toast.success('Đã gửi yêu cầu xác thực tới Backend API!', {
        description: 'Ban quản trị sẽ kiểm duyệt thông tin trong vòng 24 giờ.'
      });
    } catch {
      toast.error('Không thể gửi yêu cầu xác thực.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 bg-[#F5F7FA]">
      <div>
        <h1 className="text-h2 font-bold text-[#0F172A]">Xác minh danh tính chủ trọ (API Connected)</h1>
        <p className="text-body text-[#64748B]">Xác thực thông tin định danh để tăng độ tin cậy và nhận nhãn chủ trọ xác thực.</p>
      </div>

      <Card className="bg-white rounded-[18px] shadow-clay-soft p-8 border-none space-y-6">
        {submitted ? (
          <div className="p-6 bg-[#F0FDF4] border border-[#DCFCE7] rounded-[12px] text-center space-y-2">
            <h3 className="text-h3 font-bold text-[#16803C]">✓ Hồ sơ đang được kiểm duyệt (API Saved)</h3>
            <p className="text-caption text-[#16803C]">Cảm ơn bạn đã gửi thông tin. Hệ thống đã ghi nhận yêu cầu.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Số điện thoại xác minh" 
              placeholder="Nhập số điện thoại liên hệ"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              required
            />

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" className="px-8">Gửi xác thực (API)</Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
