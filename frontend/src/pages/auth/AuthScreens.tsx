import { GlobalNav } from '../../components/ui/GlobalNav';
import { BentoCard } from '../../components/ui/BentoCard';
import { AppleButton } from '../../components/ui/AppleButton';
import { Link } from 'react-router-dom';

export function Login() {
  return (
    <div className="bg-[#f5f5f7] min-h-screen flex flex-col">
      <GlobalNav />
      <div className="flex-1 flex items-center justify-center p-4 pt-[88px]">
        <BentoCard className="w-full max-w-[480px] bg-white text-center">
          <h1 className="text-[28px] font-bold text-[#1d1d1f] mb-2 tracking-tight">Đăng nhập Dormi</h1>
          <p className="text-[15px] text-[#6e6e73] mb-8">Một tài khoản cho mọi dịch vụ.</p>
          
          <div className="flex flex-col gap-4 text-left">
            <input 
              type="email" 
              placeholder="Email hoặc Số điện thoại" 
              className="w-full h-[56px] px-4 rounded-[12px] bg-[#f5f5f7] border border-transparent focus:border-[#0071E3] focus:bg-white focus:ring-4 focus:ring-[#0071E3]/20 outline-none text-[17px] transition-all"
            />
            <input 
              type="password" 
              placeholder="Mật khẩu" 
              className="w-full h-[56px] px-4 rounded-[12px] bg-[#f5f5f7] border border-transparent focus:border-[#0071E3] focus:bg-white focus:ring-4 focus:ring-[#0071E3]/20 outline-none text-[17px] transition-all"
            />
            
            <div className="flex justify-end">
              <Link to="#" className="text-[13px] text-[#0071e3] hover:underline">Quên mật khẩu?</Link>
            </div>
            
            <AppleButton className="mt-2" size="lg" fullWidth>Đăng nhập</AppleButton>
          </div>
          
          <div className="mt-8 pt-6 border-t border-[#d2d2d7]/50">
            <p className="text-[13px] text-[#6e6e73]">
              Bạn chưa có tài khoản?{' '}
              <Link to="/register" className="text-[#0071e3] hover:underline">Tạo ngay</Link>
            </p>
          </div>
        </BentoCard>
      </div>
    </div>
  );
}

export function Register() {
  return (
    <div className="bg-[#f5f5f7] min-h-screen flex flex-col">
      <GlobalNav />
      <div className="flex-1 flex items-center justify-center p-4 pt-[88px]">
        <BentoCard className="w-full max-w-[600px] bg-white text-center">
          <h1 className="text-[28px] font-bold text-[#1d1d1f] mb-2 tracking-tight">Tạo tài khoản Dormi</h1>
          <p className="text-[15px] text-[#6e6e73] mb-8">Bạn đang tìm phòng hay cho thuê phòng?</p>
          
          <div className="grid gap-4 md:grid-cols-2 text-left mb-8">
            <label className="flex flex-col gap-3 p-6 rounded-[16px] border-2 border-[#0071e3] bg-[#0071e3]/5 cursor-pointer transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[17px] font-semibold text-[#1d1d1f]">Khách thuê</span>
                <input type="radio" name="role" defaultChecked className="w-5 h-5 text-[#0071e3] focus:ring-[#0071e3]" />
              </div>
              <p className="text-[13px] text-[#6e6e73]">Tìm kiếm phòng trọ, căn hộ, KTX và bạn cùng phòng.</p>
            </label>
            
            <label className="flex flex-col gap-3 p-6 rounded-[16px] border-2 border-transparent bg-[#f5f5f7] hover:bg-[#e8e8ed] cursor-pointer transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[17px] font-semibold text-[#1d1d1f]">Chủ nhà</span>
                <input type="radio" name="role" className="w-5 h-5 text-[#0071e3] focus:ring-[#0071e3]" />
              </div>
              <p className="text-[13px] text-[#6e6e73]">Đăng tin cho thuê, quản lý phòng và người thuê dễ dàng.</p>
            </label>
          </div>
          
          <div className="flex justify-end gap-3">
             <Link to="/login">
               <AppleButton variant="secondary" size="lg">Quay lại</AppleButton>
             </Link>
             <Link to="/customer/dashboard">
               <AppleButton size="lg">Tiếp tục</AppleButton>
             </Link>
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
