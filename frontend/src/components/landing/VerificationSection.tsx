import { CheckCircle } from '@phosphor-icons/react';

export function VerificationSection() {
  // ponytail: Consolidated single card container for Verification Section (replacing 3 separate horizontal cards)
  return (
    <section className="py-16 md:py-24 bg-[#F5F7FA]">
      <div className="container-dormi">
        <div className="bg-white rounded-[18px] shadow-clay-soft p-8 md:p-12 max-w-4xl mx-auto space-y-8">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-h2 text-[#0F172A]">
              Trước khi bạn đến xem phòng, DORMI kiểm tra gì?
            </h2>
            <p className="text-body text-[#64748B]">
              Quy trình xác minh 3 bước minh bạch mang lại sự an tâm tuyệt đối khi thuê phòng.
            </p>
          </div>

          <div className="space-y-6 pt-2">
            
            {/* Step 1 */}
            <div className="flex items-start gap-4 p-4 rounded-[14px] bg-[#F5F7FA] shadow-clay-inset">
              <div className="w-8 h-8 rounded-full bg-[#F0FDF4] text-[#16803C] flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5" weight="fill" />
              </div>
              <div className="space-y-1">
                <h3 className="text-h3 text-[#0F172A]">Người đăng được xác minh</h3>
                <p className="text-body text-[#64748B]">
                  Xác nhận danh tính chính chủ hoặc đại diện quản lý nhà trọ trước khi tin được duyệt đăng.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 p-4 rounded-[14px] bg-[#F5F7FA] shadow-clay-inset">
              <div className="w-8 h-8 rounded-full bg-[#F0FDF4] text-[#16803C] flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5" weight="fill" />
              </div>
              <div className="space-y-1">
                <h3 className="text-h3 text-[#0F172A]">Hình ảnh được kiểm tra</h3>
                <p className="text-body text-[#64748B]">
                  Đối chiếu hình ảnh thực tế căn phòng để ngăn chặn ảnh ảo hoặc thông tin sai lệch.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 p-4 rounded-[14px] bg-[#F5F7FA] shadow-clay-inset">
              <div className="w-8 h-8 rounded-full bg-[#F0FDF4] text-[#16803C] flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5" weight="fill" />
              </div>
              <div className="space-y-1">
                <h3 className="text-h3 text-[#0F172A]">Thông tin rõ ràng</h3>
                <p className="text-body text-[#64748B]">
                  Giá thuê hàng tháng, diện tích, tiền điện nước và vị trí được hiển thị niêm yết công khai.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
