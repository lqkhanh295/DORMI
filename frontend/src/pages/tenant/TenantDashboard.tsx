import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store/useStore';
import { useNavigate, Link } from 'react-router-dom';
import { appointmentsApi, favoritesApi, applicationsApi, leasesApi } from '../../services/api';
import { toast } from 'sonner';
import { 
  Calendar, 
  Heart, 
  PlusCircle, 
  MapPin, 
  Clock, 
  ArrowRight, 
  FileText, 
  FileCheck, 
  CheckCircle2, 
  Sparkles,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoomCard } from '../../components/landing/RoomCard';

export default function TenantDashboard() {
  const { listings, fetchListings, currentUser } = useStore();
  const navigate = useNavigate();

  // Tab control
  const [activeTab, setActiveTab] = useState<'recommended' | 'appointments' | 'favorites'>('recommended');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [aptsRes, favsRes, appsRes, leasesRes] = await Promise.all([
        appointmentsApi.getMyAppointments().catch(() => []),
        favoritesApi.getFavorites().catch(() => []),
        applicationsApi.getMyApplications().catch(() => []),
        leasesApi.getMyLeases().catch(() => [])
      ]);

      if (Array.isArray(aptsRes)) setAppointments(aptsRes);
      if (Array.isArray(favsRes)) setFavorites(favsRes);
      if (Array.isArray(appsRes)) setApplications(appsRes);
      if (Array.isArray(leasesRes)) setLeases(leasesRes);
    } catch (err) {
      console.warn('Failed to load tenant dashboard data:', err);
    } finally {
      setLoading(false);
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

  // Metrics
  const approvedAppsCount = applications.filter(a => a.status === 1).length;
  const pendingAppsCount = applications.filter(a => a.status === 0 || a.status === 2).length;
  const pendingLeasesCount = leases.filter(l => l.status === 'PendingSignature' || l.status === 'Draft').length;

  return (
    <div className="space-y-6 pb-16 bg-[#F8FAFC]">
      
      {/* 1. HERO PORTAL BANNER */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#00153D] tracking-tight">
            Xin chào{currentUser?.name ? `, ${currentUser.name}` : ''}!
          </h1>
          <p className="text-sm text-[#64748B] mt-1 max-w-xl">
            Theo dõi hồ sơ thuê phòng, hợp đồng điện tử và lịch hẹn xem phòng của bạn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button 
            type="button"
            onClick={() => navigate('/search')} 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00153D] hover:bg-[#073372] text-white text-sm font-bold rounded-xl transition-[background-color,box-shadow,transform] duration-150 ease-out active:scale-95 shadow-sm"
          >
            <MapPin className="w-4 h-4 text-[#F2A900]" />
            <span>Tìm phòng trên Bản đồ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <Link 
            to="/tenant/post"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] text-sm font-bold rounded-xl transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-[#6366F1]" />
            <span>Đăng tin ở ghép</span>
          </Link>
        </div>
      </div>

      {/* 2. SUMMARY HUB CARDS (CLICK DIRECTLY TO ACTION) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Rental Applications */}
        <div 
          onClick={() => navigate('/tenant/applications')}
          className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-blue-300 transition-[box-shadow,border-color,transform] duration-150 cursor-pointer flex flex-col justify-between space-y-4 group"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            {approvedAppsCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {approvedAppsCount} đã duyệt
              </span>
            ) : pendingAppsCount > 0 ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                {pendingAppsCount} chờ duyệt
              </span>
            ) : null}
          </div>
          <div>
            <span className="text-xs text-[#64748B] font-medium block">Hồ sơ thuê phòng</span>
            <span className="text-2xl font-black text-[#00153D]">{applications.length} hồ sơ</span>
          </div>
          <div className="flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
            <span>Quản lý hồ sơ thuê</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Card 2: Leases & Contracts */}
        <div 
          onClick={() => navigate('/tenant/leases')}
          className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-emerald-300 transition-[box-shadow,border-color,transform] duration-150 cursor-pointer flex flex-col justify-between space-y-4 group"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <FileCheck className="w-6 h-6" />
            </div>
            {pendingLeasesCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                <Clock className="w-3 h-3 text-amber-600" /> Cần ký ({pendingLeasesCount})
              </span>
            )}
          </div>
          <div>
            <span className="text-xs text-[#64748B] font-medium block">Hợp đồng điện tử</span>
            <span className="text-2xl font-black text-[#00153D]">{leases.length} hợp đồng</span>
          </div>
          <div className="flex items-center text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
            <span>Ký & Xem hợp đồng</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Card 3: Viewings */}
        <div 
          onClick={() => setActiveTab('appointments')}
          className={`bg-white p-5 rounded-2xl border shadow-xs hover:shadow-md transition-[box-shadow,border-color,transform] duration-150 cursor-pointer flex flex-col justify-between space-y-4 group ${
            activeTab === 'appointments' ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-[#E2E8F0] hover:border-indigo-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div>
            <span className="text-xs text-[#64748B] font-medium block">Lịch hẹn xem phòng</span>
            <span className="text-2xl font-black text-[#00153D]">{appointments.length} lịch hẹn</span>
          </div>
          <div className="flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
            <span>Xem danh sách lịch hẹn</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Card 4: Wishlist / Favorites */}
        <div 
          onClick={() => setActiveTab('favorites')}
          className={`bg-white p-5 rounded-2xl border shadow-xs hover:shadow-md transition-[box-shadow,border-color,transform] duration-150 cursor-pointer flex flex-col justify-between space-y-4 group ${
            activeTab === 'favorites' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-[#E2E8F0] hover:border-rose-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Heart className="w-6 h-6" />
            </div>
          </div>
          <div>
            <span className="text-xs text-[#64748B] font-medium block">Phòng đã lưu (Wishlist)</span>
            <span className="text-2xl font-black text-[#00153D]">{favorites.length} phòng</span>
          </div>
          <div className="flex items-center text-xs font-bold text-rose-600 group-hover:translate-x-1 transition-transform">
            <span>Mở danh sách yêu thích</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3 pt-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('recommended')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'recommended'
              ? 'bg-[#00153D] text-white shadow-sm'
              : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gợi ý phòng mới ({listings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'appointments'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Lịch hẹn của tôi ({appointments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'favorites'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Phòng đã lưu ({favorites.length})</span>
        </button>
      </div>

      {/* 4. TAB CONTENTS */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: RECOMMENDED ROOMS */}
        {activeTab === 'recommended' && (
          <motion.div
            key="recommended-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-6"
          >
            {/* Header with CTA to /search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">Gợi ý phòng trọ mới nhất</h2>
                <p className="text-xs text-[#64748B]">Các căn phòng vừa được kiểm duyệt và đưa lên sàn Dormi</p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/search')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold rounded-xl transition-colors shrink-0"
              >
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>Xem tất cả {listings.length} phòng trên Bản đồ tìm kiếm</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
              </button>
            </div>

            {/* Grid 6 Featured Cards */}
            {listings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] shadow-sm space-y-3">
                <p className="text-sm text-[#64748B]">Đang tải danh sách phòng trọ gợi ý...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.slice(0, 6).map(room => (
                  <div key={room.id} className="cursor-pointer">
                    <RoomCard
                      room={{
                        id: room.id,
                        title: room.title,
                        price: `${room.price.toLocaleString('vi-VN')}đ / tháng`,
                        location: room.address.split(',')[0],
                        area: room.area ? `${room.area}m²` : '25m²',
                        image: room.image,
                        verified: !!room.isVerifiedLandlord,
                        isBoosted: !!room.isBoosted,
                        boostType: room.boostType
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Invitation Banner */}
            <div className="p-6 bg-gradient-to-r from-[#00153D] to-[#073372] rounded-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#F2A900] shrink-0" />
                  <span className="text-white">Bạn muốn tìm phòng theo khu vực cụ thể và mức giá mong muốn?</span>
                </h3>
                <p className="text-xs text-slate-200">
                  Sử dụng công cụ Bản đồ tìm kiếm toàn diện với các bộ lọc thông minh (Quận huyện, Giá thuê, Tiện ích, Tour 3D).
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/search')}
                className="px-5 py-2.5 bg-white text-[#00153D] hover:bg-slate-100 font-bold text-xs rounded-xl transition-colors whitespace-nowrap shadow-sm shrink-0 flex items-center gap-2"
              >
                <span>Mở Bản đồ tìm kiếm ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 2: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <motion.div
            key="appointments-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center pb-2">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <span>Lịch hẹn xem phòng của tôi</span>
                </h2>
                <p className="text-xs text-[#64748B]">Trạng thái các cuộc hẹn trực tiếp với chủ trọ</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/tenant/viewings')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold rounded-lg transition-colors border border-indigo-200"
              >
                <span>Mở trang Quản lý lịch hẹn</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-44 rounded-2xl skeleton-shimmer bg-white p-5 border border-[#E2E8F0]" />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <Card className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#CBD5E1] space-y-3">
                <Clock className="w-10 h-10 text-[#94A3B8] mx-auto" />
                <p className="text-sm font-semibold text-[#0F172A]">Bạn chưa có lịch hẹn xem phòng nào</p>
                <p className="text-xs text-[#64748B] max-w-md mx-auto">
                  Khi tìm thấy căn phòng ưng ý, hãy nhấn nút "Đặt lịch xem phòng" để hẹn gặp trực tiếp chủ nhà.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/search')}
                  className="px-4 py-2 bg-[#00153D] hover:bg-[#073372] text-white text-xs font-bold rounded-xl transition-colors mt-2"
                >
                  Khám phá phòng trên Bản đồ
                </button>
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
                    <Card key={apt.id} className="p-5 bg-white rounded-2xl shadow-xs border border-[#E2E8F0] flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <Link to={`/room/${apt.roomId}`} className="font-bold text-sm text-[#0F172A] hover:text-blue-600 line-clamp-1 transition-colors">
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

                        <div className="space-y-1.5 text-xs text-[#64748B]">
                          <div className="flex items-center gap-1.5 text-[#0F172A] font-semibold">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span>Thời gian: {dateStr}</span>
                          </div>
                          {apt.roomAddress && (
                            <div className="flex items-start gap-1.5 truncate">
                              <MapPin className="w-4 h-4 shrink-0 text-[#64748B] mt-0.5" />
                              <span className="truncate">{apt.roomAddress}</span>
                            </div>
                          )}
                          {apt.notes && (
                            <p className="text-[11px] bg-[#F8FAFC] p-2 rounded-lg text-[#475569] italic border border-[#E2E8F0]">
                              Ghi chú: {apt.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
                        <Link to={`/room/${apt.roomId}`}>
                          <Button size="sm" variant="ghost" className="text-xs text-blue-600">
                            Xem phòng
                          </Button>
                        </Link>

                        {(isPending || isConfirmed) && (
                          <button 
                            type="button"
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
          </motion.div>
        )}

        {/* TAB 3: FAVORITES */}
        {activeTab === 'favorites' && (
          <motion.div
            key="favorites-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center pb-2">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-600" />
                  <span>Phòng đã lưu (Wishlist)</span>
                </h2>
                <p className="text-xs text-[#64748B]">Các căn phòng bạn đã đánh dấu quan tâm</p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/search')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-900 text-xs font-bold rounded-lg transition-colors border border-rose-200"
              >
                <span>Tìm thêm phòng mới</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-44 rounded-2xl skeleton-shimmer bg-white p-5 border border-[#E2E8F0]" />
                ))}
              </div>
            ) : favorites.length === 0 ? (
              <Card className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#CBD5E1] space-y-3">
                <Heart className="w-10 h-10 text-[#94A3B8] mx-auto" />
                <p className="text-sm font-semibold text-[#0F172A]">Bạn chưa lưu phòng trọ nào</p>
                <p className="text-xs text-[#64748B] max-w-md mx-auto">
                  Hãy nhấn biểu tượng trái tim trên các thẻ phòng trọ để lưu lại và theo dõi khi cần.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/search')}
                  className="px-4 py-2 bg-[#00153D] hover:bg-[#073372] text-white text-xs font-bold rounded-xl transition-colors mt-2"
                >
                  Khám phá phòng trên Bản đồ
                </button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map(room => (
                  <div key={room.id} className="cursor-pointer">
                    <RoomCard
                      room={{
                        id: room.id,
                        title: room.title,
                        price: `${room.price.toLocaleString('vi-VN')}đ / tháng`,
                        location: room.address ? room.address.split(',')[0] : 'TP. Hồ Chí Minh',
                        area: room.area ? `${room.area}m²` : '25m²',
                        image: room.image,
                        verified: !!room.isVerifiedLandlord,
                        isBoosted: !!room.isBoosted,
                        boostType: room.boostType
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
