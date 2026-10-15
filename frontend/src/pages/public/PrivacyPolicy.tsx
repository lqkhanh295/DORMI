import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { PageMotion } from '../../components/common/Motion';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  UserCheck, 
  FileCheck, 
  Home, 
  Mail, 
  PhoneCall,
  Sliders
} from 'lucide-react';

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('section-1');

  const sections = [
    { id: 'section-1', title: '1. Cam kết & Nguyên tắc bảo mật' },
    { id: 'section-2', title: '2. Thông tin cá nhân chúng tôi thu thập' },
    { id: 'section-3', title: '3. Mục đích sử dụng dữ liệu' },
    { id: 'section-4', title: '4. Bảo vệ dữ liệu định danh & CCCD' },
    { id: 'section-5', title: '5. Bảo mật thanh toán & Tài chính' },
    { id: 'section-6', title: '6. Quyền kiểm soát & Tùy chỉnh của bạn' },
    { id: 'section-7', title: '7. Lưu trữ & Biện pháp an toàn kỹ thuật' },
    { id: 'section-8', title: '8. Liên hệ Ban An toàn Thông tin' },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <PageMotion className="bg-[#F8FAFC] min-h-screen py-10">
      <div className="container-dormi max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <Link to="/" className="hover:text-[#00153D] flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
          <span>/</span>
          <span className="text-[#0F172A] font-semibold">Chính sách bảo mật</span>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm relative overflow-hidden">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bảo vệ quyền riêng tư & dữ liệu cá nhân</span>
            </div>
            <h1 className="text-3xl font-black text-[#00153D] tracking-tight">
              Chính sách Bảo mật Dữ liệu DORMI
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              DORMI tôn trọng tuyệt đối quyền riêng tư và cam kết bảo vệ dữ liệu cá nhân của sinh viên, khách thuê và chủ trọ tuân thủ nghiêm ngặt theo Nghị định 13/2023/NĐ-CP của Chính phủ Việt Nam.
            </p>
            <p className="text-xs text-slate-400">
              Có hiệu lực áp dụng từ: 15/10/2026 · Phiên bản: 2.1 (Chính thức)
            </p>
          </div>
        </div>

        {/* Layout: Sidebar Navigation + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Quick Index Sidebar */}
          <div className="lg:col-span-1 sticky top-20 space-y-3">
            <Card className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Mục lục chính sách</span>
              </h2>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeSection === sec.id
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {sec.title}
                  </button>
                ))}
              </nav>
            </Card>

            <Card className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                <Sliders className="w-4 h-4 text-slate-600" />
                <span>Tùy chỉnh riêng tư</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Bạn có thể chủ động ẩn số điện thoại hoặc tắt chia sẻ hồ sơ ghép phòng bất kỳ lúc nào tại mục Cài đặt.
              </p>
              <Link 
                to="/tenant/settings"
                className="text-indigo-600 font-semibold text-xs hover:underline inline-flex items-center gap-1 mt-1"
              >
                Mở Cài đặt tài khoản
              </Link>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8 bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-sm text-slate-700 text-sm leading-relaxed">
            
            {/* Section 1 */}
            <section id="section-1" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-[#00153D] flex items-center gap-2 border-b border-slate-100 pb-2">
                1. Cam kết & Nguyên tắc bảo mật
              </h2>
              <p>
                DORMI cam kết bảo vệ thông tin cá nhân của người dùng bằng các giải pháp công nghệ tiên tiến nhất. Chúng tôi thu thập dữ liệu với mục đích duy nhất là cung cấp dịch vụ tìm kiếm phòng trọ an toàn, kết nối bạn cùng phòng tin cậy và hỗ trợ ký kết hợp đồng thuê phòng minh bạch.
              </p>
              <p>
                Chúng tôi cam đoan <strong>không bán, không chuyển nhượng và không chia sẻ</strong> dữ liệu cá nhân của người dùng cho bất kỳ bên thứ ba nào vì mục đích quảng cáo hoặc thương mại độc lập.
              </p>
            </section>

            {/* Section 2 */}
            <section id="section-2" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-[#00153D] flex items-center gap-2 border-b border-slate-100 pb-2">
                2. Thông tin cá nhân chúng tôi thu thập
              </h2>
              <p>Các dữ liệu được thu thập trên nền tảng gồm có:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    Thông tin tài khoản cơ bản
                  </p>
                  <p className="text-slate-600">Họ và tên, địa chỉ email, số điện thoại đăng ký, ảnh đại diện và vai trò (Khách thuê hoặc Chủ trọ).</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    Hồ sơ thuê & Ứng tuyển
                  </p>
                  <p className="text-slate-600">Nghề nghiệp, trường học/cơ quan, thu nhập tự khai báo và số lượng người dự kiến ở cùng để chủ nhà thẩm định.</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    Tài liệu định danh (Chủ trọ / KYC)
                  </p>
                  <p className="text-slate-600">Ảnh chụp CCCD/hộ chiếu và giấy tờ quyền sở hữu bất động sản phục vụ công tác cấp tích xanh xác thực.</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    Dữ liệu lối sống (Matcher)
                  </p>
                  <p className="text-slate-600">Giờ giấc sinh hoạt, sở thích nuôi thú cưng, hút thuốc, ngân sách dự kiến để tính điểm tương thích bạn cùng phòng.</p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="section-3" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-[#00153D] flex items-center gap-2 border-b border-slate-100 pb-2">
                3. Mục đích sử dụng dữ liệu
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Tạo lập kết nối & Lịch hẹn:</strong> Hiển thị thông tin liên hệ cần thiết giữa Khách thuê và Chủ trọ khi có yêu cầu hẹn xem phòng hoặc chấp thuận hồ sơ thuê.
                </li>
                <li>
                  <strong>Tính toán thuật toán bạn cùng phòng (DORMI Matcher):</strong> Đối soát mức độ tương thích về lối sống và ngân sách để gợi ý bạn cùng phòng phù hợp nhất cho sinh viên.
                </li>
                <li>
                  <strong>Hợp đồng & Xác lập thỏa thuận:</strong> Điền tự động các trường thông tin pháp lý vào Hợp đồng thuê phòng điện tử và Biên bản bàn giao trang thiết bị.
                </li>
                <li>
                  <strong>Phát hiện & Ngăn ngừa gian lận:</strong> Phát hiện các dấu hiệu lừa đảo cọc ảo, phòng ảo, hoặc người dùng vi phạm quy chuẩn cộng đồng.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="section-4" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-[#00153D] flex items-center gap-2 border-b border-slate-100 pb-2">
                4. Bảo vệ dữ liệu định danh & CCCD
              </h2>
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-2 text-xs text-amber-950">
                <p className="font-semibold flex items-center gap-1.5 text-amber-800">
                  <Lock className="w-4 h-4 text-amber-600" />
                  Quy trình xử lý ảnh chụp CCCD/CMND nghiêm ngặt:
                </p>
                <p>
                  Ảnh chụp giấy tờ tùy thân của Chủ trọ và Khách thuê chỉ được chuyển vào Hàng đợi kiểm duyệt nội bộ được mã hóa. Chỉ có Kiểm duyệt viên được phân quyền bảo mật cao nhất của DORMI mới có thể xem xét đối chiếu thông tin.
                </p>
                <p>
                  Tuyệt đối <strong>không công khai ảnh CCCD lên website</strong> cho bất kỳ người dùng thông thường nào khác xem thấy.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section id="section-5" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-[#00153D] flex items-center gap-2 border-b border-slate-100 pb-2">
                5. Bảo mật thanh toán & Tài chính
              </h2>
              <p>
                DORMI áp dụng cơ chế thanh toán an toàn thông qua cổng thanh toán đối tác <strong>PayOS</strong> (tiêu chuẩn kết nối cổng thanh toán ngân hàng quốc gia Napas / VietQR).
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>DORMI <strong>không bao giờ lưu trữ số thẻ tín dụng</strong>, mã CVV/CVC, hay thông tin đăng nhập Internet Banking của bạn trên hệ thống.</li>
                <li>Mọi giao dịch được tạo mã tham chiếu thanh toán riêng biệt (TransactionRef) và được đối soát tức thời bằng chữ ký điện tử an toàn.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="section-6" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-[#00153D] flex items-center gap-2 border-b border-slate-100 pb-2">
                6. Quyền kiểm soát & Tùy chỉnh của bạn
              </h2>
              <p>Bạn nắm quyền kiểm soát toàn bộ thông tin cá nhân của mình trên DORMI:</p>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <strong>Quyền xem & chỉnh sửa:</strong> Bạn có thể cập nhật họ tên, mật khẩu, thông tin liên hệ bất kỳ lúc nào tại mục Cài đặt.
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <strong>Quyền bảo mật số điện thoại:</strong> Bạn có thể bật hoặc tắt tùy chọn chia sẻ số điện thoại với chủ trọ trong trang Quyền riêng tư.
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <strong>Quyền từ chối gợi ý ở ghép:</strong> Bạn có thể tắt tính năng hiển thị hồ sơ trong thuật toán Matcher khi đã tìm được phòng hoặc không có nhu cầu ở ghép nữa.
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <strong>Quyền yêu cầu xóa dữ liệu (Right to be forgotten):</strong> Bạn có quyền tạm khóa tài khoản hoặc yêu cầu xóa toàn bộ dữ liệu cá nhân khỏi hệ thống.
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="section-7" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-[#00153D] flex items-center gap-2 border-b border-slate-100 pb-2">
                7. Lưu trữ & Biện pháp an toàn kỹ thuật
              </h2>
              <p>
                Dữ liệu của DORMI được lưu trữ trên hạ tầng máy chủ cơ sở dữ liệu đám mây được bảo vệ bởi tường lửa đa lớp, mã hóa đường truyền bằng giao thức SSL/TLS 1.3 và cơ chế sao lưu dự phòng định kỳ.
              </p>
              <p>
                Chúng tôi áp dụng mô hình phân quyền tối thiểu (Least Privilege Access) đối với toàn bộ kỹ sư và nhân viên hỗ trợ, ghi nhật ký kiểm toán (Audit Logs) toàn diện cho mọi thao tác truy vấn dữ liệu nhạy cảm.
              </p>
            </section>

            {/* Section 8 */}
            <section id="section-8" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-[#00153D] flex items-center gap-2 border-b border-slate-100 pb-2">
                8. Liên hệ Ban An toàn Thông tin
              </h2>
              <p>
                Mọi thắc mắc, phản ánh liên quan đến an toàn dữ liệu hoặc yêu cầu thực hiện quyền đối với dữ liệu cá nhân, vui lòng liên hệ trực tiếp với Cán bộ Bảo vệ Dữ liệu (DPO) của DORMI:
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <p><strong>Bộ phận Bảo vệ Dữ liệu & An ninh mạng DORMI</strong></p>
                <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-500" /> Email: <a href="mailto:privacy@dormi.space" className="text-blue-600 underline">privacy@dormi.space</a></p>
                <p className="flex items-center gap-1.5"><PhoneCall className="w-3.5 h-3.5 text-slate-500" /> Hotline hỗ trợ: <span className="font-semibold text-slate-800">0909 123 456</span> (08:00 - 21:00)</p>
                <p>Địa chỉ văn phòng: Khu Công nghệ cao, TP. Thủ Đức, TP. Hồ Chí Minh</p>
              </div>
            </section>

            {/* Footer Navigation Box */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 p-5 rounded-xl">
              <div>
                <p className="font-semibold text-slate-900 text-xs">Tìm hiểu thêm các quy định khác</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Khám phá các quy tắc vận hành và bảo vệ quyền lợi trên DORMI.</p>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/terms"
                  className="px-4 py-2 bg-[#00153D] text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Điều khoản dịch vụ
                </Link>
                <Link
                  to="/"
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Về trang chủ
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </PageMotion>
  );
}
