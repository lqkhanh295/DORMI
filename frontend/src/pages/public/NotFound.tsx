import { Link } from 'react-router-dom';
import { WarningCircle, House } from '@phosphor-icons/react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] bg-neutral-50 px-4">
      <WarningCircle className="w-24 h-24 text-neutral-300 mb-6" />
      <h1 className="text-4xl font-black text-neutral-900 mb-2">404 - Không tìm thấy trang</h1>
      <p className="text-neutral-500 mb-8 text-center max-w-md">
        Trang bạn đang cố truy cập không tồn tại hoặc đã bị di dời. Xin lỗi vì sự bất tiện này.
      </p>
      <Link to="/" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition-colors shadow-lg">
        <House weight="fill" className="w-5 h-5" />
        Về Trang Chủ
      </Link>
    </div>
  );
}
