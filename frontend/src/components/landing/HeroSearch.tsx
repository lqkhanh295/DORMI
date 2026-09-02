import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlass, MapPin, Coins } from '@phosphor-icons/react';

export function HeroSearch() {
  const navigate = useNavigate();
  const [district, setDistrict] = useState('Quận 10');
  const [price, setPrice] = useState('3-5tr');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?district=${encodeURIComponent(district)}&price=${encodeURIComponent(price)}`);
  };

  return (
    <section className="py-16 md:py-24 bg-[#F5F7FA]">
      <div className="container-dormi">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h1 className="text-hero text-[#0F172A]">
                Tìm phòng.<br />
                Tìm người ở cùng.
              </h1>
              <p className="text-body text-[#64748B] max-w-[34ch]">
                Phòng trọ được xác minh và kết nối người ở ghép phù hợp với thói quen sống của bạn.
              </p>
            </div>

            {/* Level 1 Primary Clay Search Container */}
            <form 
              onSubmit={handleSearch}
              className="bg-white rounded-[18px] shadow-clay-primary p-6 space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-[#64748B] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#00153D]" /> Khu vực
                </label>
                <select 
                  value={district} 
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] min-h-[44px]"
                >
                  <option value="Quận 10">Quận 10</option>
                  <option value="Quận 7">Quận 7</option>
                  <option value="Quận 3">Quận 3</option>
                  <option value="Bình Thạnh">Bình Thạnh</option>
                  <option value="Tân Bình">Tân Bình</option>
                  <option value="Gò Vấp">Gò Vấp</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-[#64748B] flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-[#00153D]" /> Ngân sách
                </label>
                <select 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] min-h-[44px]"
                >
                  <option value="Dưới 3tr">Dưới 3 triệu / tháng</option>
                  <option value="3-5tr">3 - 5 triệu / tháng</option>
                  <option value="5-8tr">5 - 8 triệu / tháng</option>
                  <option value="Trên 8tr">Trên 8 triệu / tháng</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full btn-clay-primary font-semibold py-3 rounded-[12px] flex items-center justify-center gap-2 min-h-[44px] text-body"
              >
                <MagnifyingGlass className="w-5 h-5" weight="bold" />
                Tìm phòng
              </button>
            </form>
          </div>

          {/* Right Column (7 cols): Room Image Card */}
          <div className="lg:col-span-7">
            <div className="w-full aspect-[4/3] rounded-[18px] shadow-clay-soft overflow-hidden bg-white p-2">
              <div className="w-full h-full rounded-[14px] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop" 
                  alt="Phòng trọ thực tế được xác minh" 
                  className="w-full h-full object-cover transition-transform duration-200 hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
