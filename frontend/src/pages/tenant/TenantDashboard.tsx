import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store/useStore';
import { useNavigate, Link } from 'react-router-dom';
import { appointmentsApi, favoritesApi } from '../../services/api';
import { toast } from 'sonner';
import { 
  Calendar, Heart, Search, Users, PlusCircle, 
  MapPin, ShieldCheck, Clock, Trash2, ArrowRight 
} from 'lucide-react';

export default function TenantDashboard() {
  const { listings, fetchListings, currentUser } = useStore();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loadingApts, setLoadingApts] = useState(true);
  const [loadingFavs, setLoadingFavs] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoadingApts(true);
      const apts = await appointmentsApi.getMyAppointments();
      if (Array.isArray(apts)) setAppointments(apts);
    } catch (err) {
      console.warn('Failed to load appointments:', err);
    } finally {
      setLoadingApts(false);
    }

    try {
      setLoadingFavs(true);
      const favs = await favoritesApi.getFavorites();
      if (Array.isArray(favs)) setFavorites(favs);
    } catch (err) {
      console.warn('Failed to load favorites:', err);
    } finally {
      setLoadingFavs(false);
    }
  };

  useEffect(() => {
    fetchListings();
    loadData();
  }, [fetchListings]);

  const handleCancelAppointment = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn xem phòng này?')) return;
    try {
      await appointmentsApi.updateStatus(id, 'Cancelled');
      toast.success('Đã hủy lịch hẹn xem phòng.');
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể hủy lịch hẹn.');
    }
  };

  const handleRemoveFavorite = async (roomId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await favoritesApi.removeFavorite(roomId);
      toast.success('Đã xóa khỏi danh sách yêu thích.');
      setFavorites(prev => prev.filter(f => f.id !== roomId));
    } catch (err: any) {
      toast.error(err?.message || 'Không thể xóa phòng khỏi danh sách yêu thích.');
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="space-y-8 pb-12 bg-[#F5F7FA]">
      {/* Top Banner & Fast Actions */}
      <div className="bg-white p-6 md:p-8 rounded-[18px] shadow-clay-primary space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-h2 font-bold text-[#0F172A] tracking-tight">
              Xin chào{currentUser?.name ? `, ${currentUser.name}` : ''}!
            </h1>
            <p className="text-body text-[#64748B] mt-1">
              Quản lý lịch hẹn xem phòng, danh sách phòng yêu thích và kết nối bạn ở ghép dễ dàng.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/tenant/post">
              <Button variant="primary" className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Đăng tin ở ghép
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-[#64748B]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Tìm kiếm phòng theo tên đường, quận huyện..." 
              className="w-full pl-12 pr-4 py-2.5 bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white transition-all text-body text-[#0F172A] placeholder-[#94A3B8] min-h-[44px]"
            />
          </div>
          <Button onClick={handleSearch} variant="secondary" className="px-6 min-h-[44px]">
            Tìm phòng
          </Button>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#E2E8F0]">
          <div className="p-4 rounded-[14px] bg-[#F5F7FA] border border-[#E2E8F0] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-caption text-[#64748B] font-semibold">Lịch hẹn xem phòng</p>
              <p className="text-h3 font-bold text-[#0F172A]">{appointments.length} cuộc hẹn</p>
            </div>
          </div>

          <div className="p-4 rounded-[14px] bg-[#F5F7FA] border border-[#E2E8F0] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-caption text-[#64748B] font-semibold">Phòng đã lưu (Wishlist)</p>
              <p className="text-h3 font-bold text-[#0F172A]">{favorites.length} phòng</p>
            </div>
          </div>

          <Link to="/tenant/match" className="p-4 rounded-[14px] bg-[#F5F7FA] border border-[#E2E8F0] flex items-center gap-3 hover:bg-slate-100 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-caption text-[#64748B] font-semibold">Lifestyle Matcher</p>
              <p className="text-h3 font-bold text-[#2563EB] flex items-center gap-1">
                Ghép bạn cùng phòng <ArrowRight className="w-4 h-4" />
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* SECTION 1: Lịch hẹn xem phòng của tôi */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-h2 font-bold text-[#0F172A] flex items-center gap-2">
              <Calendar className="w-6 h-6 text-[#2563EB]" />
              Lịch hẹn xem phòng của tôi
            </h2>
            <p className="text-caption text-[#64748B]">Trạng thái các cuộc hẹn trực tiếp với chủ trọ</p>
          </div>
        </div>

        {loadingApts ? (
          <Card className="p-8 text-center text-[#64748B] bg-white rounded-[18px]">
            Đang tải danh sách lịch hẹn...
          </Card>
        ) : appointments.length === 0 ? (
          <Card className="p-8 text-center bg-white rounded-[18px] border border-dashed border-[#CBD5E1] space-y-3">
            <Clock className="w-10 h-10 text-[#94A3B8] mx-auto" />
            <p className="text-body font-semibold text-[#0F172A]">Bạn chưa có lịch hẹn xem phòng nào</p>
            <p className="text-caption text-[#64748B] max-w-md mx-auto">
              Khi tìm thấy căn phòng ưng ý, hãy nhấn nút "Đặt lịch xem phòng" để hẹn gặp trực tiếp chủ nhà.
            </p>
            <Button variant="secondary" onClick={() => navigate('/search')} className="mt-2">
              Khám phá phòng ngay
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map(apt => {
              const dateStr = apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleString('vi-VN', {
                hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
              }) : 'Chưa định ngày';

              const isPending = apt.status === 'Pending';
              const isConfirmed = apt.status === 'Confirmed';
              const isCancelled = apt.status === 'Cancelled';

              return (
                <Card key={apt.id} className="p-5 bg-white rounded-[18px] shadow-clay-soft border border-[#E2E8F0] flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/room/${apt.roomId}`} className="font-bold text-body text-[#0F172A] hover:text-[#2563EB] line-clamp-1 transition-colors">
                        {apt.roomTitle || 'Phòng trọ'}
                      </Link>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 border ${
                        isConfirmed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        isPending ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        isCancelled ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {isConfirmed ? 'Đã xác nhận' : isPending ? 'Chờ xác nhận' : isCancelled ? 'Đã hủy' : 'Hoàn tất'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-caption text-[#64748B]">
                      <div className="flex items-center gap-1.5 text-[#0F172A] font-semibold">
                        <Clock className="w-4 h-4 text-[#2563EB]" />
                        <span>Thời gian: {dateStr}</span>
                      </div>
                      {apt.roomAddress && (
                        <div className="flex items-start gap-1.5 truncate">
                          <MapPin className="w-4 h-4 shrink-0 text-[#64748B] mt-0.5" />
                          <span className="truncate">{apt.roomAddress}</span>
                        </div>
                      )}
                      {apt.notes && (
                        <p className="text-[11px] bg-[#F5F7FA] p-2 rounded-[8px] text-[#475569] italic">
                          Ghi chú: {apt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                    <Link to={`/room/${apt.roomId}`}>
                      <Button size="sm" variant="ghost" className="text-xs text-[#2563EB]">
                        Xem phòng
                      </Button>
                    </Link>

                    {(isPending || isConfirmed) && (
                      <button 
                        onClick={() => handleCancelAppointment(apt.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                      >
                        Hủy hẹn
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Danh sách phòng đã lưu (Wishlist) */}
      <div className="space-y-4 pt-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-h2 font-bold text-[#0F172A] flex items-center gap-2">
              <Heart className="w-6 h-6 text-[#E11D48]" />
              Phòng đã lưu (Wishlist)
            </h2>
            <p className="text-caption text-[#64748B]">Các căn phòng bạn đã lưu lại để cân nhắc</p>
          </div>
          {favorites.length > 0 && (
            <Link to="/search" className="text-body font-semibold text-[#00153D] hover:underline">
              Tìm thêm phòng
            </Link>
          )}
        </div>

        {loadingFavs ? (
          <Card className="p-8 text-center text-[#64748B] bg-white rounded-[18px]">
            Đang tải danh sách phòng đã lưu...
          </Card>
        ) : favorites.length === 0 ? (
          <Card className="p-8 text-center bg-white rounded-[18px] border border-dashed border-[#CBD5E1] space-y-3">
            <Heart className="w-10 h-10 text-[#CBD5E1] mx-auto" />
            <p className="text-body font-semibold text-[#0F172A]">Chưa có phòng nào trong danh sách yêu thích</p>
            <p className="text-caption text-[#64748B]">
              Nhấn vào biểu tượng trái tim ở bất kỳ tin đăng nào để lưu lại xem sau.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {favorites.map(room => {
              const imgUrl = room.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80";
              return (
                <Card 
                  key={room.id}
                  onClick={() => navigate(`/room/${room.id}`)}
                  className="group cursor-pointer flex flex-col h-full bg-white rounded-[18px] shadow-clay-soft p-3 transition-all duration-150 hover:-translate-y-[2px]"
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-[#EEF2F6] rounded-[14px]">
                    <img 
                      src={imgUrl} 
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200" 
                      alt={room.title} 
                    />
                    <button
                      type="button"
                      onClick={(e) => handleRemoveFavorite(room.id, e)}
                      title="Bỏ lưu"
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-rose-50 text-rose-600 flex items-center justify-center shadow-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-3 px-1 pb-1 flex flex-col flex-1 justify-between gap-2">
                    <div>
                      <p className="font-bold text-body text-[#00153D]">
                        {Number(room.price || 0).toLocaleString('vi-VN')} đ<span className="text-caption font-normal text-[#64748B]">/tháng</span>
                      </p>
                      <h4 className="font-bold text-caption text-[#0F172A] line-clamp-2 group-hover:text-[#2563EB] transition-colors mt-1">
                        {room.title}
                      </h4>
                    </div>

                    <div className="flex items-center text-caption text-[#64748B] truncate border-t border-[#E2E8F0] pt-2">
                      <MapPin className="w-3.5 h-3.5 mr-1 shrink-0 text-[#64748B]" />
                      <span className="truncate">{room.address || room.district}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 3: Không gian nổi bật */}
      <div className="space-y-4 pt-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-h2 font-bold text-[#0F172A] tracking-tight">Gợi ý dành cho bạn</h2>
            <p className="text-caption text-[#64748B] font-medium mt-1">Phòng trọ mới đăng có xác thực</p>
          </div>
          <button className="text-body font-semibold text-[#00153D] hover:underline" onClick={() => navigate('/search')}>
            Xem tất cả
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.slice(0, 4).map((room) => (
            <Card 
              key={room.id} 
              onClick={() => navigate('/room/' + room.id)} 
              className="group cursor-pointer flex flex-col h-full bg-white rounded-[18px] shadow-clay-soft p-3 transition-all duration-150 hover:-translate-y-[2px]"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-[#EEF2F6] rounded-[14px]">
                <img 
                  src={room.image} 
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                  alt={room.title}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-white border border-[#E2E8F0] text-[#0F172A] px-3 py-1 rounded-full text-caption font-bold shadow-sm">Cho thuê</span>
                  {room.isVerifiedLandlord && (
                    <span className="bg-[#F0FDF4] text-[#16803C] border border-[#DCFCE7] px-3 py-1 rounded-full text-caption font-bold flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Xác thực
                    </span>
                  )}
                </div>
              </div>
              
              <div className="pt-4 px-2 pb-2 flex flex-col flex-1 justify-between">
                <div>
                  <h4 className="font-bold text-body text-[#0F172A] line-clamp-2 mb-2 group-hover:text-[#00153D] transition-colors leading-snug">
                    {room.title}
                  </h4>
                  <p className="font-bold text-[#00153D] text-body mb-3">
                    {room.price.toLocaleString('vi-VN')} đ<span className="text-caption font-normal text-[#64748B]">/tháng</span>
                  </p>
                </div>
                
                <div className="flex items-center text-caption text-[#64748B] truncate border-t border-[#E2E8F0] pt-2">
                  <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-[#64748B]" />
                  <span className="truncate">{room.address}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
