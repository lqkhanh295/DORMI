import { Users, Crown, Code2, Layout, Megaphone, GraduationCap, IdCard, Camera } from 'lucide-react';

interface TeamMember {
  name: string;
  studentId: string;
  major: string;
  role: string;
  subRole: string;
  isLeader?: boolean;
  initials: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  avatarBg: string;
  icon: typeof Crown;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Lê Nhật Minh',
    studentId: 'SE191127',
    major: 'INTERNATIONAL BUSINESS (IB)',
    role: 'Trưởng nhóm',
    subRole: 'Chiến lược & Kinh doanh',
    isLeader: true,
    initials: 'NM',
    accentColor: 'border-amber-300 ring-2 ring-amber-400/40 bg-gradient-to-b from-amber-50/60 via-white to-amber-50/20 shadow-md',
    badgeBg: 'bg-amber-100/90 text-amber-900 border-amber-300',
    badgeText: 'text-amber-800',
    avatarBg: 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-200',
    icon: Crown
  },
  {
    name: 'Lê Quốc Khánh',
    studentId: 'SE193989',
    major: 'SOFTWARE ENGINEERING (IT)',
    role: 'Backend Developer',
    subRole: 'Kiến trúc & Cơ sở dữ liệu',
    initials: 'QK',
    accentColor: 'border-slate-200 bg-white hover:border-indigo-300',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeText: 'text-indigo-700',
    avatarBg: 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-indigo-200',
    icon: Code2
  },
  {
    name: 'Lê Quốc Khoa',
    studentId: 'SE193986',
    major: 'SOFTWARE ENGINEERING (IT)',
    role: 'Frontend Developer',
    subRole: 'Giao diện & Tích hợp hệ thống',
    initials: 'QK',
    accentColor: 'border-slate-200 bg-white hover:border-blue-300',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeText: 'text-blue-700',
    avatarBg: 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-blue-200',
    icon: Layout
  },
  {
    name: 'Vũ Nguyễn Đoan Nguyên',
    studentId: 'SS193976',
    major: 'MULTIMEDIA COMMUNICATION (MC)',
    role: 'Media',
    subRole: 'Media & Thiết kế',
    initials: 'DN',
    accentColor: 'border-slate-200 bg-white hover:border-purple-300',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    badgeText: 'text-purple-700',
    avatarBg: 'bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-purple-200',
    icon: Camera
  },
  {
    name: 'Nguyễn Ngọc Quỳnh Anh',
    studentId: 'SS194811',
    major: 'DIGITAL MARKETING (MKT)',
    role: 'Digital Marketing',
    subRole: 'Tăng trưởng & Cộng đồng',
    initials: 'QA',
    accentColor: 'border-slate-200 bg-white hover:border-rose-300',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeText: 'text-rose-700',
    avatarBg: 'bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-rose-200',
    icon: Megaphone
  }
];

export function TeamSection() {
  return (
    <section id="team-section" className="py-16 md:py-20 bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC] border-t border-slate-200/80">
      <div className="container-dormi max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-10 md:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#00153D] border border-blue-200/80 text-xs font-bold shadow-2xs">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>DORMI Team</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#00153D] tracking-tight">
            Đội ngũ sáng lập & Phát triển
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
            Sinh viên Đại học FPT TP.HCM nghiên cứu và phát triển giải pháp lưu trú thông minh, bảo vệ sinh viên trước vấn nạn phòng trọ ảo và lừa đảo tiền cọc.
          </p>
        </div>

        {/* 5 Member Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {TEAM_MEMBERS.map((member) => {
            const IconComponent = member.icon;
            return (
              <div
                key={member.studentId}
                className={`relative rounded-2xl p-5 border flex flex-col justify-between transition-all duration-200 ease-out hover:-translate-y-1.5 hover:shadow-lg ${member.accentColor}`}
              >
                {/* Leader Ribbon Badge */}
                {member.isLeader && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs border border-amber-300">
                      <Crown className="w-3 h-3 text-amber-200" />
                      <span>Leader</span>
                    </span>
                  </div>
                )}

                {/* Top: Avatar & Role Badge */}
                <div className="flex flex-col items-center text-center space-y-3 pt-1">
                  {/* Initials Avatar */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-md transition-transform duration-200 group-hover:scale-105 ${member.avatarBg}`}>
                    {member.initials}
                  </div>

                  {/* Role Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${member.badgeBg}`}>
                    <IconComponent className="w-3.5 h-3.5 shrink-0" />
                    <span>{member.role}</span>
                  </div>

                  {/* Name & MSSV */}
                  <div className="space-y-1.5 w-full">
                    <h3 className="text-[14px] font-black text-[#00153D] tracking-tight leading-tight min-h-[2.25rem] flex items-center justify-center text-center">
                      {member.name}
                    </h3>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-mono font-bold">
                      <IdCard className="w-3 h-3 text-slate-400" />
                      <span>{member.studentId}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom: Sub-role & Major */}
                <div className="pt-3.5 mt-3 border-t border-slate-200/60 text-center space-y-1">
                  <p className="text-[11px] font-semibold text-slate-700 leading-snug">
                    {member.subRole}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-[10px] font-medium text-slate-500 leading-snug">
                    <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="line-clamp-2 text-center">{member.major}</span>
                  </div>
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
