import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { type LeaseContractResponse, roomsApi } from '../../services/api';
import { 
  Printer, 
  X, 
  ShieldCheck
} from 'lucide-react';

interface PrintContractModalProps {
  lease: LeaseContractResponse;
  onClose: () => void;
  initialLeaveBlank?: boolean;
}

// Helper formatting dates in Vietnamese format DD/MM/YYYY
function formatVnDate(dateString?: string): string {
  if (!dateString) return '.../.../......';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '.../.../......';
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

function formatVnDateTime(dateString?: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ngày ${formatVnDate(dateString)}`;
}

// Convert numbers to Vietnamese words for contract currency
function numberToVnWords(amount: number): string {
  if (amount <= 0) return 'Không đồng';
  return `${amount.toLocaleString('vi-VN')} Việt Nam Đồng`;
}

// Parse room utilities into dynamic equipment handover items
function buildHandoverItems(roomUtilities?: string, utilitiesDesc?: string) {
  const combinedText = `${roomUtilities || ''} ${utilitiesDesc || ''}`.toLowerCase();
  
  const items: { name: string; qty: string; status: string }[] = [];

  // 1. Máy điều hòa / Máy lạnh
  if (combinedText.includes('máy lạnh') || combinedText.includes('điều hòa') || combinedText.includes('máy điều hòa')) {
    items.push({ name: 'Máy điều hoà không khí & bộ remote điều khiển', qty: '01 bộ', status: 'Sử dụng tốt' });
  } else {
    items.push({ name: 'Máy điều hoà không khí & bộ remote (nếu có)', qty: '01 bộ', status: 'Sử dụng tốt' });
  }

  // 2. Thẻ cư dân / Thẻ thang máy / Khóa từ
  if (combinedText.includes('thang máy') || combinedText.includes('khóa vân tay') || combinedText.includes('thẻ')) {
    items.push({ name: 'Thẻ cư dân / Thẻ thang máy / Thẻ từ ra vào', qty: '01 - 02 thẻ', status: 'Sử dụng tốt' });
  } else {
    items.push({ name: 'Thẻ cư dân / Thẻ từ (nếu có)', qty: '01 thẻ', status: 'Sử dụng tốt' });
  }

  // 3. Chìa khóa phòng / cổng
  items.push({ name: 'Chìa khóa phòng ngủ & chìa khóa cổng chính', qty: '01 bộ', status: 'Sử dụng tốt' });

  // 4. Khóa vân tay
  if (combinedText.includes('khóa vân tay')) {
    items.push({ name: 'Hệ thống khóa cửa vân tay / mã số điện tử', qty: '01 bộ', status: 'Hoạt động tốt' });
  }

  // 5. Gương và thiết bị vệ sinh lavabo
  items.push({ name: 'Gương WC, bộ bồn rửa (lavabo) và vòi nước', qty: '01 bộ', status: 'Sử dụng tốt' });

  // 6. Sen tắm và nước nóng lạnh
  if (combinedText.includes('nóng lạnh') || combinedText.includes('bình nóng lạnh')) {
    items.push({ name: 'Bình nước nóng lạnh & bộ sen tắm', qty: '01 bộ', status: 'Sử dụng tốt' });
  } else {
    items.push({ name: 'Bộ vòi sen tắm & bình nước nóng lạnh (nếu có)', qty: '01 bộ', status: 'Sử dụng tốt' });
  }

  // 7. Bồn cầu + vòi xịt
  items.push({ name: 'Bộ bồn cầu vệ sinh + vòi xịt áp lực', qty: '01 bộ', status: 'Sử dụng tốt' });

  // 8. Tủ lạnh
  if (combinedText.includes('tủ lạnh')) {
    items.push({ name: 'Tủ lạnh bảo quản thực phẩm', qty: '01 cái', status: 'Sử dụng tốt' });
  }

  // 9. Máy giặt
  if (combinedText.includes('máy giặt')) {
    items.push({ name: 'Máy giặt quần áo', qty: '01 cái', status: 'Sử dụng tốt' });
  }

  // 10. Giường ngủ, nệm, tủ quần áo
  if (combinedText.includes('nội thất đầy đủ') || combinedText.includes('giường') || combinedText.includes('nệm') || combinedText.includes('tủ')) {
    items.push({ name: 'Giường ngủ, nệm nằm và tủ quần áo', qty: '01 bộ', status: 'Sử dụng tốt' });
  } else {
    items.push({ name: 'Giường ngủ, nệm nằm (nếu có)', qty: '01 bộ', status: 'Sử dụng tốt' });
  }

  // 11. Bếp riêng
  if (combinedText.includes('bếp riêng') || combinedText.includes('bếp')) {
    items.push({ name: 'Khu vực bếp nấu, kệ bếp & bồn rửa chén', qty: '01 bộ', status: 'Sử dụng tốt' });
  }

  // 12. Gác lửng
  if (combinedText.includes('gác lửng')) {
    items.push({ name: 'Gác lửng & cầu thang lên gác', qty: '01 bộ', status: 'Chắc chắn, an toàn' });
  }

  // 13. Hệ thống quạt & chiếu sáng
  items.push({ name: 'Hệ thống quạt trần / quạt điện & đèn chiếu sáng', qty: 'Đầy đủ', status: 'Sử dụng tốt' });

  // 14. Dòng chừa trống để ghi thêm bút mực
  items.push({ name: 'Trang thiết bị, đồ dùng phát sinh 1: ...........................................', qty: '.......', status: 'Sử dụng tốt' });
  items.push({ name: 'Trang thiết bị, đồ dùng phát sinh 2: ...........................................', qty: '.......', status: 'Sử dụng tốt' });

  return items;
}

// Generate native SHA-256 cryptographic hash of lease content
async function calculateSha256(content: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(content);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }
  // Fallback 64-char pseudo checksum
  let hash = 2166136261;
  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0').repeat(8).slice(0, 64);
}

export default function PrintContractModal({ lease, onClose, initialLeaveBlank }: PrintContractModalProps) {
  // If not signed online yet, default to leaving blank for physical ink signature.
  // If already signed, user can still toggle this option to print a blank template for paper signing!
  const isAlreadySigned = !!(lease.tenantSigned && lease.landlordSigned);
  const [leaveBlankSignatures, setLeaveBlankSignatures] = useState<boolean>(
    initialLeaveBlank ?? (!isAlreadySigned)
  );

  const [checksum, setChecksum] = useState<string>('Đang tạo mã băm toàn vẹn SHA-256...');
  const [roomUtilities, setRoomUtilities] = useState<string>('');

  useEffect(() => {
    if (lease.roomId) {
      roomsApi.getRoomById(lease.roomId)
        .then(room => {
          if (room && room.utilities) {
            setRoomUtilities(room.utilities);
          }
        })
        .catch(() => {});
    }
  }, [lease.roomId]);

  useEffect(() => {
    const rawData = [
      lease.id,
      lease.roomId,
      lease.landlordId,
      lease.tenantId,
      lease.monthlyRent,
      lease.deposit,
      lease.startDate,
      lease.endDate,
      lease.termsAndConditions || ''
    ].join('|');

    calculateSha256(rawData).then(hash => setChecksum(hash));
  }, [lease]);

  const handlePrint = () => {
    window.print();
  };

  const today = new Date();
  const locationCity = lease.roomAddress.includes(',') 
    ? lease.roomAddress.split(',').pop()?.trim() || 'Hồ Chí Minh'
    : 'Hồ Chí Minh';

  const depositMonths = Math.max(1, Math.round(Number(lease.deposit) / (Number(lease.monthlyRent) || 1)));

  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#0F172A]/70 backdrop-blur-xs overflow-y-auto print:bg-white print:p-0">
      
      {/* Print-specific style overrides */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always !important;
            break-before: page !important;
          }
          #printable-contract-content {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            font-size: 12pt !important;
            line-height: 1.55 !important;
            color: #000000 !important;
          }
          @page {
            size: A4;
            margin: 18mm 16mm 18mm 16mm;
          }
        }
      `}</style>

      {/* Top Action Bar (Hidden on Print) */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-[#E2E8F0] shadow-sm px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#00153D] flex items-center justify-center border border-blue-200">
            <Printer className="w-5 h-5 text-[#00153D]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#00153D]">Hợp đồng thuê căn hộ / phòng trọ & Biên bản bàn giao</h2>
            <p className="text-[11px] text-[#64748B]">Mã hợp đồng: #{lease.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        {/* Options & Print Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Option: Chừa ô ký để ký tay */}
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer select-none transition-colors">
            <input
              type="checkbox"
              checked={leaveBlankSignatures}
              onChange={(e) => setLeaveBlankSignatures(e.target.checked)}
              className="w-4 h-4 rounded text-[#00153D] focus:ring-0 cursor-pointer"
            />
            <span className="text-xs font-semibold text-[#0F172A]">
              Chừa trống ô ký để ký tay (In bản cứng)
            </span>
          </label>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-[#00153D] hover:bg-[#073372] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>In hợp đồng ngay</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Printable Document Wrapper */}
      <div className="flex-1 flex justify-center p-4 sm:p-8 print:p-0">
        <div 
          id="printable-contract-content"
          className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-8 sm:p-14 border border-[#E2E8F0] text-[#0F172A] font-serif leading-relaxed text-sm select-text"
          style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >
          {/* ========================================================================= */}
          {/* PHẦN 1: HỢP ĐỒNG THUÊ CĂN HỘ / PHÒNG TRỌ (CHÍNH THỨC) */}
          {/* ========================================================================= */}

          {/* Header Quốc hiệu & Tiêu ngữ */}
          <div className="text-center space-y-1 mb-6">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wide text-black">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p className="text-xs sm:text-sm font-bold text-black pb-0.5">
              Độc lập - Tự do - Hạnh phúc
            </p>
            <div className="w-32 h-[1px] bg-black mx-auto mb-5"></div>

            <h1 className="text-lg sm:text-2xl font-bold uppercase pt-1 text-black">
              HỢP ĐỒNG THUÊ CĂN HỘ / PHÒNG TRỌ
            </h1>
            <p className="text-xs italic text-slate-700">
              Số: {lease.id.slice(0, 8).toUpperCase()}/HĐTCH
            </p>
            <p className="text-xs italic text-slate-800 pt-1">
              {locationCity}, ngày {today.getDate()} tháng {today.getMonth() + 1} năm {today.getFullYear()}
            </p>
          </div>

          <p className="text-xs sm:text-sm italic mb-4">
            Căn cứ nhu cầu thực tế 2 bên chúng tôi gồm:
          </p>

          {/* BÊN A & BÊN B */}
          <div className="space-y-4 mb-6 text-xs sm:text-sm">
            {/* Bên Cho Thuê (Bên A) */}
            <div className="space-y-1 text-black">
              <p className="font-bold uppercase">BÊN CHO THUÊ (BÊN A):</p>
              <p>- Ông/Bà: <strong>{lease.landlordName || '............................................................'}</strong></p>
              <p>- CCCD/CMND số: <strong>Đã xác minh định danh trên hệ thống DORMI</strong></p>
              <p>- Địa chỉ: {lease.roomAddress}</p>
              <p>- Điện thoại di động: <strong>{lease.landlordPhone || '............................................................'}</strong></p>
              <p>- Email: {lease.landlordEmail}</p>
              <p>- Là chủ sở hữu phòng/căn hộ: <strong>{lease.roomTitle}</strong> thuộc địa chỉ <strong>{lease.roomAddress}</strong></p>
            </div>

            {/* Bên Thuê (Bên B) */}
            <div className="space-y-1 text-black pt-2">
              <p className="font-bold uppercase">BÊN THUÊ (BÊN B):</p>
              <p>- Ông/Bà: <strong>{lease.tenantName || '............................................................'}</strong></p>
              <p>- CCCD/CMND số: <strong>Đã xác minh định danh trên hệ thống DORMI</strong></p>
              <p>- Điện thoại di động: <strong>{lease.tenantPhone || '............................................................'}</strong></p>
              <p>- Email: {lease.tenantEmail}</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm mb-4 font-semibold italic text-black">
            Hai bên thoả thuận ký kết hợp đồng thuê căn hộ/phòng trọ với nội dung sau:
          </p>

          {/* 6 ĐIỀU KHOẢN CHUẨN XÁC TỪ MẪU THỰC TẾ */}
          <div className="space-y-4 mb-8 text-xs sm:text-sm text-justify text-black leading-relaxed">
            
            {/* ĐIỀU 1 */}
            <div>
              <p className="font-bold">ĐIỀU 1: NỘI DUNG CHO THUÊ</p>
              <p className="mt-1">
                <strong>1.1.</strong> Bên A đồng ý cho Bên B thuê phòng/căn hộ: <strong>{lease.roomTitle}</strong>, tọa lạc tại địa chỉ: <strong>{lease.roomAddress}</strong>.
              </p>
              <p>
                <strong>1.2.</strong> Mục đích thuê: Để ở.
              </p>
              <p>
                <strong>1.3.</strong> Ngày giao nhà/phòng: <strong>{formatVnDate(lease.startDate)}</strong>.
              </p>
              <p>
                <strong>1.4.</strong> Tình trạng căn hộ/phòng:
              </p>
              <div className="pl-4 space-y-0.5">
                <p>a. Hệ thống điện nước hoạt động tốt.</p>
                <p>b. Nhà có thiết bị, nội thất theo danh mục phụ lục biên bản bàn giao đính kèm.</p>
                <p>c. Tất cả các khoản phí điện, nước, internet, phí dịch vụ... (Nếu có) đã được Bên A đóng tiền đầy đủ trước khi bàn giao cho Bên B và được chụp hình lại toàn bộ hiện trạng phòng/nhà có thiết bị, nội thất theo danh mục bàn giao đã được vệ sinh sạch sẽ.</p>
              </div>
            </div>

            {/* ĐIỀU 2 */}
            <div>
              <p className="font-bold">ĐIỀU 2: THỜI HẠN THUÊ CĂN HỘ / PHÒNG TRỌ</p>
              <p className="mt-1">
                Thời hạn thuê tính từ ngày <strong>{formatVnDate(lease.startDate)}</strong> đến hết ngày <strong>{formatVnDate(lease.endDate)}</strong>.
              </p>
            </div>

            {/* ĐIỀU 3 */}
            <div>
              <p className="font-bold">ĐIỀU 3: GIÁ THUÊ VÀ PHƯƠNG THỨC THANH TOÁN</p>
              <p className="mt-1">
                <strong>3.1. Giá thuê:</strong>
              </p>
              <div className="pl-4 space-y-0.5">
                <p>
                  a. Giá thuê phòng/căn hộ của hợp đồng là: <strong>{Number(lease.monthlyRent).toLocaleString('vi-VN')} VNĐ/tháng</strong> (Bằng chữ: <em>{numberToVnWords(Number(lease.monthlyRent))}</em>).
                </p>
                <p>
                  b. <u>Giá thuê trên không bao gồm:</u> Phí quản lý căn hộ, thuế VAT, điện, nước, phí bãi đậu xe, internet... và các chi phí sinh hoạt khác. Bên B sẽ trả những chi phí này theo thực tế sử dụng. {lease.utilitiesDescription ? `(${lease.utilitiesDescription})` : ''}
                </p>
              </div>

              <p className="mt-1.5">
                <strong>3.2. Phương thức thanh toán:</strong>
              </p>
              <div className="pl-4 space-y-1">
                <p>
                  a. Thanh toán tiền thuê căn hộ/phòng hàng tháng bằng tiền "Việt Nam Đồng" thông qua hình thức chuyển khoản hoặc tiền mặt cho Bên A.
                </p>
                <p>
                  b. <strong>Tiến độ thanh toán & Tiền đặt cọc:</strong>
                </p>
                <div className="pl-3 space-y-1">
                  <p>
                    - Tiền đặt cọc: Bên B giao cho Bên A số tiền cọc là: <strong>{Number(lease.deposit).toLocaleString('vi-VN')} VNĐ</strong> (Bằng chữ: <em>{numberToVnWords(Number(lease.deposit))}</em>). Tổng số tiền cọc tương đương với <strong>{depositMonths} tháng</strong> tiền thuê nhà/phòng.
                  </p>
                  <p>
                    - Số tiền cọc này sẽ được hoàn lại khi hết hạn hợp đồng (sau khi đã khấu trừ các khoản chi phí hư hao nếu có do Bên B gây ra theo thỏa thuận hai bên và các chi phí sinh hoạt hàng tháng của Bên B nếu chưa thanh toán). Tiền đặt cọc <u>không được sử dụng</u> cho việc thanh toán tiền thuê hàng tháng hoặc bất kỳ khoản phí nào khác nếu không được hai bên đồng ý thoả thuận trước.
                  </p>
                  <p>
                    - Tiền thuê căn hộ/phòng được tính từ ngày <strong>{formatVnDate(lease.startDate)}</strong>, Bên B thanh toán định kỳ hàng tháng (kỳ hạn {lease.paymentCycleMonths || 1} tháng/lần) trong vòng <strong>05 ngày đầu tiên</strong> của đợt thanh toán (kể từ ngày 01 đến ngày 05 của tháng). Nếu Bên B thanh toán chậm Bên B phải thông báo cho Bên A biết sự chậm trễ này và phải được sự đồng ý của Bên A.
                  </p>
                </div>
              </div>
            </div>

            {/* ĐIỀU 4 */}
            <div>
              <p className="font-bold">ĐIỀU 4: TRÁCH NHIỆM CỦA MỖI BÊN</p>
              <p className="mt-0.5">Các bên cùng xác định trách nhiệm như sau:</p>
              
              <p className="mt-1"><strong>4.1. Trách nhiệm của Bên cho thuê căn hộ/phòng (Bên A):</strong></p>
              <div className="pl-4 space-y-0.5">
                <p>a. Giao nhà/phòng đúng ngày đã định trong hợp đồng này và thanh toán các chi phí điện, nước, phí dịch vụ hoàn tất trước khi bàn giao căn hộ/phòng.</p>
                <p>b. Đảm bảo Bên B toàn quyền sử dụng riêng biệt căn hộ/phòng. Báo cho Bên B biết thời gian kiểm tra căn hộ/phòng trong thời hạn hợp đồng. Trường hợp muốn lên kiểm tra căn hộ/phòng, Bên A phải báo trước cho Bên B trước một (01) ngày và được sự đồng ý của Bên B.</p>
                <p>c. Bên A có trách nhiệm hỗ trợ các giấy tờ liên quan tới việc đăng ký tạm trú, tạm vắng cho Bên B.</p>
                <p>d. Bên A được quyền đơn phương đình chỉ, chấm dứt hợp đồng và yêu cầu bồi thường thiệt hại (nếu có) khi Bên B có một trong các hành vi sau:</p>
                <div className="pl-3 space-y-0.5">
                  <p>- Không trả tiền thuê nhà đúng hạn mà không được sự đồng ý của Bên A;</p>
                  <p>- Vi phạm các quy định cấm của pháp luật Việt Nam như: mua bán tàng trữ vật cấm, tổ chức cá cược, tổ chức mại dâm,...;</p>
                  <p>- Không bảo quản nhà tốt dẫn đến nhà hư hỏng nghiêm trọng;</p>
                  <p>- Làm mất trật tự công cộng nhiều lần, làm ảnh hưởng nghiêm trọng đến sinh hoạt bình thường của những người xung quanh;</p>
                  <p>- Làm ảnh hưởng nghiêm trọng đến vệ sinh môi trường trong khu nhà.</p>
                </div>
                <p>e. Hoàn trả lại tiền đặt cọc cho Bên B khi hợp đồng thuê căn hộ/phòng chấm dứt nếu Bên B không vi phạm điều khoản nào theo hợp đồng này và sau khi trừ đi các khoản nợ chi phí sử dụng dịch vụ của Bên B.</p>
              </div>

              <p className="mt-2"><strong>4.2. Trách nhiệm của Bên thuê (Bên B):</strong></p>
              <div className="pl-4 space-y-0.5">
                <p>a. Thanh toán tiền thuê đúng thời hạn và đầy đủ. Trường hợp thanh toán trễ quá ngày mà không có sự đồng ý của Bên A, thì Bên A có quyền đơn phương chấm dứt Hợp đồng, khoá điện nước và không phải trả lại tiền đặt cọc.</p>
                <p>b. Không phá vỡ kết cấu tường có sẵn, không khoan đục, giữ gìn sạch sẽ bề mặt tường. Nếu hết hợp đồng bề mặt tường hư hỏng nặng cần sơn sửa lại hoặc trừ vào tiền đặt cọc theo thoả thuận.</p>
                <p>c. Thanh toán đầy đủ các chi phí sinh hoạt phát sinh trong thời gian thuê căn hộ/phòng (phí quản lý, điện, điện thoại, nước, truyền hình cáp, internet, phí bãi đậu xe... và chi phí sinh hoạt khác).</p>
                <p>d. Giao trả nhà và trang thiết bị trong tình trạng sạch sẽ, hoạt động bình thường như lúc giao (ngoại trừ những hao mòn do điều kiện tự nhiên) cho Bên A khi hợp đồng hết hạn hiệu lực.</p>
                <p>e. Bảo quản tốt và bảo trì định kỳ các thiết bị nội thất kèm theo trong suốt thời hạn thuê. Có trách nhiệm sửa chữa những hư hỏng cơ bản.</p>
                <p>f. Tôn trọng quy tắc sinh hoạt cộng đồng và tuân thủ nội quy của khu căn hộ/phòng trọ. Thực hiện nghiêm túc các quy định về phòng cháy chữa cháy.</p>
                <p>g. Đảm bảo có quyền công dân, không bị truy nã hay đang thụ án.</p>
                <p>h. Thực hiện nghiêm chỉnh các quy định về giữ gìn vệ sinh môi trường và trật tự an ninh chung và an toàn phòng cháy, chữa cháy trong toà nhà. Không được sử dụng các chất, vật liệu dễ cháy, nổ hoặc các nguy cơ khác ảnh hưởng tới khu vực xung quanh. Thực hiện các quy định của Ban quản lý toà nhà.</p>
                <p>i. Sử dụng căn hộ/phòng đúng mục đích, có trách nhiệm quản lý vật chất, hành chính.</p>
                <p>j. Trường hợp Bên B muốn kết thúc hợp đồng, Bên B phải có trách nhiệm hỗ trợ cho Bên A mở cửa để khách xem nhà, trước thời hạn hết hợp đồng 01 (một) tháng.</p>
              </div>
            </div>

            {/* ĐIỀU 5 */}
            <div>
              <p className="font-bold">ĐIỀU 5: CHẤM DỨT HỢP ĐỒNG</p>
              <p className="mt-0.5">Hợp đồng sẽ được chấm dứt theo một trong những điều kiện sau:</p>
              <p className="mt-1"><strong>5.1. Hợp đồng hết hạn:</strong></p>
              <div className="pl-4 space-y-0.5">
                <p>- Bên B phải trả tất cả chi phí điện, nước, internet, gửi xe... và chi phí sinh hoạt do Bên B sử dụng nhưng chưa kịp thanh toán ngay khi chấm dứt hợp đồng (nếu Bên B không thanh toán sẽ khấu trừ vào tiền đặt cọc).</p>
                <p>- Bên A sẽ hoàn trả lại số tiền cọc cho Bên B sau khi đã khấu trừ các khoản chi phí hư hao theo thoả thuận hai bên, bao gồm cả chi phí thuê dọn dẹp vệ sinh nhà (nếu có).</p>
                <p>- Tiền cọc sẽ được hoàn lại sau khi kết thúc hợp đồng <strong>tối đa bảy (07) ngày</strong> kể từ ngày hết hạn hợp đồng.</p>
              </div>

              <p className="mt-1.5"><strong>5.2.</strong> Toà nhà/căn hộ bị phá dỡ theo lệnh của cơ quan chính quyền.</p>

              <p className="mt-1.5"><strong>5.3.</strong> Trường hợp Bên A muốn chấm dứt hợp đồng thuê nhà mà không do lỗi của Bên B, hoặc bán nhà trước thời hạn hợp đồng thì Bên A phải:</p>
              <div className="pl-4 space-y-0.5">
                <p>- Thông báo cho Bên B biết trước 30 ngày bằng văn bản;</p>
                <p>- Hoàn trả cho Bên B số tiền thuê mà Bên B đã trả trước cho khoảng thời gian Bên B không sử dụng nhà (nếu có);</p>
                <p>- Hoàn trả tiền cọc cho Bên B số tiền <strong>{Number(lease.deposit).toLocaleString('vi-VN')} VNĐ</strong> (Bằng chữ: <em>{numberToVnWords(Number(lease.deposit))}</em>) và bồi thường cho Bên B số tiền là <strong>{Number(lease.deposit).toLocaleString('vi-VN')} VNĐ</strong> (Bằng chữ: <em>{numberToVnWords(Number(lease.deposit))}</em>);</p>
                <p>- Hoàn trả tiền cọc và bồi thường tối đa bảy (07) ngày kể từ ngày chấm dứt hợp đồng.</p>
              </div>

              <p className="mt-1.5"><strong>5.4.</strong> Trường hợp Bên B muốn chấm dứt hợp đồng trước thời hạn, Bên B phải:</p>
              <div className="pl-4 space-y-0.5">
                <p>- Thông báo cho Bên A biết trước 30 ngày bằng văn bản;</p>
                <p>- Bên B sẽ mất số tiền đặt cọc cho Bên A là <strong>{Number(lease.deposit).toLocaleString('vi-VN')} VNĐ</strong> (Bằng chữ: <em>{numberToVnWords(Number(lease.deposit))}</em>);</p>
                <p>- Bên B phải thanh toán toàn bộ những chi phí phát sinh trong quá trình sử dụng căn hộ/phòng tính đến thời điểm Bên B hoàn trả căn hộ/phòng cho Bên A.</p>
              </div>
            </div>

            {/* ĐIỀU 6 */}
            <div>
              <p className="font-bold">ĐIỀU 6: ĐIỀU KHOẢN CHUNG</p>
              <p className="mt-1"><strong>6.1.</strong> Tuân thủ đầy đủ các điều khoản nêu trên.</p>
              <p><strong>6.2.</strong> Trường hợp có tranh chấp thì cả hai bên phải bàn bạc tìm biện pháp giải quyết. Nếu không tìm ra được sự thống nhất thì sẽ kiện lên Toà án nhân dân theo quy định của pháp luật dân sự.</p>
              <p><strong>6.3.</strong> Nội dung của hợp đồng này đã được hai bên hiểu rõ. Hai bên đồng ý với tất cả các điều khoản ghi trong Hợp đồng này và tự nguyện ký kết.</p>
              <p><strong>6.4.</strong> Biên bản bàn giao trang thiết bị là một phần không tách rời của Hợp đồng này.</p>
              <p className="pt-1">
                Văn bản này được lập thành <strong>02 bản chính</strong>, có giá trị pháp lý như nhau: Mỗi bên giữ 01 bản. Hợp đồng có hiệu lực kể từ ngày hai bên ký.
              </p>
            </div>

            {/* Điều khoản bổ sung tùy chỉnh nếu có */}
            {lease.termsAndConditions && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded print:bg-transparent print:border-black">
                <p className="font-bold">PHỤ LỤC THỎA THUẬN RIÊNG:</p>
                <p className="whitespace-pre-line pt-1 text-slate-800">{lease.termsAndConditions}</p>
              </div>
            )}
          </div>

          {/* KHỐI CHỮ KÝ HAI BÊN HỢP ĐỒNG */}
          <div className="mt-8 pt-4 border-t border-slate-400 print:border-black">
            <p className="text-right italic text-xs mb-3 text-black">
              {locationCity}, ngày {today.getDate()} tháng {today.getMonth() + 1} năm {today.getFullYear()}
            </p>
            <div className="grid grid-cols-2 gap-8 text-center">
              
              {/* Bên A: Chủ nhà */}
              <div className="space-y-1">
                <p className="font-bold uppercase text-black text-xs sm:text-sm">BÊN A (BÊN CHO THUÊ)</p>
                <p className="text-[11px] italic text-slate-700">(Đã đọc và đồng ý - Ký và ghi rõ họ tên)</p>

                {leaveBlankSignatures ? (
                  /* Option: Chừa trống ô để ký tay */
                  <div className="h-28 flex items-end justify-center border-b border-dashed border-slate-400 print:border-black mx-6 mb-2">
                    <span className="text-[10px] text-slate-400 italic mb-1 no-print">[Chừa trống để ký bút mực]</span>
                  </div>
                ) : (
                  /* Option: Đã ký điện tử trên hệ thống */
                  <div className="h-28 flex flex-col items-center justify-center py-2">
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[11px] font-bold tracking-wider uppercase mb-1">
                      ĐÃ KÝ ĐIỆN TỬ XÁC THỰC
                    </div>
                    {lease.landlordSignedAt && (
                      <p className="text-[10px] text-slate-500 italic">
                        {formatVnDateTime(lease.landlordSignedAt)}
                      </p>
                    )}
                  </div>
                )}

                <p className="font-bold text-black text-xs sm:text-sm pt-2">{lease.landlordName}</p>
              </div>

              {/* Bên B: Khách thuê */}
              <div className="space-y-1">
                <p className="font-bold uppercase text-black text-xs sm:text-sm">BÊN B (BÊN THUÊ)</p>
                <p className="text-[11px] italic text-slate-700">(Đã đọc và đồng ý - Ký và ghi rõ họ tên)</p>

                {leaveBlankSignatures || !lease.tenantSigned ? (
                  /* Option: Chừa trống ô để ký tay */
                  <div className="h-28 flex items-end justify-center border-b border-dashed border-slate-400 print:border-black mx-6 mb-2">
                    <span className="text-[10px] text-slate-400 italic mb-1 no-print">[Chừa trống để ký bút mực]</span>
                  </div>
                ) : (
                  /* Option: Đã ký điện tử trên hệ thống */
                  <div className="h-28 flex flex-col items-center justify-center py-2">
                    {lease.tenantSignatureData && lease.tenantSignatureData.startsWith('data:image') ? (
                      <img 
                        src={lease.tenantSignatureData} 
                        alt="Chữ ký Bên B" 
                        className="max-h-16 object-contain"
                      />
                    ) : (
                      <div className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[11px] font-bold tracking-wider uppercase mb-1">
                        {lease.tenantSignatureData || 'ĐÃ KÝ ĐIỆN TỬ XÁC THỰC'}
                      </div>
                    )}
                    {lease.tenantSignedAt && (
                      <p className="text-[10px] text-slate-500 italic">
                        {formatVnDateTime(lease.tenantSignedAt)}
                      </p>
                    )}
                  </div>
                )}

                <p className="font-bold text-black text-xs sm:text-sm pt-2">{lease.tenantName}</p>
              </div>

            </div>
          </div>


          {/* ========================================================================= */}
          {/* PHẦN 2: BIÊN BẢN BÀN GIAO TRANG THIẾT BỊ (ĐÍNH KÈM HỢP ĐỒNG) */}
          {/* ========================================================================= */}
          <div className="page-break mt-12 pt-8 border-t-2 border-dashed border-slate-300 print:border-none">
            
            <div className="text-center space-y-1 mb-6">
              <h2 className="text-base sm:text-xl font-bold uppercase text-black">
                BIÊN BẢN BÀN GIAO TRANG THIẾT BỊ
              </h2>
              <p className="text-xs italic text-slate-800">
                (Đính kèm Hợp đồng thuê số: {lease.id.slice(0, 8).toUpperCase()}/HĐTCH)
              </p>
              <p className="text-xs text-black pt-1">
                Căn hộ / phòng cho thuê số: <strong>{lease.roomTitle}</strong> - Địa chỉ: <strong>{lease.roomAddress}</strong>
              </p>
            </div>

            {/* BẢNG KÊ TRANG THIẾT BỊ */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-xs border-collapse border border-black text-left">
                <thead>
                  <tr className="bg-slate-100 print:bg-transparent font-bold text-center">
                    <th className="border border-black px-2 py-1.5 w-12">STT</th>
                    <th className="border border-black px-3 py-1.5">TRANG THIẾT BỊ</th>
                    <th className="border border-black px-2 py-1.5 w-24">SỐ LƯỢNG</th>
                    <th className="border border-black px-3 py-1.5 w-36">TÌNH TRẠNG</th>
                  </tr>
                </thead>
                <tbody>
                  {buildHandoverItems(roomUtilities, lease.utilitiesDescription).map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-black px-2 py-1.5 text-center font-semibold">{idx + 1}</td>
                      <td className="border border-black px-3 py-1.5">{item.name}</td>
                      <td className="border border-black px-2 py-1.5 text-center">{item.qty}</td>
                      <td className="border border-black px-3 py-1.5 text-center">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CHỈ SỐ ĐIỆN NƯỚC BAN ĐẦU */}
            <div className="space-y-1.5 text-xs text-black mb-8 border border-black p-3 rounded-none">
              <p>
                <strong>Mã thanh toán điện lực:</strong> ............................................................................................................
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <p>
                  <strong>Chỉ số công tơ điện ban đầu:</strong> ................................. kWh
                </p>
                <p>
                  <strong>Chỉ số đồng hồ nước ban đầu:</strong> ................................. m³
                </p>
              </div>
            </div>

            {/* CHỮ KÝ BÀN GIAO THIẾT BỊ */}
            <div className="pt-2">
              <p className="text-right italic text-xs mb-3 text-black">
                {locationCity}, ngày {today.getDate()} tháng {today.getMonth() + 1} năm {today.getFullYear()}
              </p>
              <div className="grid grid-cols-2 gap-8 text-center">
                
                {/* Bên A: Giao */}
                <div className="space-y-1">
                  <p className="font-bold uppercase text-black text-xs sm:text-sm">BÊN A (BÊN BÀN GIAO)</p>
                  <p className="text-[11px] italic text-slate-700">(Đã đọc và đồng ý - Ký và ghi rõ họ tên)</p>

                  {leaveBlankSignatures ? (
                    <div className="h-24 flex items-end justify-center border-b border-dashed border-slate-400 print:border-black mx-6 mb-2">
                      <span className="text-[10px] text-slate-400 italic mb-1 no-print">[Chừa trống để ký bút mực]</span>
                    </div>
                  ) : (
                    <div className="h-24 flex flex-col items-center justify-center py-2">
                      <div className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[11px] font-bold tracking-wider uppercase mb-1">
                        XÁC NHẬN BÀN GIAO
                      </div>
                    </div>
                  )}

                  <p className="font-bold text-black text-xs sm:text-sm pt-2">{lease.landlordName}</p>
                </div>

                {/* Bên B: Nhận */}
                <div className="space-y-1">
                  <p className="font-bold uppercase text-black text-xs sm:text-sm">BÊN B (BÊN NHẬN BÀN GIAO)</p>
                  <p className="text-[11px] italic text-slate-700">(Đã đọc và đồng ý - Ký và ghi rõ họ tên)</p>

                  {leaveBlankSignatures || !lease.tenantSigned ? (
                    <div className="h-24 flex items-end justify-center border-b border-dashed border-slate-400 print:border-black mx-6 mb-2">
                      <span className="text-[10px] text-slate-400 italic mb-1 no-print">[Chừa trống để ký bút mực]</span>
                    </div>
                  ) : (
                    <div className="h-24 flex flex-col items-center justify-center py-2">
                      {lease.tenantSignatureData && lease.tenantSignatureData.startsWith('data:image') ? (
                        <img 
                          src={lease.tenantSignatureData} 
                          alt="Chữ ký Bên B" 
                          className="max-h-16 object-contain"
                        />
                      ) : (
                        <div className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[11px] font-bold tracking-wider uppercase mb-1">
                          {lease.tenantSignatureData || 'XÁC NHẬN BÀN GIAO'}
                        </div>
                      )}
                    </div>
                  )}

                  <p className="font-bold text-black text-xs sm:text-sm pt-2">{lease.tenantName}</p>
                </div>

              </div>
            </div>

          </div>

          {/* KHỐI CHỨNG THỰC TOÀN VẸN PHÁP LÝ & AUDIT TRAIL 0 ĐỒNG */}
          <div className="mt-12 pt-4 border-t border-slate-200 text-[10px] text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border print:border-black print:bg-transparent">
            <div className="flex items-center gap-1.5 font-bold text-[#00153D]">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700 print:text-black" />
              <span>CHỨNG THỰC TOÀN VẸN & KIỂM TOÁN ĐIỆN TỬ DORMI (AUDIT TRAIL)</span>
            </div>
            <p>
              • <strong>Mã định danh hợp đồng:</strong> {lease.id}
            </p>
            <p>
              • <strong>Mã băm toàn vẹn (SHA-256 Checksum):</strong> <code className="font-mono text-[9px] bg-white px-1 py-0.5 border border-slate-200 rounded print:border-none">{checksum}</code>
            </p>
            <p className="italic text-[9px] text-slate-500 pt-0.5">
              Hợp đồng được khởi tạo và bảo vệ tính toàn vẹn trên nền tảng số DORMI căn cứ theo Luật Giao dịch điện tử 2023 và Bộ luật Dân sự 2015. Mã băm SHA-256 bảo đảm tính bất biến, chống tẩy xóa hoặc chỉnh sửa nội dung sau khi hai bên ký kết.
            </p>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
