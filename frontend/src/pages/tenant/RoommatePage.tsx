import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockTenants } from '../../data/mockData';

interface Question {
  id: string;
  questionText: string;
  icon: string;
  options: { label: string; value: string; desc?: string }[];
}

const SURVEY_QUESTIONS: Question[] = [
  {
    id: 'sleepSchedule',
    questionText: 'Thói quen đi ngủ của bạn như thế nào?',
    icon: '😴',
    options: [
      { label: '🌅 Dậy sớm ngủ sớm', value: 'Ngủ trước 11 giờ đêm', desc: 'Thường thức dậy đón bình minh và đi ngủ trước 23h' },
      { label: '🦉 Cú đêm làm việc khuya', value: 'Ngủ trước 1 giờ sáng', desc: 'Sáng tạo nhất về đêm, thường thức tới sau 1h sáng' },
      { label: '⏰ Linh hoạt bình thường', value: 'Ngủ trước 12 giờ đêm', desc: 'Giờ giấc sinh hoạt điều độ, đi ngủ tầm 23h - 12h' }
    ]
  },
  {
    id: 'cleanliness',
    questionText: 'Mức độ gọn gàng ngăn nắp của bạn ra sao?',
    icon: '🧹',
    options: [
      { label: '✨ Chuẩn sạch sẽ tối đa', value: 'Rất gọn gàng', desc: 'Dọn dẹp phòng hàng ngày, mọi thứ phải đúng vị trí' },
      { label: '🧺 Ngăn nắp vừa phải', value: 'Gọn gàng', desc: 'Dọn dẹp định kỳ cuối tuần, giữ không gian gọn gàng' },
      { label: '👕 Tuỳ hứng thoải mái', value: 'Bình thường', desc: 'Bừa bộn nhẹ không là vấn đề, dọn dẹp khi cần thiết' }
    ]
  },
  {
    id: 'cooking',
    questionText: 'Tần suất nấu ăn tại phòng trọ?',
    icon: '🍳',
    options: [
      { label: '🍲 Tự nấu ăn hàng ngày', value: 'Thường xuyên', desc: 'Thích tự nấu cơm chuẩn bị hộp đồ ăn lành mạnh' },
      { label: '🍕 Thỉnh thoảng nấu ăn', value: 'Thỉnh thoảng', desc: 'Lúc nấu lúc ăn ngoài, tuỳ thuộc lịch học tập' },
      { label: '🚫 Không bao giờ nấu', value: 'Không nấu', desc: 'Ăn ngoài tiệm hoặc gọi ship đồ ăn về phòng' }
    ]
  },
  {
    id: 'pets',
    questionText: 'Quan điểm về việc nuôi thú cưng (chó, mèo)?',
    icon: '🐱',
    options: [
      { label: '🐾 Rất yêu thích nuôi pet', value: 'Có nuôi', desc: 'Mong muốn được nuôi hoặc sống cùng chó mèo đáng yêu' },
      { label: '🚫 Không nuôi pet', value: 'Không nuôi', desc: 'Không nuôi thú cưng vì bất kỳ lý do gì' }
    ]
  },
  {
    id: 'visitors',
    questionText: 'Quy định đón bạn bè, khách ngoài chơi phòng?',
    icon: '🤝',
    options: [
      { label: '🔒 Giới hạn tối đa', value: 'Không có khách', desc: 'Hạn chế người lạ vào phòng để đảm bảo an toàn tuyệt đối' },
      { label: '📅 Đón bạn thỉnh thoảng', value: 'Ít khi có khách', desc: 'Cho phép bạn bè qua chơi, học nhóm' },
      { label: '🎉 Thoải mái tự do', value: 'Thỉnh thoảng', desc: 'Chào đón bạn bè bất kỳ lúc nào, tôn trọng sự riêng tư' }
    ]
  },
  {
    id: 'smoking',
    questionText: 'Thói quen hút thuốc lá?',
    icon: '🚬',
    options: [
      { label: '🚫 Không hút thuốc', value: 'Không hút thuốc', desc: 'Không hút thuốc lá và không muốn ngửi mùi khói thuốc' }
    ]
  },
  {
    id: 'noise',
    questionText: 'Yêu cầu về mức độ yên tĩnh trong phòng?',
    icon: '🔊',
    options: [
      { label: '🤫 Cực kỳ yên tĩnh', value: 'Yên tĩnh', desc: 'Không phát loa ngoài, hạn chế tiếng ồn khi học tập' },
      { label: '🎵 Tiếng ồn vừa phải', value: 'Bình thường', desc: 'Có thể nghe nhạc nhỏ, nói chuyện thoải mái' }
    ]
  }
];

interface MatchedTenant {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  university: string;
  studentYear: string;
  major: string;
  budget: number;
  lifestyle: {
    sleepSchedule: string;
    cleanliness: string;
    cooking: string;
    pets: string;
    visitors: string;
    smoking: string;
    noise: string;
    gender: string;
    moveInDate: string;
  };
  matchPercentage: number;
  matchesDetail: Record<string, boolean>;
}

export default function RoommatePage() {
  const navigate = useNavigate();

  // Load state and determine activeTab synchronously from localStorage
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('dormi_roommate_survey');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeTab, setActiveTab] = useState<'survey' | 'matches'>(() => {
    const saved = localStorage.getItem('dormi_roommate_survey');
    return saved ? 'matches' : 'survey';
  });

  const [surveyStep, setSurveyStep] = useState(0);
  const [budgetSlider, setBudgetSlider] = useState(4000000);

  const handleResetSurvey = () => {
    localStorage.removeItem('dormi_roommate_survey');
    setAnswers({});
    setSurveyStep(0);
    setActiveTab('survey');
  };

  // Match calculator
  const candidates = useMemo<MatchedTenant[]>(() => {
    if (activeTab !== 'matches') return [];
    
    return mockTenants.map((tenant) => {
      let matchCount = 0;
      const totalKeys = SURVEY_QUESTIONS.length;
      const matchesDetail: Record<string, boolean> = {};

      SURVEY_QUESTIONS.forEach((q) => {
        const key = q.id as keyof typeof tenant.lifestyle;
        const userVal = answers[q.id];
        const tenantVal = tenant.lifestyle[key];

        if (userVal === tenantVal) {
          matchCount++;
          matchesDetail[q.id] = true;
        } else {
          matchesDetail[q.id] = false;
        }
      });

      // Budget difference
      const budgetDiff = Math.abs(tenant.budget - Number(answers.budget || 4000000));
      let budgetMatch = false;
      if (budgetDiff <= 1000000) {
        matchCount++;
        budgetMatch = true;
      }

      const matchPercentage = Math.round((matchCount / (totalKeys + 1)) * 100);

      return {
        ...tenant,
        lifestyle: tenant.lifestyle,
        matchPercentage,
        matchesDetail: { ...matchesDetail, budget: budgetMatch }
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [answers, activeTab]);

  const handleStartChat = (id: string, name: string) => {
    localStorage.setItem('chat_active_contact', JSON.stringify({ id, name, isRoommate: true }));
    navigate('/tenant/chat');
  };

  return (
    <div className="pt-20 min-h-screen bg-slate-50 font-sans pb-12">
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Title bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)' }}>🤝 Ghép Bạn Ở Ghép</h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Tìm kiếm người ở ghép phù hợp dựa trên thói quen sinh hoạt và lối sống.</p>
          </div>
          {activeTab === 'matches' && (
            <button
              onClick={handleResetSurvey}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '12px' }}
            >
              🔄 Khảo sát lại
            </button>
          )}
        </div>

        {/* TAB 1: SURVEY SECTION */}
        {activeTab === 'survey' && (
          <div className="card-container animate-fade-in-up" style={{ padding: '32px', backgroundColor: '#FFFFFF' }}>
            
            {/* Header survey */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>
                KHẢO SÁT THÓI QUEN SINH HOẠT
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                CÂU HỎI {surveyStep + 1} / {SURVEY_QUESTIONS.length + 1}
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: '4px', background: 'var(--color-surface-3)', borderRadius: 'var(--radius-full)', marginBottom: '32px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${((surveyStep) / (SURVEY_QUESTIONS.length + 1)) * 100}%`,
                  background: 'var(--gradient-brand)',
                  height: '100%',
                }}
              />
            </div>

            {/* Custom Question layout */}
            {surveyStep < SURVEY_QUESTIONS.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '36px' }}>{SURVEY_QUESTIONS[surveyStep].icon}</span>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    {SURVEY_QUESTIONS[surveyStep].questionText}
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                  {SURVEY_QUESTIONS[surveyStep].options.map((opt) => {
                    const isSelected = answers[SURVEY_QUESTIONS[surveyStep].id] === opt.value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => setAnswers({ ...answers, [SURVEY_QUESTIONS[surveyStep].id]: opt.value })}
                        style={{
                          padding: '16px 20px',
                          border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-lg)',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(67, 56, 202, 0.05)' : 'var(--color-surface-2)',
                          transition: 'all 0.2s ease',
                        }}
                        className="card-hover"
                      >
                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)', display: 'block' }}>{opt.label}</span>
                        {opt.desc && <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>{opt.desc}</span>}
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setSurveyStep(surveyStep + 1)}
                    disabled={!answers[SURVEY_QUESTIONS[surveyStep].id]}
                    className="btn-primary"
                    style={{ padding: '10px 28px', fontSize: '13px' }}
                  >
                    Tiếp theo
                  </button>
                </div>
              </div>
            ) : (
              /* BUDGET SELECTION LAST STEP */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '36px' }}>💵</span>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    Ngân sách thuê phòng tối đa của bạn?
                  </h2>
                </div>

                <div style={{ background: 'var(--color-surface-2)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Chi phí mong muốn:</span>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary)' }}>
                      {budgetSlider.toLocaleString('vi-VN')} đ/tháng
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1000000}
                    max={8000000}
                    step={100000}
                    value={budgetSlider}
                    onChange={(e) => setBudgetSlider(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    <span>1.000.000 đ</span>
                    <span>8.000.000 đ</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const finalAnswers = { ...answers, budget: budgetSlider.toString() };
                    setAnswers(finalAnswers);
                    localStorage.setItem('dormi_roommate_survey', JSON.stringify(finalAnswers));
                    setActiveTab('matches');
                  }}
                  className="btn-primary"
                  style={{ width: '100%', padding: '14px 0', marginTop: '12px' }}
                >
                  Hoàn tất & Tìm bạn ở ghép
                </button>
              </div>
            )}

            {/* Survey Footer actions */}
            {surveyStep > 0 && (
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '24px', display: 'flex', justifyContent: 'flex-start' }}>
                <button
                  type="button"
                  onClick={() => setSurveyStep(surveyStep - 1)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '12px' }}
                >
                  ← Câu hỏi trước
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RECOMMENDATIONS DISPLAY */}
        {activeTab === 'matches' && (
          <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              🎯 Đã tìm thấy {candidates.length} bạn ở ghép phù hợp nhất:
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }} className="md:grid-cols-2">
              {candidates.map((cand) => (
                <div
                  key={cand.id}
                  className="card-container"
                  style={{ backgroundColor: '#FFFFFF', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  {/* Header info */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <img
                      src={cand.avatar}
                      alt={cand.fullName}
                      style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-border)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {cand.fullName}
                      </h3>
                      <p style={{ fontSize: '11.5px', color: 'var(--color-primary)', fontWeight: 600 }}>
                        🏫 {cand.university} ({cand.studentYear})
                      </p>
                    </div>
                  </div>

                  {/* Compatibility score progress */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 700 }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Mức độ tương thích:</span>
                      <span style={{ color: cand.matchPercentage >= 80 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        {cand.matchPercentage}%
                      </span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--color-surface-3)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${cand.matchPercentage}%`,
                          background: cand.matchPercentage >= 80 ? 'var(--color-success)' : 'var(--color-warning)',
                          height: '100%',
                        }}
                      />
                    </div>
                  </div>

                  {/* Matching parameters details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      Đặc điểm chung
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {cand.matchesDetail.sleepSchedule && <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>✓ Giờ ngủ giống nhau</span>}
                      {cand.matchesDetail.cleanliness && <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>✓ Thói quen vệ sinh</span>}
                      {cand.matchesDetail.cooking && <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>✓ Tần suất nấu ăn</span>}
                      {cand.matchesDetail.pets && <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>✓ Thú cưng</span>}
                      {cand.matchesDetail.visitors && <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>✓ Đón khách</span>}
                      {cand.matchesDetail.noise && <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>✓ Mức độ yên tĩnh</span>}
                      {cand.matchesDetail.budget && <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>✓ Mức giá thuê</span>}
                    </div>
                  </div>

                  {/* Budget info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '12px', fontSize: '12.5px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Ngân sách mong muốn:</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {(cand.budget / 1000000).toFixed(1)}M/tháng
                    </span>
                  </div>

                  {/* Matcher Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleStartChat(cand.id, cand.fullName)}
                      className="btn-primary"
                      style={{ flex: 1, padding: '10px 0', fontSize: '12px' }}
                    >
                      💬 Nhắn tin kết nối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
