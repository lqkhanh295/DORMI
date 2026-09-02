import { Link } from 'react-router-dom';
import { WarningCircle, House } from '@phosphor-icons/react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] bg-[#F5F7FA] px-4">
      <div className="bg-white rounded-[18px] shadow-clay-soft p-8 md:p-12 flex flex-col items-center text-center max-w-md w-full space-y-6">
        <WarningCircle className="w-20 h-20 text-[#64748B]" />
        <div className="space-y-2">
          <h1 className="text-h2 font-bold text-[#0F172A]">404 - Không tìm thấy trang</h1>
          <p className="text-body text-[#64748B]">
            Trang bạn đang truy cập không tồn tại hoặc đã được chuyển dời.
          </p>
        </div>
        <Link to="/" className="btn-clay-primary text-body font-semibold px-8 py-3 rounded-[12px] inline-flex items-center gap-2 min-h-[44px]">
          <House className="w-5 h-5" weight="bold" />
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
