import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CheckCircle2, AlertCircle, Info, ShieldAlert, Award } from 'lucide-react';
import { trustSafetyApi, type TrustScoreBreakdown } from '../../services/api';
import { modalBackdropVariants, modalContentVariants } from '../../utils/motion';

interface TrustScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomTitle?: string;
}

export default function TrustScoreModal({ isOpen, onClose, roomId, roomTitle }: TrustScoreModalProps) {
  const [breakdown, setBreakdown] = useState<TrustScoreBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && roomId) {
      setLoading(true);
      setError(null);
      trustSafetyApi.getRoomTrustScore(roomId)
        .then(data => {
          setBreakdown(data);
        })
        .catch(err => {
          setError(err?.message || 'Không thể tải chỉ số tin cậy.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, roomId]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-600';
  };

  const getScoreBadgeBg = (score: number) => {
    if (score >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 70) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
        >
          <motion.div 
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-[20px] shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden motion-gpu"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">DORMI Trust Score</h2>
                  <p className="text-xs text-slate-500 truncate max-w-[280px]">
                    {roomTitle || 'Đánh giá minh bạch và an toàn'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-500">Đang tổng hợp điểm tín nhiệm minh bạch...</span>
                </div>
              ) : error ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-700 text-xs">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : breakdown ? (
                <>
                  {/* Score Overview Banner */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 font-medium">Điểm tín nhiệm chuẩn hóa</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className={`text-3xl font-black ${getScoreColor(breakdown.totalScore)}`}>
                          {breakdown.totalScore}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getScoreBadgeBg(breakdown.totalScore)}`}>
                        {breakdown.ratingLevel}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">Cập nhật tự động thời gian thực</p>
                    </div>
                  </div>

                  {/* Summary / Reason */}
                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100/80 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-900 leading-relaxed font-normal">
                      Điểm Trust Score phản ánh mức độ xác thực của chủ trọ, tài liệu nhà trọ, tính ổn định và phản hồi cộng đồng từ sinh viên thực tế.
                    </p>
                  </div>

                  {/* Breakdown Factors List */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                      Chi tiết các tiêu chí đối soát ({breakdown.factors?.length || 0})
                    </h3>
                    <div className="space-y-2.5">
                      {breakdown.factors?.map((factor, index) => (
                        <div
                          key={index}
                          className="p-3.5 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="mt-0.5">
                              {factor.passed || factor.points > 0 ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : factor.points < 0 ? (
                                <ShieldAlert className="w-4 h-4 text-rose-500" />
                              ) : (
                                <Info className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 leading-snug truncate">
                                {factor.label}
                              </p>
                              {factor.explanation && (
                                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                  {factor.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                              factor.points > 0 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : factor.points < 0 
                                ? 'bg-rose-50 text-rose-700' 
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {factor.points > 0 ? `+${factor.points}` : factor.points} / {factor.maxPoints} đ
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                Hệ thống chuẩn hoá độ tin cậy bất động sản DORMI
              </span>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 transition-colors"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
