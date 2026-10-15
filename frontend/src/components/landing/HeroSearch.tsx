import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Coins, CheckCircle, ArrowRight } from 'lucide-react';

export function HeroSearch() {
  const navigate = useNavigate();
  const [district, setDistrict] = useState('');
  const [price, setPrice] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (district) query.set('district', district);
    if (price) query.set('price', price);
    navigate(`/search?${query.toString()}`);
  };

  return (
    <section className="py-12 md:py-20 bg-[#F8FAFC]">
      <div className="container-dormi">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] xl:text-[42px] font-black text-[#00153D] tracking-tight leading-[1.2]">
                <span className="inline-block whitespace-nowrap">Tìm phòng đúng giá.</span>{' '}
                <span className="inline-block whitespace-nowrap">Tìm bạn đúng gu.</span>
              </h1>
              <p className="text-body text-[#475569] max-w-[44ch] leading-relaxed">
                Minh bạch giá cả, hình ảnh thực tế được kiểm tra tại chỗ và kết nối người ở ghép dựa trên thói quen sinh hoạt.
              </p>
            </div>

            {/* Clean Elevated Search Form */}
            <form 
              onSubmit={handleSearch}
              className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 sm:p-6 space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-caption font-bold text-[#0F172A] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#00153D]" /> Khu vực
                </label>
                <select 
                  value={district} 
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00153D]/10 focus:border-[#00153D] min-h-[44px] cursor-pointer"
                >
                  <option value="">Tất cả khu vực tại TP.HCM</option>
                  <option value="Quận 1">Quận 1</option>
                  <option value="Quận 3">Quận 3</option>
                  <option value="Quận 7">Quận 7</option>
                  <option value="Quận 10">Quận 10</option>
                  <option value="Bình Thạnh">Bình Thạnh</option>
                  <option value="Tân Bình">Tân Bình</option>
                  <option value="Gò Vấp">Gò Vấp</option>
                  <option value="Thủ Đức">TP. Thủ Đức</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-caption font-bold text-[#0F172A] flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-[#00153D]" /> Ngân sách hàng tháng
                </label>
                <select 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00153D]/10 focus:border-[#00153D] min-h-[44px] cursor-pointer"
                >
                  <option value="">Tất cả mức giá</option>
                  <option value="Dưới 3tr">Dưới 3 triệu / tháng</option>
                  <option value="3-5tr">3 - 5 triệu / tháng</option>
                  <option value="5-8tr">5 - 8 triệu / tháng</option>
                  <option value="Trên 8tr">Trên 8 triệu / tháng</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#00153D] hover:bg-[#073372] text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 min-h-[44px] text-body transition-[background-color,transform] duration-150 active:scale-[0.985] shadow-xs"
              >
                <Search className="w-4 h-4" />
                <span>Tìm phòng ngay</span>
              </button>
            </form>
          </div>

          {/* Right Column (6 cols): Verified Showcase Card */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-3 overflow-hidden">
              <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop" 
                  alt="Phòng trọ thực tế được kiểm tra tại TP.HCM" 
                  className="w-full h-full object-cover"
                />
                
                {/* Live verification indicator */}
                <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-xs text-emerald-800 border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hình ảnh đã xác minh thực tế</span>
                </div>

                {/* Price tag */}
                <div className="absolute bottom-3.5 left-3.5 bg-[#00153D]/95 text-white backdrop-blur-xs px-3.5 py-1.5 rounded-xl font-bold text-sm shadow-md">
                  <span>3.500.000đ</span>
                  <span className="text-slate-300 text-xs font-normal ml-1">/ tháng</span>
                </div>
              </div>

              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-body font-bold text-[#0F172A]">Phòng Studio ban công thoáng mát, gần ĐH Bách Khoa</h3>
                  <p className="text-caption text-[#475569] mt-0.5">Quận 10, TP. Hồ Chí Minh · 28m² · Đầy đủ tiện nghi cơ bản</p>
                </div>
                <Link
                  to="/search"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#00153D] hover:underline shrink-0"
                >
                  <span>Khám phá 50+ phòng quanh khu vực</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
