import { GraduationCap, Code2, GitBranch, Mail, Sparkles } from 'lucide-react';

export function TeamInfoSection() {
  const members = [
    {
      name: 'Lê Quốc Khánh',
      role: 'Trưởng nhóm / Fullstack Lead',
      description: 'Phụ trách kiến trúc hệ thống .NET 10 Clean Architecture, tối ưu hóa Supabase PostGIS, tích hợp thanh toán PayOS và giao diện React 19.',
      email: 'lqkhanh292005@gmail.com',
      github: 'https://github.com/lqkhanh295'
    },
    {
      name: 'Thành viên nhóm dự án',
      role: 'Phân tích nghiệp vụ & Kiểm thử (QA/BA)',
      description: 'Khảo sát nhu cầu khách hàng sinh viên, xây dựng luồng nghiệp vụ tìm trọ, kiểm thử chất lượng và kiểm toán trải nghiệm người dùng.',
      email: 'contact@dormi.space',
      github: 'https://github.com/lqkhanh295/DORMI'
    },
    {
      name: 'Thành viên nhóm dự án',
      role: 'Thiết kế giao diện & Vận hành (UI/UX & Ops)',
      description: 'Nghiên cứu hành vi người dùng thuê trọ, thiết kế hệ thống Design System v2.1 Pastel, tối ưu chuẩn tiếp cận WCAG và triển khai hạ tầng đám mây.',
      email: 'support@dormi.space',
      github: 'https://github.com/lqkhanh295/DORMI'
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-slate-50 border-t border-slate-200" id="team-info">
      <div className="container-dormi">
        <div className="max-w-3xl mx-auto text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#00153D] text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
            <span>Đề tài học phần EXE101</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#00153D] tracking-tight">
            Thông tin nhóm phát triển dự án DORMI
          </h2>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed">
            Dự án được xây dựng và phát triển bởi nhóm sinh viên với định hướng giải quyết bài toán nhức nhối trong tìm trọ và tìm bạn cùng phòng minh bạch.
          </p>
        </div>

        {/* Project Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#00153D] text-[#F2A900]">
                  EXE101
                </span>
                <span className="text-xs text-slate-500 font-medium">Khởi nghiệp đổi mới sáng tạo</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[#00153D]">
                DORMI — Smart Rental & Roommate Matching Platform
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href="https://github.com/lqkhanh295/DORMI" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                <GitBranch className="w-4 h-4" />
                <span>Mã nguồn GitHub</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs text-slate-600">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1">Kiến trúc backend</span>
              <span>.NET 10 Web API Clean Architecture, SignalR, PostGIS</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1">Giao diện người dùng</span>
              <span>React 19, TypeScript, Tailwind CSS v4, Three.js 3D</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1">Cơ sở dữ liệu & Đám mây</span>
              <span>Supabase PostgreSQL, Render Cloud, Vercel Edge</span>
            </div>
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {members.map((m, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-base mb-4 border border-blue-100">
                  <Code2 className="w-6 h-6 text-[#00153D]" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-base font-bold text-slate-900">{m.name}</h4>
                  {idx === 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800">
                      Lead
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-blue-700 mb-3">{m.role}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-500">
                <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 hover:text-blue-700 transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[140px]">{m.email}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          <p className="inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
            <span>Dự án được bảo đảm hoạt động liên tục 24/7 đến hết thời gian kết thúc đánh giá học phần.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
