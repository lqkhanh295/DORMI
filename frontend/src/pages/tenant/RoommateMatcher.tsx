import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../components/ui/Button';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useStore, type RoommateProfile } from '../../store/useStore';
import { 
  Heart, X, MessageCircle, Check, CheckCircle2, Trash2, Users, Home, 
  ExternalLink, Edit3, Eye, EyeOff, Plus, Calendar, DollarSign, MapPin, 
  Sparkles, Clock, Loader2
} from 'lucide-react';
import { roommatesApi, type RoommatePostResponse } from '../../services/api';
import { toast } from 'sonner';

export default function RoommateMatcher() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') === 'my-posts' ? 'my-posts' : 'explore';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLikedModal, setShowLikedModal] = useState(false);
  const [roommates, setRoommates] = useState<RoommateProfile[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'hasRoom'>('all');
  const [loading, setLoading] = useState(true);

  // My posts state
  const [myPosts, setMyPosts] = useState<RoommatePostResponse[]>([]);
  const [loadingMyPosts, setLoadingMyPosts] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const { likedRoommates, addLikedRoommate, removeLikedRoommate } = useStore();
  const navigate = useNavigate();

  const activeLikedRoommates = (likedRoommates || []).filter(r => r && r.customerId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowLikedModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch my roommate posts
  const fetchMyPosts = useCallback(async () => {
    try {
      setLoadingMyPosts(true);
      const res = await roommatesApi.getMyPosts();
      if (Array.isArray(res)) {
        setMyPosts(res);
      }
    } catch {
      // Unauthenticated or error
      setMyPosts([]);
    } finally {
      setLoadingMyPosts(false);
    }
  }, []);

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  // Fetch recommendations for explore tab
  useEffect(() => {
    let isMounted = true;

    const mapPostsToProfiles = (rawList: any[]): RoommateProfile[] => {
      return rawList.map((r: any) => ({
        id: r.id,
        customerId: r.customerId,
        name: r.customerName || 'Người ở ghép',
        age: r.age || (r.customerDateOfBirth ? Math.floor((Date.now() - new Date(r.customerDateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000)) : undefined),
        major: r.title || 'Sinh viên',
        image: r.customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        matchScore: r.matchScore != null ? Math.round(r.matchScore) : null,
        budget: `${Number(r.budget || 3000000).toLocaleString('vi-VN')}đ`,
        bio: r.description || 'Tìm bạn cùng phòng giữ vệ sinh tốt và thân thiện.',
        tags: (r.lifestyleTraits || 'Yên tĩnh, Sạch sẽ').split(',').map((t: string) => t.trim()),
        roomId: r.roomId,
        roomTitle: r.roomTitle,
        roomAddress: r.roomAddress,
        roomPrice: r.roomPrice,
        roomImageUrl: r.roomImageUrl
      }));
    };

    roommatesApi.getRecommendations()
      .then(res => {
        if (!isMounted) return;
        if (Array.isArray(res) && res.length > 0) {
          setRoommates(mapPostsToProfiles(res));
          setLoading(false);
        } else {
          return roommatesApi.getPosts().then(publicPosts => {
            if (!isMounted) return;
            if (Array.isArray(publicPosts) && publicPosts.length > 0) {
              setRoommates(mapPostsToProfiles(publicPosts));
            } else {
              setRoommates([]);
            }
          });
        }
      })
      .catch(() => {
        return roommatesApi.getPosts().then(publicPosts => {
          if (!isMounted) return;
          if (Array.isArray(publicPosts) && publicPosts.length > 0) {
            setRoommates(mapPostsToProfiles(publicPosts));
          } else {
            setRoommates([]);
          }
        }).catch(() => {
          if (isMounted) setRoommates([]);
        });
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const handleToggleActive = async (post: RoommatePostResponse) => {
    try {
      setActionLoadingId(post.id);
      const nextActive = !post.isActive;
      await roommatesApi.updatePost(post.id, {
        title: post.title,
        description: post.description,
        budget: post.budget,
        location: post.location,
        moveInDate: post.moveInDate,
        genderPreference: post.genderPreference,
        lifestyleTraits: post.lifestyleTraits,
        roomId: post.roomId,
        isActive: nextActive
      });

      setMyPosts(prev => prev.map(p => p.id === post.id ? { ...p, isActive: nextActive } : p));
      toast.success(nextActive ? 'Đã bật hiển thị lại bài đăng!' : 'Đã tạm dừng hiển thị bài đăng.');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể cập nhật trạng thái bài đăng.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài đăng tìm bạn ở ghép này? Thao tác này không thể hoàn tác.')) {
      return;
    }

    try {
      setActionLoadingId(id);
      await roommatesApi.deletePost(id);
      setMyPosts(prev => prev.filter(p => p.id !== id));
      toast.success('Đã xóa bài đăng tìm bạn ở ghép.');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể xóa bài đăng.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredRoommates = filterMode === 'hasRoom' 
    ? roommates.filter(r => !!r.roomId) 
    : roommates;

  const handleAction = (type: 'left' | 'right') => {
    if (currentIndex >= filteredRoommates.length) return;
    if (type === 'right') {
      addLikedRoommate(filteredRoommates[currentIndex]);
    }
    setCurrentIndex(prev => prev + 1);
  };

  const navigateToChat = (targetProfile: RoommateProfile) => {
    navigate('/tenant/chat', { 
      state: { 
        targetUserId: targetProfile.customerId || targetProfile.id,
        targetUserName: targetProfile.name,
        targetUserRole: 'Roommate'
      } 
    });
  };

  const profile = filteredRoommates[currentIndex];

  const LikedList = () => (
    <div className="flex-1 overflow-y-auto flex flex-col p-5 space-y-4 bg-white">
      {activeLikedRoommates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-[#64748B] space-y-3 py-10">
          <Heart size={32} className="text-[#CBD5E1]" />
          <p className="text-body font-bold text-[#0F172A]">Chưa có ai trong danh sách</p>
          <p className="text-caption text-[#64748B] text-center max-w-[24ch] inline-flex items-center justify-center gap-1">
            <span>Bấm thích</span>
            <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 inline-block" />
            <span>để lưu hồ sơ người ở ghép</span>
          </p>
        </div>
      ) : (
        activeLikedRoommates.map(r => (
          <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <img src={r.image} className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0" alt={r.name} />
            <div className="flex-1 text-left overflow-hidden">
              <h4 className="text-body font-bold text-[#0F172A] truncate">{r.name}</h4>
              <p className="text-caption font-bold text-emerald-700">
                {r.matchScore != null ? `${r.matchScore}% Độ tương thích` : 'Chưa đủ dữ liệu'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button 
                onClick={() => navigateToChat(r)} 
                className="w-9 h-9 flex items-center justify-center bg-[#00153D] text-white rounded-[10px] hover:bg-[#073372] transition-colors touch-target"
                title="Nhắn tin"
              >
                <MessageCircle size={16} />
              </button>
              <button 
                onClick={() => removeLikedRoommate(r.id)} 
                className="w-9 h-9 flex items-center justify-center bg-white text-[#C62828] border border-[#FECACA] rounded-[10px] hover:bg-[#FEF2F2] transition-colors touch-target"
                title="Bỏ thích"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col gap-4 max-w-6xl mx-auto w-full lg:h-[calc(100vh-135px)] overflow-hidden">
      
      {/* Global Roommate Tabs */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'explore' })}
            className={`px-4 py-2 rounded-xl text-caption font-bold transition-all duration-150 flex items-center gap-2 ${
              currentTab === 'explore'
                ? 'bg-[#00153D] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#F2A900]" />
            <span>Khám phá bạn ở ghép</span>
          </button>

          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'my-posts' })}
            className={`px-4 py-2 rounded-xl text-caption font-bold transition-all duration-150 flex items-center gap-2 ${
              currentTab === 'my-posts'
                ? 'bg-[#00153D] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Bài đăng của tôi</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              currentTab === 'my-posts' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {myPosts.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            type="button"
            onClick={() => setShowLikedModal(true)}
            className="lg:hidden bg-white border border-slate-200 text-slate-800 px-3 py-2 rounded-xl text-caption font-semibold flex items-center gap-1.5 shadow-xs touch-target"
          >
            <Heart size={16} className="fill-[#C62828] text-[#C62828]" />
            <span>Đã thích ({activeLikedRoommates.length})</span>
          </button>

          <Link
            to="/tenant/post"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00153D] hover:bg-[#073372] text-white text-caption font-bold rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Đăng tin ở ghép</span>
          </Link>
        </div>
      </div>

      {/* VIEW: MY POSTS */}
      {currentTab === 'my-posts' && (
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-h3 font-bold text-[#0F172A] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00153D]" />
                Quản lý tin tìm bạn ở ghép ({myPosts.length})
              </h2>
              <p className="text-caption text-[#64748B]">
                Xem lại các bài viết bạn đã đăng, chỉnh sửa thông tin, hoặc tạm dừng hiển thị khi đã tìm được bạn ở ghép.
              </p>
            </div>
            <Link
              to="/tenant/post"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00153D] hover:bg-[#073372] text-white text-caption font-bold rounded-xl transition-colors shrink-0 self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo tin mới</span>
            </Link>
          </div>

          {loadingMyPosts ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#00153D]" />
              <p className="text-caption">Đang tải danh sách bài đăng của bạn...</p>
            </div>
          ) : myPosts.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-[#00153D] rounded-full flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-h3 font-bold text-slate-900">Bạn chưa có bài đăng tìm bạn ở ghép nào</h3>
                <p className="text-body text-slate-500">
                  Tạo bài đăng để hệ thống DORMI tự động ghép nối bạn với những bạn cùng phòng phù hợp nhất về tính cách và ngân sách.
                </p>
              </div>
              <Button onClick={() => navigate('/tenant/post')} variant="primary" className="px-6">
                Đăng tin tìm bạn ở ghép ngay
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myPosts.map(post => {
                const isWorking = actionLoadingId === post.id;
                const traitsList = (post.lifestyleTraits || '').split(',').map(s => s.trim()).filter(Boolean);
                const formattedDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : 'Mới đăng';
                const formattedMoveIn = post.moveInDate ? new Date(post.moveInDate).toLocaleDateString('vi-VN') : 'Thương lượng';

                return (
                  <div 
                    key={post.id} 
                    className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col gap-4"
                  >
                    {/* Header: Title & Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {post.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Đang hiển thị công khai</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Đã tạm dừng hiển thị</span>
                            </span>
                          )}
                          <span className="text-caption text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Đăng ngày: {formattedDate}</span>
                          </span>
                        </div>
                        <h3 className="text-body font-bold text-slate-900 sm:text-lg">
                          {post.title}
                        </h3>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-start">
                        <Link
                          to={`/tenant/post?edit=${post.id}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-caption font-bold rounded-xl transition-colors flex items-center gap-1.5 touch-target"
                          title="Chỉnh sửa bài đăng"
                        >
                          <Edit3 className="w-4 h-4 text-blue-600" />
                          <span>Chỉnh sửa</span>
                        </Link>

                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() => handleToggleActive(post)}
                          className={`px-3 py-1.5 text-caption font-bold rounded-xl transition-colors flex items-center gap-1.5 touch-target ${
                            post.isActive 
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200' 
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                          title={post.isActive ? 'Tạm dừng hiển thị' : 'Bật hiển thị lại'}
                        >
                          {isWorking ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : post.isActive ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                          <span>{post.isActive ? 'Tạm dừng' : 'Mở lại'}</span>
                        </button>

                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() => handleDeletePost(post.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-caption font-bold rounded-xl transition-colors flex items-center gap-1.5 touch-target"
                          title="Xóa bài đăng"
                        >
                          {isWorking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-rose-600" />}
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> Khu vực
                        </span>
                        <p className="text-caption font-bold text-slate-800">{post.location}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Ngân sách
                        </span>
                        <p className="text-caption font-bold text-blue-700">
                          {Number(post.budget || 0).toLocaleString('vi-VN')} đ/tháng
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> Ngày dọn vào
                        </span>
                        <p className="text-caption font-bold text-slate-800">{formattedMoveIn}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" /> Giới tính
                        </span>
                        <p className="text-caption font-bold text-slate-800">
                          {post.genderPreference === 'Male' ? 'Nam' : post.genderPreference === 'Female' ? 'Nữ' : 'Tất cả'}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-body text-slate-600 line-clamp-3">
                      {post.description}
                    </p>

                    {/* Lifestyle tags */}
                    {traitsList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {traitsList.map((tag, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Attached room preview */}
                    {post.roomId && (
                      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {post.roomImageUrl ? (
                            <img src={post.roomImageUrl} alt={post.roomTitle || ''} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-blue-100" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                              <Home className="w-5 h-5" />
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <span className="text-[10px] font-semibold text-blue-700">Phòng trọ gắn kèm tin đăng</span>
                            <h4 className="text-caption font-bold text-slate-900 truncate">{post.roomTitle || 'Phòng trọ'}</h4>
                            <p className="text-[11px] text-slate-500 truncate">{post.roomAddress}</p>
                          </div>
                        </div>
                        <Link
                          to={`/room/${post.roomId}`}
                          target="_blank"
                          className="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-caption font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <span>Xem phòng</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW: EXPLORE / RECOMMENDATIONS */}
      {currentTab === 'explore' && (
        <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 w-full h-full overflow-hidden">
          
          {/* Sidebar: Liked Roommates */}
          <div className="hidden lg:flex w-1/3 flex-col bg-white rounded-[18px] shadow-clay-soft overflow-hidden border border-[#E2E8F0] h-full">
            <div className="p-4 border-b border-[#E2E8F0] bg-white shrink-0">
              <h2 className="text-h3 font-bold text-[#0F172A] flex items-center gap-2">
                <Heart size={20} className="text-[#C62828] fill-[#C62828]" />
                Đã thích ({activeLikedRoommates.length})
              </h2>
              <p className="text-caption text-[#64748B] mt-0.5">Hồ sơ người ở ghép bạn đã lưu.</p>
            </div>
            <LikedList />
          </div>

          {/* Main Area */}
          <div className="flex-1 flex flex-col relative bg-[#F8FAFC] rounded-[18px] h-full overflow-hidden justify-between">
            
            <div className="bg-white rounded-[18px] shadow-clay-soft p-3 mb-3 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-[#E2E8F0]/60">
              <div>
                <span className="text-caption font-bold text-[#00153D]">Độ hợp về thói quen sinh hoạt</span>
                <p className="text-[11px] text-[#64748B]">Kết nối bạn cùng phòng và các căn phòng đang có sẵn trên Marketplace</p>
              </div>
              <div className="flex bg-[#E2E8F0] p-1 rounded-xl text-caption font-semibold">
                <button
                  onClick={() => { setFilterMode('all'); setCurrentIndex(0); }}
                  className={`px-3 py-1 rounded-lg transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] ${filterMode === 'all' ? 'bg-white text-[#00153D] shadow-sm font-bold' : 'text-[#64748B]'}`}
                >
                  Tất cả ({roommates.length})
                </button>
                <button
                  onClick={() => { setFilterMode('hasRoom'); setCurrentIndex(0); }}
                  className={`px-3 py-1 rounded-lg transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] ${filterMode === 'hasRoom' ? 'bg-white text-[#00153D] shadow-sm font-bold' : 'text-[#64748B]'}`}
                >
                  Đã có phòng sẵn ({roommates.filter(r => !!r.roomId).length})
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 text-[#64748B]">
                <div className="w-8 h-8 border-4 border-[#00153D] border-t-transparent rounded-full animate-spin mb-3"></div>
                <p>Đang tải danh sách người ở ghép...</p>
              </div>
            ) : roommates.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center bg-white rounded-[18px] shadow-clay-soft p-8 max-w-md mx-auto w-full space-y-4">
                <div className="w-16 h-16 bg-blue-50 text-[#00153D] rounded-full flex items-center justify-center mx-auto">
                  <Users size={32} />
                </div>
                <h2 className="text-h2 font-bold text-[#0F172A]">Chưa có người ở ghép</h2>
                <p className="text-[#64748B] text-body max-w-xs mx-auto">
                  Hiện tại chưa có bài đăng tìm người ở ghép phù hợp trên hệ thống. Hãy là người đầu tiên đăng bài!
                </p>
                <Button onClick={() => navigate('/tenant/post')} variant="primary" className="px-6">
                  Đăng tin tìm người ở ghép
                </Button>
              </div>
            ) : currentIndex >= roommates.length || !profile ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center bg-white rounded-[18px] shadow-clay-soft p-8 max-w-md mx-auto w-full space-y-4">
                <div className="w-16 h-16 bg-[#F0FDF4] text-[#16803C] rounded-full flex items-center justify-center mx-auto">
                  <Check size={32} />
                </div>
                <h2 className="text-h2 font-bold text-[#0F172A]">Đã xem hết gợi ý!</h2>
                <p className="text-[#64748B] text-body max-w-xs mx-auto">
                  Bạn đã lưu <span className="font-bold text-[#00153D]">{activeLikedRoommates.length}</span> hồ sơ phù hợp.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                  <Button onClick={() => setCurrentIndex(0)} variant="secondary" className="w-full sm:w-auto px-6">
                    Xem lại từ đầu
                  </Button>
                  <Button onClick={() => navigate('/tenant/post')} variant="primary" className="w-full sm:w-auto px-6">
                    Đăng tin tìm người ở ghép
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center w-full mx-auto min-h-0">
                <div className="bg-white rounded-[18px] shadow-clay-primary w-full max-w-md overflow-hidden flex flex-col my-auto border border-[#E2E8F0]/60">
                  
                  <div className="h-44 sm:h-52 bg-[#EEF2F6] w-full relative shrink-0">
                    <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 bg-white/95 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-md text-xs font-semibold shadow-sm">
                      {profile.matchScore != null ? `${profile.matchScore}% Độ tương thích` : 'Chưa đủ dữ liệu'}
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-5 space-y-3 bg-white flex flex-col justify-between">
                    <div>
                      <h3 className="text-h3 font-bold text-[#0F172A]">{profile.name}{profile.age ? `, ${profile.age} tuổi` : ''}</h3>
                      <p className="text-caption text-[#64748B] font-semibold">{profile.major} · Ngân sách {profile.budget}</p>
                      <p className="text-body text-[#64748B] mt-1 line-clamp-2">{profile.bio}</p>
                      {profile.tags && profile.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {profile.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {profile.roomId && (
                      <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-[12px] flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {profile.roomImageUrl ? (
                            <img src={profile.roomImageUrl} alt={profile.roomTitle} className="w-10 h-10 rounded-[8px] object-cover shrink-0 border border-blue-100" />
                          ) : (
                            <div className="w-10 h-10 rounded-[8px] bg-blue-600 text-white flex items-center justify-center shrink-0">
                              <Home className="w-4 h-4" />
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <span className="text-[10px] font-medium text-slate-500">Căn phòng tương ứng</span>
                            <h4 className="text-caption font-bold text-slate-900 truncate">{profile.roomTitle || 'Phòng trọ'}</h4>
                            <div className="flex items-center gap-1.5 text-[10px]">
                              <span className="font-bold text-blue-700">Giá thuê: 3.500.000đ/tháng</span>
                              <span>·</span>
                              <span className="text-slate-500 truncate">{profile.roomAddress}</span>
                            </div>
                          </div>
                        </div>
                        <Link 
                          to={`/room/${profile.roomId}`}
                          target="_blank"
                          className="shrink-0 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <span>Xem phòng</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}

                    <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl space-y-1">
                      <span className="text-[11px] font-bold text-slate-900 block">Lý do tương thích:</span>
                      <div className="flex items-center gap-1.5 text-caption font-semibold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Cùng thói quen sinh hoạt và ngân sách</span>
                      </div>
                    </div>

                    <div className="flex justify-center gap-5 pt-1">
                      <button 
                        onClick={() => handleAction('left')}
                        className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#C62828] hover:bg-[#C62828] hover:text-white flex items-center justify-center transition-[background-color,color,transform,box-shadow] duration-150 ease-out hover:scale-105 active:scale-95 border border-[#FECACA] shadow-clay-soft touch-target"
                        title="Bỏ qua"
                      >
                        <X size={22} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={() => handleAction('right')}
                        className="w-12 h-12 rounded-full bg-[#F0FDF4] text-[#16803C] hover:bg-[#16803C] hover:text-white flex items-center justify-center transition-[background-color,color,transform,box-shadow] duration-150 ease-out hover:scale-105 active:scale-95 border border-[#DCFCE7] shadow-clay-soft touch-target"
                        title="Yêu thích"
                      >
                        <Heart size={22} strokeWidth={2.5} className="fill-current" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {createPortal(
        showLikedModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/60 backdrop-blur-xs p-4 lg:hidden overflow-y-auto">
            <div 
              className="fixed inset-0"
              onClick={() => setShowLikedModal(false)}
            />
            <div 
              role="dialog"
              aria-modal="true"
              className="relative my-auto bg-white rounded-2xl shadow-xl border border-[#E2E8F0] w-full max-w-md h-[min(80vh,680px)] flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-white">
                <h3 className="font-bold text-h3 text-[#0F172A]">Đã thích ({activeLikedRoommates.length})</h3>
                <button onClick={() => setShowLikedModal(false)} className="text-[#64748B] hover:text-[#0F172A] p-2 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <LikedList />
            </div>
          </div>
        ),
        document.body
      )}
    </div>
  );
}
