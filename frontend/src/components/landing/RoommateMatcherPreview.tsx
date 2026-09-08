import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

export function RoommateMatcherPreview() {
  const [sleepTime, setSleepTime] = useState('22h - 00h');
  const [smoking, setSmoking] = useState('Không');
  const [pets, setPets] = useState('Không');

  // Dynamic compatibility scoring algorithm: Sleep (40%) + Smoking (30%) + Pet (30%)
  const calculateScore = () => {
    let score = 0;
    
    // Sleep scoring (40%)
    if (sleepTime === '22h - 00h') score += 40;
    else if (sleepTime === '< 22h') score += 30;
    else score += 20;

    // Smoking scoring (30%)
    if (smoking === 'Không') score += 30;
    else score += 10;

    // Pet scoring (30%)
    if (pets === 'Không') score += 30;
    else score += 15;

    return Math.min(100, Math.max(50, score));
  };

  const matchScore = calculateScore();

  // ponytail: Flattened Roommate Matcher with live compatibility scoring logic
  return (
    <section className="py-16 md:py-24 bg-white border-t border-[#E2E8F0]">
      <div className="container-dormi">
        <div className="max-w-xl space-y-2 mb-12">
          <h2 className="text-h2 text-[#0F172A]">
            Tìm người ở cùng phù hợp
          </h2>
          <p className="text-body text-[#64748B]">
            Không chỉ tìm một căn phòng. Tìm người có thói quen sống tương thích với bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (5 cols): Filter form */}
          <div className="lg:col-span-5 bg-[#F5F7FA] shadow-clay-soft p-6 rounded-[18px] space-y-6">
            
            {/* Sleep Time */}
            <div className="space-y-2">
              <label className="text-caption font-semibold text-[#0F172A] block">Bạn thường ngủ lúc nào?</label>
              <div className="grid grid-cols-3 gap-2">
                {['< 22h', '22h - 00h', '> 00h'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSleepTime(opt)}
                    className={`py-2.5 rounded-[12px] text-caption font-semibold transition-all ${sleepTime === opt ? 'btn-clay-primary' : 'bg-white shadow-clay-soft text-[#64748B] hover:text-[#0F172A]'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Smoking */}
            <div className="space-y-2">
              <label className="text-caption font-semibold text-[#0F172A] block">Hút thuốc</label>
              <div className="grid grid-cols-2 gap-2">
                {['Không', 'Có'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSmoking(opt)}
                    className={`py-2.5 rounded-[12px] text-caption font-semibold transition-all ${smoking === opt ? 'btn-clay-primary' : 'bg-white shadow-clay-soft text-[#64748B] hover:text-[#0F172A]'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Pets */}
            <div className="space-y-2">
              <label className="text-caption font-semibold text-[#0F172A] block">Thú cưng</label>
              <div className="grid grid-cols-2 gap-2">
                {['Không', 'Có'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setPets(opt)}
                    className={`py-2.5 rounded-[12px] text-caption font-semibold transition-all ${pets === opt ? 'btn-clay-primary' : 'bg-white shadow-clay-soft text-[#64748B] hover:text-[#0F172A]'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <Link 
              to="/tenant/match" 
              className="w-full btn-clay-primary font-semibold py-3 rounded-[12px] flex items-center justify-center gap-2 text-body min-h-[44px]"
            >
              <Users className="w-5 h-5" />
              Tìm người phù hợp →
            </Link>
          </div>

          {/* Right Column (7 cols): Result Card in Level 1 Primary Clay */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[18px] shadow-clay-primary p-8 space-y-6">
              
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <span className="bg-[#F0FDF4] text-[#16803C] border border-[#DCFCE7] text-body font-bold px-3 py-1 rounded-full">
                  {matchScore}% phù hợp
                </span>
                <span className="text-caption text-[#64748B] font-medium">Ví dụ kết quả tương thích</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden shadow-clay-soft bg-[#EEF2F6]">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" 
                    alt="Nguyễn Minh" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-h3 text-[#0F172A]">Nguyễn Minh</h3>
                  <p className="text-caption text-[#64748B]">22 tuổi · Sinh viên Quận 10</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 bg-[#F5F7FA] shadow-clay-inset p-4 rounded-[12px] text-caption">
                <div>
                  <span className="text-[#64748B] block font-semibold">Giờ ngủ</span>
                  <span className="font-bold text-[#0F172A]">{sleepTime}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block font-semibold">Hút thuốc</span>
                  <span className="font-bold text-[#0F172A]">{smoking}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block font-semibold">Thú cưng</span>
                  <span className="font-bold text-[#0F172A]">{pets}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link 
                  to="/tenant/match" 
                  className="inline-flex items-center justify-center bg-white text-[#0F172A] border border-[#E2E8F0] shadow-clay-soft font-semibold px-6 py-2.5 rounded-[12px] transition-all hover:-translate-y-0.5 text-body min-h-[44px]"
                >
                  Xem hồ sơ →
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
