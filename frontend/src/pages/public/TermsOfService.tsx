import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { PageMotion } from '../../components/common/Motion';
import { 
  FileText, 
  ShieldCheck, 
  HelpCircle, 
  AlertCircle,
  Home,
  Scale
} from 'lucide-react';

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState('section-1');

  const sections = [
    { id: 'section-1', title: 'I. Quy định chung & Định nghĩa' },
    { id: 'section-2', title: 'II. Quyền & Nghĩa vụ của Khách thuê' },
    { id: 'section-3', title: 'III. Quyền & Nghĩa vụ của Chủ trọ' },
    { id: 'section-4', title: 'IV. Hợp đồng điện tử & Tiền đặt cọc' },
    { id: 'section-5', title: 'V. Phí dịch vụ & Thanh toán trực tuyến' },
    { id: 'section-6', title: 'VI. Hành vi nghiêm cấm & Xử lý vi phạm' },
    { id: 'section-7', title: 'VII. Giải quyết tranh chấp & Khiếu nại' },
    { id: 'section-8', title: 'VIII. Giới hạn trách nhiệm & Hiệu lực' },
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
          <span className="text-[#0F172A] font-semibold">Điều khoản dịch vụ</span>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm relative overflow-hidden">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              <span>Văn bản pháp lý nền tảng</span>
            </div>
            <h1 className="text-3xl font-black text-[#00153D] tracking-tight">
              Điều khoản Dịch vụ DORMI
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Quy chế hoạt động, quyền lợi và nghĩa vụ pháp lý khi tham gia tìm kiếm phòng trọ, kết nối người ở ghép, nộp hồ sơ thuê và ký hợp đồng điện tử trên nền tảng DORMI.
            </p>
            <p className="text-xs text-slate-400">
              Có hiệu lực áp dụng từ: 15/10/2026 · Phiên bản: 2.4 (Chính thức)
            </p>
          </div>
        </div>

        {/* Layout: Sidebar Navigation + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Quick Index Sidebar */}
          <div className="lg:col-span-1 sticky top-20 space-y-3">
            <Card className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Mục lục điều khoản</span>
              </h2>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeSection === sec.id
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {sec.title}
                  </button>
                ))}
              </nav>
            </Card>

            <Card className="p-4 bg-blue-50/60 border border-blue-200/60 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-blue-900 font-semibold">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>Cần hỗ trợ pháp lý?</span>
              </div>
              <p className="text-blue-700 text-[11px] leading-relaxed">
                Đội ngũ pháp chế DORMI sẵn sàng giải đáp thắc mắc liên quan đến điều khoản và hợp đồng mẫu.
              </p>
              <a 
                href="mailto:legal@dormi.space"
                className="text-blue-800 font-semibold text-xs hover:underline inline-flex items-center gap-1 mt-1"
              >
                legal@dormi.space
              </a>
            </Card>
          </div>

          {/* Main Terms Content */}
          <div className="lg:col-span-3 space-y-8 bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-sm text-slate-700 text-sm leading-relaxed text-justify">
            
            {/* Section 1 */}
            <section id="section-1" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-[#00153D] flex items-center gap-2 border-b border-slate-100 pb-2">
                I. Quy định chung & Định nghĩa
              </h2>
              <p>
                Chào mừng bạn đến với <strong>DORMI</strong> (gọi tắt là "Nền tảng", "Chúng tôi"). DORMI là nền tảng công nghệ cung cấp dịch vụ kết nối giữa người có nhu cầu thuê phòng trọ, căn hộ, tìm người ở ghép (Khách thuê) và các cá nhân, tổ chức cung cấp dịch vụ cho thuê bất động sản lưu trú (Chủ trọ).
              </p>
              <p>
                Bằng việc truy cập, đăng ký tài khoản hoặc sử dụng bất kỳ tính năng nào trên DORMI, bạn xác nhận đã đọc, hiểu rõ và đồng ý bị ràng buộc vô điều kiện bởi các Điều khoản dịch vụ này cùng Chính sách bảo mật của chúng tôi.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <p><strong>Khách thuê (Tenant):</strong> Cá nhân (chủ yếu là sinh viên, người đi làm trẻ) sử dụng DORMI để tìm kiếm chỗ ở, đặt lịch xem phòng, nộp hồ sơ thuê và ký kết hợp đồng.</p>
                <p><strong>Chủ trọ (Landlord):</strong> Cá nhân, hộ kinh doanh hoặc đơn vị quản lý sở hữu phòng trọ, căn hộ hợp pháp đăng tải thông tin cho thuê trên DORMI.</p>
                <p><strong>DORMI Trust:</strong> Bộ tiêu chuẩn xác minh thực tế bao gồm xác thực CCCD/hộ chiếu, đối chiếu giấy tờ chủ quyền nhà trọ và điểm tín nhiệm minh bạch.</p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="section-2" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-[#00153D] flex items-center gap-2 border-b border-slate-100 pb-2">
                II. Quyền & Nghĩa vụ của Khách thuê
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Cung cấp thông tin trung thực:</strong> Khách thuê cam kết cung cấp chính xác họ tên, số điện thoại, trường học/nghề nghiệp và thông tin thu nhập khi nộp hồ sơ ứng tuyển thuê phòng hoặc tạo hồ sơ tìm bạn ở ghép.
                </li>
                <li>
                  <strong>Tôn trọng lịch hẹn xem phòng:</strong> Khi đã đặt lịch hẹn xem phòng với Chủ trọ, Khách thuê có trách nhiệm đến đúng giờ hoặc đổi lịch/hủy lịch trên hệ thống trước ít nhất 02 giờ.
                </li>
                <li>
                  <strong>Tuân thủ nội quy và nghĩa vụ thanh toán:</strong> Thanh toán tiền thuê, tiền điện nước và các chi phí dịch vụ đúng thời hạn quy định trong Hợp đồng thuê đã ký kết. Giữ gìn trật tự an ninh, vệ sinh chung và bảo quản tài sản được bàn giao.
                </li>
                <li>
                  <strong>Quyền được bảo vệ:</strong> Khách thuê có quyền yêu cầu hoàn trả tiền cọc đúng theo cam kết hợp đồng nếu thực hiện đúng nghĩa vụ khi chấm dứt thời hạn thuê; có quyền báo cáo vi phạm nếu phát hiện phòng trọ ảo, chủ trọ gian lận hoặc thông tin sai lệch thực tế.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="section-3" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-[#00153D] flex items-center gap-2 border-b border-slate-100 pb-2">
                III. Quyền & Nghĩa vụ của Chủ trọ
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Xác thực danh tính (KYC):</strong> Để đảm bảo an toàn cho cộng đồng sinh viên, Chủ trọ phải hoàn thành bước xác minh giấy tờ cá nhân (CCCD) và chứng minh quyền khai thác bất động sản trước khi đăng tin công khai không giới hạn.
                </li>
                <li>
                  <strong>Tính minh bạch của tin đăng:</strong> Mọi thông tin về giá thuê, diện tích, chi phí điện nước, internet, phí dịch vụ phải được niêm yết rõ ràng, tuyệt đối không có chi phí ẩn phát sinh ngoài thỏa thuận.
                </li>
                <li>
                  <strong>Bàn giao tài sản theo biên bản:</strong> Chủ trọ có trách nhiệm kiểm kê và lập Biên bản bàn giao trang thiết bị thực tế (máy lạnh, chìa khóa, đồng hồ điện nước) cùng Khách thuê khi nhận phòng.
                </li>
                <li>
                  <strong>Tôn trọng quyền riêng tư của Khách thuê:</strong> Chủ trọ không được tùy tiện xâm nhập vào phòng trọ đã cho thuê mà không có sự đồng ý trước của Khách thuê, trừ các trường hợp khẩn cấp về an toàn, cứu hỏa theo quy định pháp luật.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="section-4" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-[#00153D] flex items-center gap-2 border-b border-slate-100 pb-2">
                IV. Hợp đồng điện tử & Tiền đặt cọc
              </h2>
              <p>
                DORMI cung cấp công cụ soạn thảo, ký kết điện tử và in ấn hợp đồng thuê phòng chuẩn hóa theo quy định của Bộ luật Dân sự Việt Nam và Luật Giao dịch điện tử.
              </p>
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl space-y-2 text-xs text-emerald-950">
                <p className="font-semibold flex items-center gap-1.5 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Quy định bảo toàn tiền cọc (Deposit Protection):
                </p>
                <p>
                  Tiền đặt cọc được xác lập nhằm đảm bảo trách nhiệm hợp đồng của Khách thuê. Chủ trọ cam kết hoàn trả 100% tiền đặt cọc cho Khách thuê khi kết thúc hợp đồng nếu phòng trọ không bị hư hao tài sản do lỗi chủ quan của Khách thuê và đã hoàn tất thanh toán hóa đơn dịch vụ.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section id="section-5" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-[#00153D] flex items-center gap-2 border-b border-slate-100 pb-2">
                V. Phí dịch vụ & Thanh toán trực tuyến
              </h2>
              <p>
                DORMI áp dụng cơ chế phân tách luồng tài chính an toàn:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Dịch vụ miễn phí cho Khách thuê:</strong> Khách thuê hoàn toàn miễn phí khi tìm kiếm phòng, nhắn tin, đặt lịch hẹn và ký hợp đồng trực tuyến.
                </li>
                <li>
                  <strong>Gói dịch vụ Hội viên & Đẩy tin dành cho Chủ trọ:</strong> Chủ trọ có thể mua các gói nâng cấp (Gói Pro, Gói Đẩy tin) để tăng độ phủ hiển thị và sử dụng các công cụ quản lý CRM chuyên sâu.
                </li>
                <li>
                  <strong>Thanh toán bảo mật qua PayOS:</strong> Tất cả giao dịch thanh toán gói dịch vụ trên nền tảng được xử lý an toàn thông qua cổng thanh toán đối tác PayOS (chuyển khoản VietQR tự động khớp lệnh thời gian thực).
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="section-6" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-[#00153D] flex items-center gap-2 border-b border-slate-100 pb-2 text-rose-800">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                VI. Hành vi nghiêm cấm & Xử lý vi phạm
              </h2>
              <div className="space-y-2 text-xs sm:text-sm">
                <p>Các hành vi sau đây bị nghiêm cấm tuyệt đối trên hệ thống DORMI:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-rose-900 bg-rose-50/60 p-4 rounded-xl border border-rose-200">
                  <li>Yêu cầu chuyển tiền đặt cọc giữ chỗ trước khi khách thuê xem phòng thực tế hoặc trước khi hợp đồng được ký xác thực.</li>
                  <li>Đăng tin giả mạo, hình ảnh không đúng thực tế căn phòng, hoặc mượn danh nghĩa người khác để tạo tài khoản.</li>
                  <li>Quấy rối, đe dọa, xúc phạm danh dự của bạn cùng phòng hoặc người dùng khác trong quá trình tìm ở ghép.</li>
                  <li>Sử dụng phòng trọ vào mục đích tàng trữ chất cấm, hoạt động phi pháp trái với pháp luật Việt Nam.</li>
                </ul>
                <p className="text-xs text-slate-500 pt-1">
                  Người dùng vi phạm sẽ bị cảnh cáo, ẩn tin đăng, hoặc khóa tài khoản vĩnh viễn tùy theo mức độ vi phạm do Ban Kiểm duyệt (Trust & Safety) quyết định.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="section-7" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-[#00153D] flex items-center gap-2 border-b border-slate-100 pb-2">
                VII. Giải quyết tranh chấp & Khiếu nại
              </h2>
              <p>
                DORMI khuyến khích Khách thuê và Chủ trọ chủ động thương lượng trên tinh thần tôn trọng lẫn nhau khi có bất đồng về hợp đồng hoặc chi phí phát sinh.
              </p>
              <p>
                Trường hợp không đạt được thỏa thuận, người dùng có thể gửi báo cáo vi phạm qua tính năng <strong>Báo cáo tin đăng</strong> trên ứng dụng hoặc liên hệ qua email <a href="mailto:support@dormi.space" className="text-blue-600 underline">support@dormi.space</a>. Ban Quản trị DORMI sẽ kiểm tra nhật ký đối thoại, lịch sử hợp đồng và đưa ra quyết định xử lý khách quan trong vòng 24 - 48 giờ làm việc.
              </p>
            </section>

            {/* Section 8 */}
            <section id="section-8" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-[#00153D] flex items-center gap-2 border-b border-slate-100 pb-2">
                VIII. Giới hạn trách nhiệm & Hiệu lực
              </h2>
              <p>
                DORMI nỗ lực cao nhất nhằm xác minh tính chính xác của các bài đăng và bảo vệ an toàn cho người dùng, tuy nhiên chúng tôi không đóng vai trò là một bên đại diện pháp lý trong các cam kết dân sự giữa Khách thuê và Chủ trọ ngoài các cam kết được quy định rõ trong hợp đồng thuê.
              </p>
              <p>
                DORMI có quyền sửa đổi, bổ sung nội dung Điều khoản dịch vụ này vào bất kỳ lúc nào để phù hợp với quy định pháp luật và sự phát triển của sản phẩm. Các thay đổi sẽ được thông báo công khai trên trang web trước khi có hiệu lực.
              </p>
            </section>

            {/* Footer Contact Box */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 p-5 rounded-xl">
              <div>
                <p className="font-semibold text-slate-900 text-xs">Cần làm rõ bất kỳ điều khoản nào?</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Chúng tôi luôn lắng nghe ý kiến đóng góp từ sinh viên và chủ trọ.</p>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/"
                  className="px-4 py-2 bg-[#00153D] text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Về trang chủ
                </Link>
                <Link
                  to="/privacy"
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Chính sách bảo mật
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </PageMotion>
  );
}
