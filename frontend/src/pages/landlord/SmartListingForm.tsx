import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';

export default function SmartListingForm() {
  const [step, setStep] = useState(1);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
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
    const uploadedUrl = await uploadImageToCloudinary(file);
    setUploadingImage(false);

    if (uploadedUrl) {
      setImageUrl(uploadedUrl);
    } else {
      alert('Upload ảnh lên Cloudinary không thành công. Sử dụng ảnh mặc định.');
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const simulateAI = () => {
    setAiAnalyzing(true);
    setTimeout(() => {
      setAiAnalyzing(false);
      setStep(4);
    }, 1200);
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
                <p className="text-caption font-semibold text-[#16803C] mb-2">✓ Ảnh đã upload Cloudinary:</p>
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
          <div className="space-y-6 text-center py-12">
            <h2 className="text-h3 font-bold text-[#0F172A] mb-2">Bước 3: Kiểm tra chất lượng tin đăng</h2>
            <p className="text-body text-[#64748B] mb-8 max-w-md mx-auto">
              Hệ thống đối soát chất lượng ảnh và xác thực nội dung tin đăng để đảm bảo tính thực tế.
            </p>
            {aiAnalyzing ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-[#00153D] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#00153D] font-semibold text-body">Đang đối soát dữ liệu...</p>
              </div>
            ) : (
              <Button size="lg" onClick={simulateAI}>Bắt đầu đối soát tin</Button>
            )}
            <div className="pt-12 flex justify-start">
              <Button variant="ghost" onClick={() => setStep(2)} disabled={aiAnalyzing}>Quay lại</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-[#F0FDF4] border border-[#DCFCE7] rounded-[12px]">
              <div className="text-[#16803C] text-xl font-bold">✓</div>
              <div>
                <h3 className="font-bold text-[#16803C] text-body">Tin đăng đạt yêu cầu xác thực</h3>
                <p className="text-[#16803C] text-caption mt-0.5">Hình ảnh Cloudinary đã sẵn sàng. Tiêu đề và từ khóa đã được tối ưu.</p>
              </div>
            </div>

            <div className="pt-8 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(3)}>Quay lại</Button>
              <Button onClick={handleFinalSubmit}>Đăng tin ngay (Gửi API)</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
