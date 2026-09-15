import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { landlordApi } from '../../services/api';
import { Eye, Heart, MessageSquare, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LeadAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    landlordApi.getLeadAnalytics()
      .then(res => {
        if (res) setAnalytics(res);
      })
      .catch(err => console.warn('Failed to load lead analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  const totalViews = analytics?.totalViews ?? 0;
  const totalSaves = analytics?.totalSaves ?? 0;
  const totalContacts = analytics?.totalContacts ?? 0;
  const conversionRateSave = analytics?.conversionRateSave ?? 0;
  const conversionRateContact = analytics?.conversionRateContact ?? 0;
  const dailyViews = analytics?.dailyViews || [];
  const roomStats = analytics?.roomStats || [];

  const maxDayViews = Math.max(...dailyViews.map((d: any) => d.views || 0), 1);

  return (
    <div className="space-y-6 bg-[#F5F7FA]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-bold text-[#0F172A] flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-[#2563EB]" />
            Phân tích chuyển đổi & Khách tiềm năng (Lead Analytics)
          </h1>
          <p className="text-body text-[#64748B]">
            Dữ liệu thực tế tổng hợp 30 ngày từ lượt xem trang, danh sách yêu thích và liên hệ đặt lịch.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[#64748B]">Đang tải số liệu phân tích...</div>
      ) : (
        <>
          {/* Main Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 lg:col-span-2 bg-white rounded-[18px] shadow-clay-soft border-none">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-h3 font-bold text-[#0F172A]">Lượt xem & Lưu phòng (30 Ngày)</h3>
                  <p className="text-caption text-[#64748B]">Theo dõi lượng quan tâm theo ngày</p>
                </div>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1.5 text-caption font-semibold text-[#64748B]">
                    <div className="w-3 h-3 bg-[#2563EB] rounded-full"></div> Lượt xem
                  </span>
                  <span className="flex items-center gap-1.5 text-caption font-semibold text-[#64748B]">
                    <div className="w-3 h-3 bg-[#E11D48] rounded-full"></div> Đã lưu
                  </span>
                </div>
              </div>

              {dailyViews.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-[#64748B] text-caption">
                  Chưa có đủ dữ liệu lượt xem trong 30 ngày qua.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="h-64 flex items-end justify-between gap-2 border-b border-l border-[#E2E8F0] pb-2 pl-2">
                    {dailyViews.map((item: any, i: number) => {
                      const viewHeight = Math.min(100, Math.max(8, (item.views / maxDayViews) * 100));
                      const saveHeight = Math.min(100, Math.max(4, (item.saves / maxDayViews) * 100));
                      return (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1 group relative">
                          <div className="w-full flex justify-center items-end gap-1 h-full">
                            <div 
                              className="w-full max-w-[8px] bg-[#E11D48] rounded-t-sm" 
                              style={{ height: `${saveHeight}%` }}
                              title={`Lưu: ${item.saves}`}
                            ></div>
                            <div 
                              className="w-full max-w-[8px] bg-[#2563EB] rounded-t-sm" 
                              style={{ height: `${viewHeight}%` }}
                              title={`Xem: ${item.views}`}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-caption text-[#64748B] px-2">
                    <span>{dailyViews[0]?.date || 'Bắt đầu'}</span>
                    <span>{dailyViews[Math.floor(dailyViews.length / 2)]?.date || 'Giữa kỳ'}</span>
                    <span>{dailyViews[dailyViews.length - 1]?.date || 'Hôm nay'}</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Funnel */}
            <Card className="p-6 flex flex-col justify-between bg-white rounded-[18px] shadow-clay-soft border-none">
              <div>
                <h3 className="text-h3 font-bold text-[#0F172A] mb-1">Phễu chuyển đổi thực tế</h3>
                <p className="text-caption text-[#64748B] mb-6">Tỷ lệ khách chuyển qua từng bước</p>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-caption font-semibold text-[#64748B] flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-[#2563EB]" /> Lượt xem tin đăng
                      </span>
                      <span className="text-h3 font-bold text-[#0F172A]">{totalViews.toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="w-full h-3 bg-[#F5F7FA] rounded-full overflow-hidden border border-[#E2E8F0]">
                      <div className="bg-[#2563EB] h-full rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-caption font-semibold text-[#64748B] flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-[#E11D48]" /> Lượt thích / Lưu
                      </span>
                      <span className="text-h3 font-bold text-[#0F172A]">{totalSaves.toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="w-full h-3 bg-[#F5F7FA] rounded-full overflow-hidden border border-[#E2E8F0]">
                      <div 
                        className="bg-[#E11D48] h-full rounded-full transition-all" 
                        style={{ width: `${Math.min(100, Math.max(conversionRateSave, 5))}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-1 text-right font-medium">
                      Tỷ lệ lưu: {conversionRateSave}%
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-caption font-semibold text-[#64748B] flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-[#16803C]" /> Liên hệ / Đặt lịch hẹn
                      </span>
                      <span className="text-h3 font-bold text-[#0F172A]">{totalContacts.toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="w-full h-3 bg-[#F5F7FA] rounded-full overflow-hidden border border-[#E2E8F0]">
                      <div 
                        className="bg-[#16803C] h-full rounded-full transition-all" 
                        style={{ width: `${Math.min(100, Math.max(conversionRateContact, 3))}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-1 text-right font-medium">
                      Tỷ lệ liên hệ: {conversionRateContact}%
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                <span className="text-caption text-[#64748B]">Tổng tin đăng hoạt động:</span>
                <span className="font-bold text-[#0F172A]">{roomStats.length} phòng</span>
              </div>
            </Card>
          </div>
          
          <h3 className="text-h2 font-bold text-[#0F172A] mt-8 mb-4">Hiệu quả từng phòng đăng</h3>
          <div className="bg-white rounded-[18px] shadow-clay-soft overflow-hidden border border-[#E2E8F0]">
            {roomStats.length === 0 ? (
              <div className="p-8 text-center text-[#64748B]">
                Bạn chưa có tin đăng nào. Hãy tạo tin đăng mới để theo dõi số liệu!
              </div>
            ) : (
              <table className="min-w-full divide-y divide-[#E2E8F0]">
                <thead className="bg-[#F5F7FA]">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Phòng</th>
                    <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Giá thuê</th>
                    <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Lượt xem</th>
                    <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Lượt lưu</th>
                    <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Liên hệ / Hẹn</th>
                    <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E2E8F0]">
                  {roomStats.map((room: any) => (
                    <tr key={room.roomId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-[#EEF2F6] rounded-[10px] overflow-hidden">
                            <img 
                              src={room.imageUrl || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=100&q=80"} 
                              alt="" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-body font-semibold text-[#0F172A]">{room.title}</div>
                            <div className="text-caption text-[#64748B]">{room.address}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-body text-[#0F172A] font-bold">
                        {Number(room.price).toLocaleString('vi-VN')} đ/tháng
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-body text-[#0F172A] font-semibold">
                        {room.views}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-body text-[#E11D48] font-semibold">
                        {room.saves}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-body text-[#16803C] font-semibold">
                        {room.contacts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-caption font-semibold">
                        <Link to={`/room/${room.roomId}`}>
                          <Button size="sm" variant="ghost" className="text-[#2563EB]">Xem tin</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
