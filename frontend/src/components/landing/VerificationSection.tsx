import { CheckCircle } from '@phosphor-icons/react';

export function VerificationSection() {
  return (
    <section className="py-16 md:py-24 bg-[#F5F7FA]">
      <div className="container-dormi">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <h2 className="text-h2 text-[#0F172A]">
            Trước khi bạn đến xem phòng, DORMI kiểm tra gì?
          </h2>
          <p className="text-body text-[#64748B]">
            Quy trình xác minh thông tin giúp loại bỏ thông tin rác và mang lại sự an tâm khi thuê phòng.
          </p>
        </div>

        {/* 3 Level 2 Soft Clay cards (4/4/4) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-[18px] shadow-clay-soft p-6 space-y-3 transition-transform duration-150 hover:-translate-y-[2px]">
            <div className="w-10 h-10 rounded-[12px] bg-[#F0FDF4] text-[#16803C] flex items-center justify-center">
              <CheckCircle className="w-6 h-6" weight="fill" />
            </div>
            <h3 className="text-h3 text-[#0F172A]">Người đăng được xác minh</h3>
            <p className="text-body text-[#64748B]">
              Xác thực thông tin định danh chủ trọ hoặc người đại diện quản lý phòng trước khi tin đăng lên hệ thống.
            </p>
          </div>

          <div className="bg-white rounded-[18px] shadow-clay-soft p-6 space-y-3 transition-transform duration-150 hover:-translate-y-[2px]">
            <div className="w-10 h-10 rounded-[12px] bg-[#F0FDF4] text-[#16803C] flex items-center justify-center">
              <CheckCircle className="w-6 h-6" weight="fill" />
            </div>
            <h3 className="text-h3 text-[#0F172A]">Hình ảnh phòng được kiểm tra</h3>
            <p className="text-body text-[#64748B]">
              Hình ảnh thực tế căn phòng được đối soát để đảm bảo không sử dụng ảnh ảo hoặc thông tin sai lệch.
            </p>
          </div>

          <div className="bg-white rounded-[18px] shadow-clay-soft p-6 space-y-3 transition-transform duration-150 hover:-translate-y-[2px]">
            <div className="w-10 h-10 rounded-[12px] bg-[#F0FDF4] text-[#16803C] flex items-center justify-center">
              <CheckCircle className="w-6 h-6" weight="fill" />
            </div>
            <h3 className="text-h3 text-[#0F172A]">Thông tin phòng rõ ràng</h3>
            <p className="text-body text-[#64748B]">
              Giá thuê hàng tháng, tiền điện nước, phí dịch vụ và quy định nhà trọ được niêm yết công khai.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
