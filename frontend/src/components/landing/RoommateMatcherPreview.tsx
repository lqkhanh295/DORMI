import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import { roommatesApi } from '../../services/api';

export function RoommateMatcherPreview() {
  const [sleepTime, setSleepTime] = useState('22h - 00h');
  const [smoking, setSmoking] = useState('Không');
  const [pets, setPets] = useState('Không');
  const [realPost, setRealPost] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    roommatesApi.getPosts()
      .then(res => {
        if (!isMounted) return;
        if (Array.isArray(res) && res.length > 0) {
          setRealPost(res[0]);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

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
    <section className="py-16 md:py-24 bg-[#F8FAFC] border-t border-[#E2E8F0]">
      <div className="container-dormi">
        <div className="max-w-xl space-y-2 mb-12">
          <h2 className="text-h2 text-[#0F172A]">
            Tìm người ở cùng phù hợp lối sống
          </h2>
          <p className="text-body text-[#64748B]">
            Không chỉ tìm một căn phòng. Tìm người bạn cùng phòng có thói quen sinh hoạt và nhịp sống tương thích nhất với bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (5 cols): Filter form */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 shadow-xs p-6 rounded-2xl space-y-6">
            
            {/* Sleep Time */}
            <div className="space-y-2">
              <label className="text-caption font-semibold text-[#0F172A] block">Bạn thường đi ngủ lúc nào?</label>
              <div className="grid grid-cols-3 gap-2">
                {['< 22h', '22h - 00h', '> 00h'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSleepTime(opt)}
                    className={`py-2.5 rounded-xl text-caption font-semibold transition-all duration-150 active:scale-[0.98] ${
                      sleepTime === opt 
                        ? 'bg-[#00153D] text-white shadow-xs' 
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Smoking */}
            <div className="space-y-2">
              <label className="text-caption font-semibold text-[#0F172A] block">Hút thuốc lá</label>
              <div className="grid grid-cols-2 gap-2">
                {['Không', 'Có'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSmoking(opt)}
                    className={`py-2.5 rounded-xl text-caption font-semibold transition-all duration-150 active:scale-[0.98] ${
                      smoking === opt 
                        ? 'bg-[#00153D] text-white shadow-xs' 
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Pets */}
            <div className="space-y-2">
              <label className="text-caption font-semibold text-[#0F172A] block">Nuôi thú cưng</label>
              <div className="grid grid-cols-2 gap-2">
                {['Không', 'Có'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setPets(opt)}
                    className={`py-2.5 rounded-xl text-caption font-semibold transition-all duration-150 active:scale-[0.98] ${
                      pets === opt 
                        ? 'bg-[#00153D] text-white shadow-xs' 
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <Link 
              to="/tenant/match" 
              className="w-full bg-[#00153D] hover:bg-[#073372] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-body min-h-[44px] transition-colors shadow-xs"
            >
              <Users className="w-4 h-4" />
              <span>Xem danh sách tìm người ở ghép</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Right Column (7 cols): Result Preview Card */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-7 lg:p-8 shadow-xs space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-md">
                  {matchScore}% phù hợp
                </span>
                <span className="text-caption text-slate-500 font-medium">Độ hợp thói quen sinh hoạt</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 bg-[#00153D] text-white flex items-center justify-center font-bold text-h3 shrink-0">
                  {realPost?.customerAvatar ? (
                    <img 
                      src={realPost.customerAvatar} 
                      alt={realPost.customerName || 'Người ở ghép'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{(realPost?.customerName || 'U')[0]}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-h3 text-[#0F172A] font-bold">{realPost?.customerName || 'Hồ sơ sinh viên / nhân viên văn phòng'}</h3>
                  <p className="text-caption text-slate-500 font-medium mt-0.5">{realPost?.location || 'Khu vực TP. Hồ Chí Minh'}{realPost?.budget ? ` · Ngân sách ~${Number(realPost.budget).toLocaleString('vi-VN')}đ / tháng` : ''}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200/70 p-4 rounded-xl text-caption">
                <div>
                  <span className="text-slate-500 block font-semibold">Giờ ngủ</span>
                  <span className="font-bold text-slate-800">{sleepTime}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Hút thuốc</span>
                  <span className="font-bold text-slate-800">{smoking}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Thú cưng</span>
                  <span className="font-bold text-slate-800">{pets}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <p className="text-xs text-slate-500">Thông tin cá nhân và số điện thoại được bảo mật.</p>
                <Link 
                  to="/tenant/match" 
                  className="inline-flex items-center justify-center bg-white text-[#00153D] border border-slate-300 hover:bg-slate-50 font-semibold px-5 py-2.5 rounded-xl transition-colors text-caption min-h-[40px] gap-1.5 shadow-xs"
                >
                  <span>Khám phá thêm</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
