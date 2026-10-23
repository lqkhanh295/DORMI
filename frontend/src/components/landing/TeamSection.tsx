import { Users, GraduationCap, Award, IdCard, BookOpen } from 'lucide-react';

interface TeamMember {
  name: string;
  studentId: string;
  major: string;
  roleBadge: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Lê Nhật Minh',
    studentId: 'SE191127',
    major: 'INTERNATIONAL BUSINESS (IB)',
    roleBadge: 'Kinh doanh & Chiến lược'
  },
  {
    name: 'Vũ Nguyễn Đoan Nguyên',
    studentId: 'SS193976',
    major: 'MULTIMEDIA COMMUNICATION (MC)',
    roleBadge: 'Truyền thông & UI/UX'
  },
  {
    name: 'Lê Quốc Khánh',
    studentId: 'SE193989',
    major: 'SOFTWARE ENGINEERING (IT)',
    roleBadge: 'Fullstack & Kiến trúc hệ thống'
  },
  {
    name: 'Lê Quốc Khoa',
    studentId: 'SE193986',
    major: 'SOFTWARE ENGINEERING (IT)',
    roleBadge: 'Frontend & Tích hợp'
  },
  {
    name: 'Nguyễn Ngọc Quỳnh Anh',
    studentId: 'SS194811',
    major: 'DIGITAL MARKETING (MKT)',
    roleBadge: 'Marketing & Vận hành cộng đồng'
  }
];

export function TeamSection() {
  return (
    <section id="team-section" className="py-16 md:py-24 bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC] border-t border-slate-200/80">
      <div className="container-dormi max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#00153D] border border-blue-200 text-xs font-bold shadow-2xs">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Đội ngũ nghiên cứu & phát triển</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#00153D] tracking-tight">
            Thành Viên Nhóm Dự Án DORMI
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Dự án xây dựng nền tảng kết nối phòng trọ xác thực, bảo vệ tiền cọc và gợi ý bạn cùng phòng thông minh cho sinh viên Đại học.
          </p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-hidden rounded-2xl border-2 border-[#1E3A8A]/30 shadow-lg bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1E3A8A] text-white">
                <th className="py-4 px-6 text-left text-xs font-black tracking-wider uppercase border-r border-blue-800/40">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-200" />
                    <span>NAME</span>
                  </div>
                </th>
                <th className="py-4 px-6 text-left text-xs font-black tracking-wider uppercase border-r border-blue-800/40">
                  <div className="flex items-center gap-2">
                    <IdCard className="w-4 h-4 text-blue-200" />
                    <span>STUDENT ID</span>
                  </div>
                </th>
                <th className="py-4 px-6 text-left text-xs font-black tracking-wider uppercase">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-200" />
                    <span>MAJOR</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {TEAM_MEMBERS.map((member, index) => {
                const isEven = index % 2 === 0;
                return (
                  <tr 
                    key={member.studentId}
                    className={`transition-colors duration-150 border-b border-blue-200/50 last:border-b-0 hover:brightness-95 ${
                      isEven ? 'bg-[#D6E6F7]' : 'bg-[#EAF2FA]'
                    }`}
                  >
                    <td className="py-4 px-6 text-sm font-extrabold text-[#00153D] border-r border-blue-200/50">
                      <div className="flex items-center justify-between">
                        <span>{member.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/70 text-blue-800 border border-blue-200">
                          {member.roleBadge}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-bold font-mono text-slate-800 border-r border-blue-200/50">
                      {member.studentId}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold tracking-wide text-slate-800">
                      {member.major}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards */}
        <div className="md:hidden space-y-3">
          {TEAM_MEMBERS.map((member, index) => {
            const isEven = index % 2 === 0;
            return (
              <div 
                key={member.studentId}
                className={`p-4 rounded-xl border border-blue-200 shadow-xs space-y-2 ${
                  isEven ? 'bg-[#D6E6F7]' : 'bg-[#EAF2FA]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#00153D]">{member.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-blue-800 border border-blue-200">
                    {member.studentId}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <BookOpen className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <span>{member.major}</span>
                </div>
                <div className="text-[11px] font-medium text-blue-900 bg-white/60 px-2.5 py-1 rounded-lg">
                  Vai trò: {member.roleBadge}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default TeamSection;
