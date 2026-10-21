import { ShieldCheck, Camera, FileCheck } from 'lucide-react';

export function VerificationSection() {
  return (
    <section className="py-16 md:py-24 bg-white border-t border-[#E2E8F0]">
      <div className="container-dormi">
        <div className="max-w-2xl mb-12">
          <h2 className="text-h2 text-[#0F172A] tracking-tight">
            Trước khi bạn đến xem phòng, DORMI kiểm tra những gì?
          </h2>
          <p className="text-body text-[#64748B] mt-2">
            Loại bỏ nỗi lo phòng ảo, lừa đảo cọc hay ảnh phóng đại. Mỗi phòng đăng tải trên nền tảng đều trải qua quy trình xác minh 3 lớp.
          </p>
        </div>

        {/* 3 Verification Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Pillar 01 */}
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 lg:p-7 flex flex-col justify-between transition-colors hover:border-slate-300">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-[#00153D] text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">01</span>
              </div>
              <h3 className="text-h3 text-[#0F172A] mb-2 font-bold">
                Xác minh danh tính chủ trọ
              </h3>
              <p className="text-body text-[#64748B] leading-relaxed text-sm">
                Kiểm tra CCCD và quyền cho thuê trước khi duyệt tin. Tránh nguy cơ môi giới thu phí trái phép.
              </p>
            </div>
          </div>

          {/* Pillar 02 */}
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 lg:p-7 flex flex-col justify-between transition-colors hover:border-slate-300">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-[#00153D] text-white flex items-center justify-center shadow-xs">
                  <Camera className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">02</span>
              </div>
              <h3 className="text-h3 text-[#0F172A] mb-2 font-bold">
                Đối chiếu hình ảnh thực tế
              </h3>
              <p className="text-body text-[#64748B] leading-relaxed text-sm">
                Kiểm duyệt hình ảnh và không gian thực của từng phòng trọ. Cam kết 100% hình ảnh thực tế minh bạch, không qua chỉnh sửa sai lệch.
              </p>
            </div>
          </div>

          {/* Pillar 03 */}
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 lg:p-7 flex flex-col justify-between transition-colors hover:border-slate-300">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-[#00153D] text-white flex items-center justify-center shadow-xs">
                  <FileCheck className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">03</span>
              </div>
              <h3 className="text-h3 text-[#0F172A] mb-2 font-bold">
                Niêm yết giá & phụ phí rõ ràng
              </h3>
              <p className="text-body text-[#64748B] leading-relaxed text-sm">
                Giá thuê, tiền cọc, chi phí điện nước và các loại phí dịch vụ được ghi rõ ràng trong hợp đồng, tuyệt đối không phát sinh phụ phí ẩn.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
