import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { 
  Check, 
  X, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ImageIcon, 
  Clock
} from 'lucide-react';

const COMMON_UTILITIES = [
  'Wifi', 'Máy lạnh', 'Tủ lạnh', 'Máy giặt', 'Ban công', 
  'Thang máy', 'Bãi giữ xe', 'Bảo vệ 24/7', 'Bếp riêng', 
  'Không chung chủ', 'Giờ giấc tự do', 'Nội thất đầy đủ', 
  'Gác lửng', 'Toilet riêng', 'Khóa vân tay', 'Camera an ninh'
];

const ROOM_TYPES = [
  'Studio', 
  'Phòng trọ', 
  '1 Phòng ngủ', 
  '2 Phòng ngủ', 
  'Căn hộ mini', 
  'Ở ghép / KTX'
];

const DESCRIPTION_TEMPLATES = [
  {
    label: 'Studio hiện đại',
    text: 'Phòng Studio mới 100%, trang bị đầy đủ nội thất: giường nệm, tủ quần áo, máy lạnh, tủ lạnh, bàn làm việc. Giờ giấc tự do, không chung chủ, bảo vệ 24/7. Điện 3.5k/kWh, nước 100k/người, wifi tốc độ cao miễn phí.'
  },
  {
    label: 'Phòng trọ sinh viên',
    text: 'Phòng trọ thoáng mát sạch sẽ, có gác lửng cao, toilet riêng trong phòng. Gần các trường đại học, chợ dân sinh và trạm xe buýt. An ninh đảm bảo, yên tĩnh, có camera 24/24 và chỗ để xe rộng rãi.'
  }
];

export default function SmartListingForm() {
  const [step, setStep] = useState(1);
  const [evaluating, setEvaluating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('25');
  const [address, setAddress] = useState('');
  const [roomType, setRoomType] = useState('Studio');
  const [description, setDescription] = useState('');
  const [selectedUtilities, setSelectedUtilities] = useState<string[]>([
    'Wifi', 'Máy lạnh', 'Tủ lạnh', 'Giờ giấc tự do', 'Toilet riêng'
  ]);
  const [customUtility, setCustomUtility] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const navigate = useNavigate();
  const createListingWithApi = useStore(state => state.createListingWithApi);
  const uploadImageToCloudinary = useStore(state => state.uploadImageToCloudinary);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const MAX = 1200;
        if (width > height && width > MAX) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        } else if (height > MAX) {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80');
      };
      img.src = url;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      for (const file of files) {
        // 1. Instant client-side compression -> User sees real photo immediately
        const compressedUrl = await compressImage(file);
        setImageUrls(prev => [...prev, compressedUrl]);

        // 2. Background sync with backend
        uploadImageToCloudinary(file).then(uploadedUrl => {
          if (uploadedUrl && !uploadedUrl.includes('unsplash.com')) {
            setImageUrls(prev => prev.map(u => u === compressedUrl ? uploadedUrl : u));
          }
        }).catch(() => {
          // Gracefully keep the high quality compressed image
        });
      }
    } catch {
      alert('Không thể đọc tập tin ảnh.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const toggleUtility = (util: string) => {
    setSelectedUtilities(prev => 
      prev.includes(util) ? prev.filter(u => u !== util) : [...prev, util]
    );
  };

  const handleAddCustomUtility = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customUtility.trim();
    if (trimmed && !selectedUtilities.includes(trimmed)) {
      setSelectedUtilities(prev => [...prev, trimmed]);
      setCustomUtility('');
    }
  };

  interface QualityCheckResult {
    score: number;
    titleCheck: { pass: boolean; note: string };
    priceAreaCheck: { pass: boolean; note: string };
    addressCheck: { pass: boolean; note: string };
    descriptionCheck: { pass: boolean; note: string };
    utilityCheck: { pass: boolean; note: string };
    imageCheck: { pass: boolean; note: string };
    recommendations: string[];
  }

  const [qualityResult, setQualityResult] = useState<QualityCheckResult | null>(null);

  const evaluateListingQuality = () => {
    setEvaluating(true);
    const pNum = parseFloat(price);
    const aNum = parseFloat(area);

    let score = 0;
    const recs: string[] = [];

    // 1. Title evaluation (max 20 pts)
    const titleLen = title.trim().length;
    let titlePass = false;
    let titleNote = '';
    if (titleLen >= 15) {
      score += 20;
      titlePass = true;
      titleNote = 'Tiêu đề đầy đủ, rõ ràng';
    } else if (titleLen >= 8) {
      score += 12;
      titlePass = true;
      titleNote = 'Tiêu đề tạm ổn nhưng nên thêm đặc điểm nổi bật';
      recs.push('Thêm đặc điểm nổi bật vào tiêu đề (gác lửng, ban công, v.v.)');
    } else {
      score += 5;
      titleNote = 'Tiêu đề quá ngắn (< 8 ký tự)';
      recs.push('Mở rộng tiêu đề mô tả rõ loại phòng và vị trí');
    }

    // 2. Price & Area reasonableness (max 20 pts)
    let priceAreaPass = false;
    let priceAreaNote = '';
    if (pNum >= 500000 && pNum <= 50000000 && aNum >= 9 && aNum <= 150) {
      score += 20;
      priceAreaPass = true;
      priceAreaNote = 'Giá thuê và diện tích hợp lệ cho thị trường';
    } else {
      score += 10;
      priceAreaNote = 'Giá hoặc diện tích chưa phù hợp khoảng thực tế';
      recs.push('Kiểm tra lại giá thuê và diện tích phòng');
    }

    // 3. Address completeness (max 15 pts)
    let addressPass = false;
    let addressNote = '';
    const addrLower = address.toLowerCase();
    if (address.trim().length >= 10 && (addrLower.includes('quận') || addrLower.includes('q.') || addrLower.includes('phường') || addrLower.includes('đường') || addrLower.includes('tp'))) {
      score += 15;
      addressPass = true;
      addressNote = 'Địa chỉ chi tiết, hỗ trợ định vị bản đồ chính xác';
    } else if (address.trim().length >= 5) {
      score += 10;
      addressPass = true;
      addressNote = 'Địa chỉ nên bổ sung phường/quận';
      recs.push('Bổ sung tên phường, quận để bản đồ PostGIS định vị chuẩn xác');
    } else {
      score += 5;
      addressNote = 'Địa chỉ quá ngắn';
      recs.push('Cung cấp địa chỉ số nhà, tên đường chi tiết');
    }

    // 4. Description completeness (max 15 pts)
    let descPass = false;
    let descNote = '';
    const descLen = description.trim().length;
    if (descLen >= 50) {
      score += 15;
      descPass = true;
      descNote = 'Mô tả chi tiết, đầy đủ thông tin tiện nghi và quy định';
    } else if (descLen >= 20) {
      score += 10;
      descPass = true;
      descNote = 'Mô tả cơ bản, nên bổ sung chi phí điện nước và giờ giấc';
      recs.push('Bổ sung chi tiết về chi phí điện nước, nội thất và quy định');
    } else {
      score += 4;
      descNote = 'Mô tả quá ngắn hoặc chưa có';
      recs.push('Viết mô tả chi tiết phòng trọ để khách thuê nắm rõ thông tin');
    }

    // 5. Utilities completeness (max 15 pts)
    let utilPass = false;
    let utilNote = '';
    if (selectedUtilities.length >= 4) {
      score += 15;
      utilPass = true;
      utilNote = `Đã chọn ${selectedUtilities.length} tiện ích phong phú`;
    } else if (selectedUtilities.length >= 1) {
      score += 10;
      utilPass = true;
      utilNote = `Đã chọn ${selectedUtilities.length} tiện ích cơ bản`;
      recs.push('Chọn thêm các tiện ích sẵn có để tăng lượt tìm kiếm theo bộ lọc');
    } else {
      score += 2;
      utilNote = 'Chưa chọn tiện ích nào';
      recs.push('Chọn ít nhất 3 tiện ích phòng trọ (Wifi, Máy lạnh, Giữ xe...)');
    }

    // 6. Image presence & quality (max 15 pts)
    let imagePass = false;
    let imageNote = '';
    if (imageUrls.length > 0) {
      score += 15;
      imagePass = true;
      imageNote = `Đã có ${imageUrls.length} ảnh thực tế`;
    } else {
      score += 3;
      imageNote = 'Chưa tải ảnh thực tế';
      recs.push('Tải lên ít nhất 1 ảnh phòng chụp thực tế để tăng uy tín');
    }

    setQualityResult({
      score,
      titleCheck: { pass: titlePass, note: titleNote },
      priceAreaCheck: { pass: priceAreaPass, note: priceAreaNote },
      addressCheck: { pass: addressPass, note: addressNote },
      descriptionCheck: { pass: descPass, note: descNote },
      utilityCheck: { pass: utilPass, note: utilNote },
      imageCheck: { pass: imagePass, note: imageNote },
      recommendations: recs
    });

    setEvaluating(false);
    setStep(4);
  };

  const handleFinalSubmit = async () => {
    const success = await createListingWithApi({
      title: title.trim() || 'Phòng trọ tiện nghi trung tâm',
      description: description.trim() || 'Phòng trọ sạch sẽ, thoáng mát, đầy đủ tiện nghi, an ninh 24/7.',
      price: parseFloat(price) || 3500000,
      area: parseFloat(area) || 25,
      utilities: selectedUtilities.join(', '),
      roomType,
      address: address.trim() || '123 Nguyễn Đình Chiểu, Quận 3, TP.HCM',
      imageUrls: imageUrls.length > 0 
        ? imageUrls 
        : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80']
    });

    if (success) {
      alert('Đăng bài trọ thành công! Tin đăng đang chờ Ban quản trị phê duyệt.');
      navigate('/landlord');
    } else {
      alert('Không thể tạo bài đăng. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 bg-[#F5F7FA]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h2 font-bold text-[#0F172A]">Tạo tin đăng phòng trọ</h1>
          <p className="text-caption text-[#64748B] mt-0.5">Quy trình đăng tin thông minh với đánh giá chất lượng tự động.</p>
        </div>
        <div className="flex gap-2">
          {[1,2,3,4].map(s => (
            <div key={s} className={`w-12 h-2.5 rounded-full transition-all ${step >= s ? 'bg-[#00153D]' : 'bg-[#E2E8F0]'}`} />
          ))}
        </div>
      </div>

      <Card className="p-6 md:p-8 bg-white rounded-[18px] shadow-clay-soft border-none">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-h3 font-bold text-[#0F172A] mb-4">Bước 1: Thông tin cơ bản & Tiện ích</h2>
            
            <Input 
              label="Tên tin đăng" 
              placeholder="Ví dụ: Căn hộ Studio hiện đại gần Đại học" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-caption font-semibold text-[#64748B] mb-1">Loại phòng</label>
                <select 
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white min-h-[44px]"
                >
                  {ROOM_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <Input 
                  label="Giá thuê (VNĐ/tháng)" 
                  type="number" 
                  placeholder="4500000" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div>
                <Input 
                  label="Diện tích (m²)" 
                  type="number" 
                  placeholder="25" 
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </div>
            </div>

            <Input 
              label="Địa chỉ chi tiết" 
              placeholder="Ví dụ: 123 Nguyễn Đình Chiểu, Phường Võ Thị Sáu, Quận 3, TP.HCM" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            {/* Mô tả chi tiết phòng trọ */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-caption font-semibold text-[#64748B]">
                  Mô tả chi tiết phòng trọ
                </label>
                <span className="text-caption text-[#94A3B8]">{description.length} ký tự</span>
              </div>

              {/* Mẫu gợi ý mô tả nhanh */}
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-caption text-[#64748B] inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#00153D]" /> Gợi ý nhanh:
                </span>
                {DESCRIPTION_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDescription(tmpl.text)}
                    className="text-caption px-2.5 py-1 rounded-full bg-[#F1F5F9] text-[#00153D] hover:bg-[#E2E8F0] font-medium transition-all"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>

              <textarea 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-3 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
                placeholder="Mô tả cụ thể về căn phòng: phòng mới hay cải tạo, nội thất gồm những gì, giá điện nước (ví dụ: 3.5k/kWh), quy định giờ giấc, tiện ích xung quanh..."
              />
            </div>

            {/* Tiện ích phòng trọ & Thêm tiện ích tùy chỉnh */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="block text-caption font-semibold text-[#64748B]">
                  Tiện ích & Dịch vụ đi kèm ({selectedUtilities.length} đã chọn)
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                {COMMON_UTILITIES.map(util => {
                  const active = selectedUtilities.includes(util);
                  return (
                    <button
                      key={util}
                      type="button"
                      onClick={() => toggleUtility(util)}
                      className={`px-3 py-1.5 rounded-[10px] text-caption font-semibold transition-all inline-flex items-center gap-1.5 ${
                        active 
                          ? 'bg-[#00153D] text-white shadow-sm' 
                          : 'bg-[#F5F7FA] text-[#64748B] border border-[#E2E8F0] hover:bg-white hover:text-[#0F172A]'
                      }`}
                    >
                      {active ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{util}</span>
                    </button>
                  );
                })}

                {/* Hiển thị tiện ích tùy chỉnh đã thêm ngoài danh sách phổ biến */}
                {selectedUtilities
                  .filter(u => !COMMON_UTILITIES.includes(u))
                  .map(customUtil => (
                    <button
                      key={customUtil}
                      type="button"
                      onClick={() => toggleUtility(customUtil)}
                      className="px-3 py-1.5 rounded-[10px] text-caption font-semibold bg-[#00153D] text-white shadow-sm inline-flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{customUtil}</span>
                      <X className="w-3 h-3 hover:text-red-300 ml-0.5" />
                    </button>
                  ))}
              </div>

              {/* Nhập thêm tiện ích tự do */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={customUtility}
                  onChange={(e) => setCustomUtility(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomUtility();
                    }
                  }}
                  placeholder="Thêm tiện ích khác (ví dụ: Nuôi thú cưng, Sân thượng, Bếp điện...)"
                  className="flex-1 bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[10px] px-3.5 py-2 text-caption text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomUtility()}
                  className="px-4 py-2 bg-[#00153D] text-white rounded-[10px] text-caption font-semibold hover:bg-[#002266] transition-all inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Thêm tiện ích
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={() => setStep(2)}>Tiếp theo: Hình ảnh</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-h3 font-bold text-[#0F172A] mb-4">Bước 2: Hình ảnh phòng trọ</h2>
            
            <div className="border-2 border-dashed border-[#CBD5E1] rounded-[14px] p-8 text-center bg-[#F5F7FA] shadow-clay-inset hover:bg-white transition-all cursor-pointer relative">
              <input 
                type="file" 
                multiple
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/bmp, image/heic, image/heif, image/*, .png, .jpg, .jpeg, .webp, .gif, .bmp, .heic, .heif"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                disabled={uploadingImage}
              />
              <div className="text-[#64748B] text-body mb-3 inline-flex items-center justify-center gap-1.5">
                {uploadingImage ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin text-[#00153D]" />
                    <span>Đang nén và tối ưu hóa ảnh...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5 text-[#00153D]" />
                    <span>Nhấp hoặc kéo thả hình ảnh thực tế vào đây (có thể chọn nhiều ảnh)</span>
                  </>
                )}
              </div>
              <Button variant="secondary" size="sm" disabled={uploadingImage}>
                {uploadingImage ? 'Đang xử lý...' : 'Chọn hình ảnh'}
              </Button>
            </div>

            {imageUrls.length > 0 && (
              <div className="space-y-2">
                <p className="text-caption font-semibold text-[#16803C] flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#16803C]" />
                  <span>Đã tải {imageUrls.length} ảnh phòng thực tế:</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#E2E8F0] h-28 bg-black/5 shadow-sm">
                      <img src={url} alt={`Upload preview ${idx}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-[#00153D]/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Ảnh chính
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-700 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Quay lại</Button>
              <Button onClick={() => setStep(3)}>Tiếp theo: Đánh giá chất lượng</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center py-8">
            <h2 className="text-h3 font-bold text-[#0F172A] mb-2">Bước 3: Đánh giá chất lượng tin đăng</h2>
            <p className="text-body text-[#64748B] mb-6 max-w-md mx-auto">
              Hệ thống kiểm tra tính toàn vẹn của tiêu đề, mô tả chi tiết, tiện ích, giá cả và hình ảnh thực tế trước khi gửi đến Ban quản trị.
            </p>
            {evaluating ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-[#00153D] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#00153D] font-semibold text-body">Đang chấm điểm các tiêu chí tin đăng...</p>
              </div>
            ) : (
              <Button size="lg" onClick={evaluateListingQuality}>Bắt đầu chấm điểm chất lượng</Button>
            )}
            <div className="pt-8 flex justify-start">
              <Button variant="ghost" onClick={() => setStep(2)} disabled={evaluating}>Quay lại</Button>
            </div>
          </div>
        )}

        {step === 4 && qualityResult && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px]">
              <div>
                <span className="text-caption font-semibold text-[#64748B]">Điểm chất lượng tin đăng</span>
                <div className="text-2xl font-bold text-[#0F172A] mt-0.5">
                  {qualityResult.score} <span className="text-sm font-normal text-[#64748B]">/ 100</span>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                qualityResult.score >= 80 ? 'bg-[#DCFCE7] text-[#16803C]' :
                qualityResult.score >= 50 ? 'bg-[#FEF9C3] text-[#A16207]' :
                'bg-[#FEE2E2] text-[#B91C1C]'
              }`}>
                {qualityResult.score >= 80 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đạt chuẩn hiển thị cao</span>
                  </>
                ) : qualityResult.score >= 50 ? (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Cần hoàn thiện thêm</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Chưa đủ điều kiện</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#0F172A]">Chi tiết 6 tiêu chí kiểm tra:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg border bg-white flex items-start gap-2.5">
                  <span className={qualityResult.titleCheck.pass ? "text-[#16803C]" : "text-[#E11D48]"}>
                    {qualityResult.titleCheck.pass ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </span>
                  <div>
                    <span className="font-semibold text-gray-800">Tiêu đề:</span>
                    <p className="text-xs text-gray-600 mt-0.5">{qualityResult.titleCheck.note}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border bg-white flex items-start gap-2.5">
                  <span className={qualityResult.priceAreaCheck.pass ? "text-[#16803C]" : "text-[#E11D48]"}>
                    {qualityResult.priceAreaCheck.pass ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </span>
                  <div>
                    <span className="font-semibold text-gray-800">Mức giá & Diện tích:</span>
                    <p className="text-xs text-gray-600 mt-0.5">{qualityResult.priceAreaCheck.note}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border bg-white flex items-start gap-2.5">
                  <span className={qualityResult.addressCheck.pass ? "text-[#16803C]" : "text-[#E11D48]"}>
                    {qualityResult.addressCheck.pass ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </span>
                  <div>
                    <span className="font-semibold text-gray-800">Địa chỉ:</span>
                    <p className="text-xs text-gray-600 mt-0.5">{qualityResult.addressCheck.note}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border bg-white flex items-start gap-2.5">
                  <span className={qualityResult.descriptionCheck.pass ? "text-[#16803C]" : "text-[#E11D48]"}>
                    {qualityResult.descriptionCheck.pass ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </span>
                  <div>
                    <span className="font-semibold text-gray-800">Mô tả chi tiết:</span>
                    <p className="text-xs text-gray-600 mt-0.5">{qualityResult.descriptionCheck.note}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border bg-white flex items-start gap-2.5">
                  <span className={qualityResult.utilityCheck.pass ? "text-[#16803C]" : "text-[#E11D48]"}>
                    {qualityResult.utilityCheck.pass ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </span>
                  <div>
                    <span className="font-semibold text-gray-800">Tiện ích đi kèm:</span>
                    <p className="text-xs text-gray-600 mt-0.5">{qualityResult.utilityCheck.note}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border bg-white flex items-start gap-2.5">
                  <span className={qualityResult.imageCheck.pass ? "text-[#16803C]" : "text-[#E11D48]"}>
                    {qualityResult.imageCheck.pass ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </span>
                  <div>
                    <span className="font-semibold text-gray-800">Hình ảnh phòng:</span>
                    <p className="text-xs text-gray-600 mt-0.5">{qualityResult.imageCheck.note}</p>
                  </div>
                </div>
              </div>
            </div>

            {qualityResult.recommendations.length > 0 && (
              <div className="p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-[12px]">
                <h4 className="text-xs font-bold text-[#B45309] uppercase tracking-wider mb-2">Khuyến nghị cải thiện tin:</h4>
                <ul className="text-xs text-[#92400E] space-y-1 list-disc list-inside">
                  {qualityResult.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Sửa lại thông tin</Button>
              <Button onClick={handleFinalSubmit}>Gửi tin đăng (Kiểm duyệt hệ thống)</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
