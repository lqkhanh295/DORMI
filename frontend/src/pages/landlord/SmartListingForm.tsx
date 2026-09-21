import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { Check, X, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export default function SmartListingForm() {
  const [step, setStep] = useState(1);
  const [evaluating, setEvaluating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('25');
  const [address, setAddress] = useState('');
  const [roomType] = useState('Studio');
  const [utilities] = useState('Wifi, Máy lạnh, Tủ lạnh, Giặt giũ');
  const [imageUrl, setImageUrl] = useState('');

  const navigate = useNavigate();
  const createListingWithApi = useStore(state => state.createListingWithApi);
  const uploadImageToCloudinary = useStore(state => state.uploadImageToCloudinary);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadImageToCloudinary(file);
      if (uploadedUrl) {
        setImageUrl(uploadedUrl);
      }
    } catch (err: any) {
      alert(err.message || 'Upload ảnh lên Cloudinary không thành công. Sử dụng ảnh mặc định.');
      setImageUrl(URL.createObjectURL(file));
    } finally {
      setUploadingImage(false);
    }
  };

  interface QualityCheckResult {
    score: number;
    titleCheck: { pass: boolean; note: string };
    priceAreaCheck: { pass: boolean; note: string };
    addressCheck: { pass: boolean; note: string };
    imageCheck: { pass: boolean; note: string };
    recommendations: string[];
  }

  const [qualityResult, setQualityResult] = useState<QualityCheckResult | null>(null);

  const evaluateListingQuality = () => {
    setEvaluating(true);
    // ponytail: deterministic rule-based evaluation instead of fake AI setTimeout
    const pNum = parseFloat(price);
    const aNum = parseFloat(area);

    let score = 0;
    const recs: string[] = [];

    // 1. Title evaluation (max 25 pts)
    const titleLen = title.trim().length;
    let titlePass = false;
    let titleNote = '';
    if (titleLen >= 15) {
      score += 25;
      titlePass = true;
      titleNote = 'Tiêu đề đầy đủ, rõ ràng';
    } else if (titleLen >= 8) {
      score += 15;
      titlePass = true;
      titleNote = 'Tiêu đề tạm ổn nhưng nên thêm từ khóa (ví dụ: gác lửng, ban công)';
      recs.push('Thêm đặc điểm nổi bật vào tiêu đề để tăng 25% lượt click');
    } else {
      score += 5;
      titleNote = 'Tiêu đề quá ngắn (< 8 ký tự)';
      recs.push('Mở rộng tiêu đề mô tả rõ loại phòng và khu vực');
    }

    // 2. Price & Area reasonableness (max 25 pts)
    let priceAreaPass = false;
    let priceAreaNote = '';
    if (pNum >= 500000 && pNum <= 50000000 && aNum >= 9 && aNum <= 150) {
      score += 25;
      priceAreaPass = true;
      priceAreaNote = 'Giá thuê và diện tích hợp lệ cho thị trường TP.HCM';
    } else {
      score += 10;
      priceAreaNote = 'Giá hoặc diện tích nằm ngoài khoảng phổ biến';
      recs.push('Kiểm tra lại giá thuê và diện tích phòng');
    }

    // 3. Address completeness (max 25 pts)
    let addressPass = false;
    let addressNote = '';
    const addrLower = address.toLowerCase();
    if (address.trim().length >= 10 && (addrLower.includes('quận') || addrLower.includes('q.') || addrLower.includes('phường') || addrLower.includes('đường') || addrLower.includes('tp'))) {
      score += 25;
      addressPass = true;
      addressNote = 'Địa chỉ đầy đủ, hỗ trợ định vị bản đồ chính xác';
    } else if (address.trim().length >= 5) {
      score += 15;
      addressPass = true;
      addressNote = 'Địa chỉ có thể chưa đủ phường/quận';
      recs.push('Bổ sung tên phường, quận để bản đồ PostGIS định vị chuẩn xác');
    } else {
      score += 5;
      addressNote = 'Địa chỉ quá ngắn';
      recs.push('Cung cấp địa chỉ số nhà, tên đường chi tiết');
    }

    // 4. Image presence & quality (max 25 pts)
    let imagePass = false;
    let imageNote = '';
    if (imageUrl && imageUrl.startsWith('http')) {
      score += 25;
      imagePass = true;
      imageNote = 'Đã có ảnh thực tế (Cloudinary CDN)';
    } else {
      score += 5;
      imageNote = 'Chưa tải ảnh thực tế hoặc dùng ảnh mặc định';
      recs.push('Tải lên ít nhất 1 ảnh phòng chụp thực tế để tăng uy tín');
    }

    setQualityResult({
      score,
      titleCheck: { pass: titlePass, note: titleNote },
      priceAreaCheck: { pass: priceAreaPass, note: priceAreaNote },
      addressCheck: { pass: addressPass, note: addressNote },
      imageCheck: { pass: imagePass, note: imageNote },
      recommendations: recs
    });

    setEvaluating(false);
    setStep(4);
  };

  const handleFinalSubmit = async () => {
    await createListingWithApi({
      title: title || 'Căn hộ Studio hiện đại gần Đại học',
      description: 'Phòng trọ rộng rãi, thoáng mát, đầy đủ tiện nghi, an ninh 24/7.',
      price: parseFloat(price) || 4500000,
      area: parseFloat(area) || 25,
      utilities,
      roomType,
      address: address || '123 Nguyễn Đình Chiểu, Quận 3',
      imageUrls: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80']
    });

    alert('Đăng bài trọ thành công!');
    navigate('/landlord');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 bg-[#F5F7FA]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-h2 font-bold text-[#0F172A]">Tạo tin đăng phòng trọ</h1>
        <div className="flex gap-2">
          {[1,2,3,4].map(s => (
            <div key={s} className={`w-12 h-2.5 rounded-full transition-all ${step >= s ? 'bg-[#00153D]' : 'bg-[#E2E8F0]'}`} />
          ))}
        </div>
      </div>

      <Card className="p-8 bg-white rounded-[18px] shadow-clay-soft border-none">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-h3 font-bold text-[#0F172A] mb-4">Bước 1: Thông tin cơ bản</h2>
            <Input 
              label="Tên tin đăng" 
              placeholder="Ví dụ: Căn hộ Studio hiện đại gần Đại học" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Giá thuê hàng tháng (VND)" 
                type="number" 
                placeholder="4500000" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <Input 
                label="Diện tích (m²)" 
                type="number" 
                placeholder="25" 
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
            <Input 
              label="Địa chỉ chi tiết" 
              placeholder="Ví dụ: 123 Nguyễn Đình Chiểu, Q.3, TP.HCM" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div className="pt-4 flex justify-end">
              <Button onClick={() => setStep(2)}>Tiếp theo</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-h3 font-bold text-[#0F172A] mb-4">Bước 2: Hình ảnh Cloudinary</h2>
            
            <div className="border-2 border-dashed border-[#CBD5E1] rounded-[14px] p-8 text-center bg-[#F5F7FA] shadow-clay-inset hover:bg-white transition-all cursor-pointer relative">
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/bmp, image/heic, image/heif, image/*, .png, .jpg, .jpeg, .webp, .gif, .bmp, .heic, .heif"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
              />
              <div className="text-[#64748B] text-body mb-3">
                {uploadingImage ? 'Đang upload lên Cloudinary...' : 'Nhấp hoặc kéo thả hình ảnh thực tế vào đây'}
              </div>
              <Button variant="secondary" size="sm" disabled={uploadingImage}>
                {uploadingImage ? 'Đang xử lý...' : 'Chọn hình ảnh'}
              </Button>
            </div>

            {imageUrl && (
              <div className="mt-4 flex flex-col items-center">
                <p className="text-caption font-semibold text-[#16803C] mb-2 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#16803C]" />
                  <span>Ảnh đã upload Cloudinary:</span>
                </p>
                <img src={imageUrl} alt="Room preview" className="w-48 h-32 object-cover rounded-lg shadow-sm" />
              </div>
            )}

            <div className="pt-4 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Quay lại</Button>
              <Button onClick={() => setStep(3)}>Tiếp theo</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center py-8">
            <h2 className="text-h3 font-bold text-[#0F172A] mb-2">Bước 3: Đánh giá chất lượng tin đăng</h2>
            <p className="text-body text-[#64748B] mb-6 max-w-md mx-auto">
              Hệ thống kiểm tra tính hoàn thiện của tiêu đề, giá cả, địa chỉ và chất lượng ảnh trước khi đưa vào hàng đợi kiểm duyệt.
            </p>
            {evaluating ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-[#00153D] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#00153D] font-semibold text-body">Đang phân tích dữ liệu tin đăng...</p>
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
              <h3 className="text-sm font-bold text-[#0F172A]">Chi tiết tiêu chí kiểm tra:</h3>
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
                    <span className="font-semibold text-gray-800">Địa chỉ & PostGIS:</span>
                    <p className="text-xs text-gray-600 mt-0.5">{qualityResult.addressCheck.note}</p>
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
              <Button variant="ghost" onClick={() => setStep(3)}>Quay lại</Button>
              <Button onClick={handleFinalSubmit}>Gửi tin đăng (Kiểm duyệt hệ thống)</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
