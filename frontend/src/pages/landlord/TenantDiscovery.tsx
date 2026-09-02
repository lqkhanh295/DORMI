import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function TenantDiscovery() {
  const navigate = useNavigate();
  const [tenants] = useState([
    { id: '1', name: 'Nguyễn Minh', age: 22, role: 'Sinh viên Q10', budget: '3 - 4.5 triệu/tháng', habits: ['Không hút thuốc', 'Yên tĩnh', 'Dậy sớm'], match: '92%' },
    { id: '2', name: 'Trần Hoàng', age: 24, role: 'Nhân viên IT', budget: '4 - 6 triệu/tháng', habits: ['Sạch sẽ', 'Cú đêm', 'Không thú cưng'], match: '88%' }
  ]);

  // ponytail: TenantDiscovery using Level 2 Soft Clay candidate profile cards
  return (
    <div className="space-y-6 bg-[#F5F7FA]">
      <div>
        <h1 className="text-h2 font-bold text-[#0F172A]">Tìm khách thuê phù hợp</h1>
        <p className="text-body text-[#64748B]">Khám phá hồ sơ người thuê đang tìm phòng có thói quen sinh hoạt tốt.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tenants.map(tenant => (
          <Card key={tenant.id} className="bg-white rounded-[18px] shadow-clay-soft p-6 border-none hover:-translate-y-[2px] transition-all space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#00153D] text-white flex items-center justify-center text-h3 font-bold">
                  {tenant.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-h3 font-bold text-[#0F172A]">{tenant.name}</h3>
                  <p className="text-caption text-[#64748B]">{tenant.age} tuổi · {tenant.role}</p>
                </div>
              </div>
              <span className="bg-[#F0FDF4] text-[#16803C] border border-[#DCFCE7] text-caption font-bold px-3 py-1 rounded-full">
                {tenant.match} phù hợp
              </span>
            </div>

            <div className="bg-[#F5F7FA] shadow-clay-inset p-3.5 rounded-[12px] text-caption space-y-1">
              <span className="text-[#64748B] block font-semibold">Ngân sách mong muốn</span>
              <span className="text-[#00153D] font-bold text-body">{tenant.budget}</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {tenant.habits.map((h, i) => (
                <span key={i} className="px-3 py-1 bg-[#F5F7FA] border border-[#E2E8F0] text-[#0F172A] rounded-full text-caption font-semibold">
                  {h}
                </span>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={() => navigate('/landlord/chat')}>Mời xem phòng</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
