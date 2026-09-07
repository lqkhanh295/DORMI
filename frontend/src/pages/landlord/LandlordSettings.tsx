import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { profilesApi } from '../../services/api';
import { toast } from 'sonner';

export default function LandlordSettings() {
  const [phoneNumber, setPhoneNumber] = useState('0901234567');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    profilesApi.getLandlordProfile()
      .then(res => {
        if (!isMounted) return;
        if (res?.phoneNumber) {
          setPhoneNumber(res.phoneNumber);
        }
      })
      .catch((err) => {
        console.warn('profilesApi.getLandlordProfile failed:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await profilesApi.updateLandlordProfile({ phoneNumber });
      toast.success('Cập nhật cài đặt chủ trọ vào Backend API thành công!');
    } catch {
      toast.error('Không thể lưu cài đặt.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 bg-[#F5F7FA]">
      <div>
        <h1 className="text-h2 font-bold text-[#0F172A]">Cài đặt chủ trọ (API Connected)</h1>
        <p className="text-body text-[#64748B]">Quản lý thông tin liên hệ thời gian thực.</p>
      </div>

      <Card className="bg-white rounded-[18px] shadow-clay-soft p-8 border-none space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          <Input 
            label="Số điện thoại liên hệ" 
            value={phoneNumber} 
            onChange={e => setPhoneNumber(e.target.value)}
            disabled={loading}
          />

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="primary" className="px-8" disabled={loading}>Lưu vào API</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
