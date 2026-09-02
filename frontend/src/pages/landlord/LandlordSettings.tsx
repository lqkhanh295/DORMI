import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';

export default function LandlordSettings() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Cập nhật cài đặt chủ trọ thành công!');
  };

  // ponytail: LandlordSettings using Level 2 Soft Clay container and Inset Clay form fields
  return (
    <div className="max-w-3xl mx-auto space-y-6 bg-[#F5F7FA]">
      <div>
        <h1 className="text-h2 font-bold text-[#0F172A]">Cài đặt chủ trọ</h1>
        <p className="text-body text-[#64748B]">Quản lý thông tin liên hệ và phương thức nhận tiền thuê.</p>
      </div>

      <Card className="bg-white rounded-[18px] shadow-clay-soft p-8 border-none space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          <Input label="Tên thương hiệu / Nhà trọ" defaultValue="Nhà Trọ Hưng Phát" />
          <Input label="Số điện thoại Zalo liên hệ" defaultValue="0909123456" />
          <Input label="Số tài khoản ngân hàng nhận cọc" defaultValue="19038291029301 (Techcombank)" />

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="primary" className="px-8">Lưu cài đặt</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
