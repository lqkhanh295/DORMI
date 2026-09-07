__DESIGN SYSTEM__

__DORMI__

v2\.1 — Light Pastel Edition

*"Soft Daylight" — Giao diện sáng, dịu nhẹ, để nội dung được đọc thoải mái và lâu dài\.*

__Tóm tắt thay đổi so với v2\.0__

Chuyển từ dark canvas \+ neon accent sang light canvas \+ màu pastel; loại bỏ toàn bộ gradient mesh; bổ sung accessibility, semantic colors, type scale đầy đủ, spacing scale, và animation tokens phân theo ngữ cảnh sử dụng\.

Phiên bản: Beta  ·  Cập nhật: dựa trên phản hồi UX Audit v2\.0

# __0\. Vì sao có v2\.1__

Bản v2\.0 dùng nền tối \(dark canvas\), mesh gradient phát sáng và một màu accent duy nhất cho mọi trạng thái tương tác\. Theo yêu cầu của client, v2\.1 chuyển toàn bộ hệ thống sang giao diện sáng \(light mode\), dùng bảng màu pastel thay cho gradient, đồng thời khắc phục các lỗ hổng kỹ thuật đã phát hiện trong bản audit\.

__Các vấn đề đã được xử lý__

- __Contrast & Accessibility__ — không đạt chuẩn WCAG AA khi dùng accent trên nền tối cho text nhỏ\.
- __Gradient / Aura Glow__ — thay bằng palette pastel phẳng màu, không dùng blur mesh tốn hiệu năng\.
- __Thiếu Semantic Colors__ — bổ sung success / warning / error / info tách biệt khỏi màu accent chính\.
- __Type Scale không đầy đủ__ — mở rộng đầy đủ 8 bậc thay vì chỉ 3 \(Display/Body/Button\)\.
- __Spacing Scale thiếu__ — định nghĩa thang 4/8px đầy đủ thay vì chỉ nêu 'tối thiểu 20px'\.
- __Animation dùng chung 1 cấu hình__ — tách cấu hình spring riêng cho micro\-interaction, page\-transition, và modal\.
- __Thiếu Accessibility Motion__ — bổ sung rule prefers\-reduced\-motion và touch target tối thiểu 44px\.
- __Bo góc lồng nhau không nhất quán__ — công thức inner\-radius = outer\-radius − padding cho mọi phần tử lồng nhau\.

# __1\. Hệ thống Màu sắc \(Pastel · Light Mode\)__

Toàn bộ hệ thống dùng nền sáng, màu phẳng \(flat color\) — không có gradient hay mesh blur\. Độ sâu được tạo bằng shadow mềm, border mảnh và độ chênh sáng\-tối giữa các lớp bề mặt, thay vì ánh sáng phát quang như bản v2\.0\.

## __1\.1 Bề mặt & Nền \(Surface\)__

__Token__

__Hex__

__Sử dụng__

__Canvas__

\#FFFFFF

Nền gốc toàn trang\.

__Surface__

\#F7F7FA

Nền của card/section, phân lớp nhẹ so với canvas\.

__Surface Alt__

\#F1EFFB

Nền nhấn nhẹ cho card nổi bật \(thay cho aura\-glow cũ\)\.

__Border__

\#E4E2EE

Viền mảnh 1px cho card, input, divider\.

## __1\.2 Màu chữ \(Text\)__

__Token__

__Hex__

__Sử dụng__

__Text Primary__

\#1F2130

Tiêu đề, nội dung chính\. Contrast ≥ 12:1 trên canvas\.

__Text Secondary__

\#5B5D6E

Nội dung phụ, mô tả\. Contrast ≥ 7:1 trên canvas\.

__Text Muted__

\#8B8DA0

Placeholder, timestamp, caption\. Contrast ≥ 4\.5:1 \(đạt AA\)\.

## __1\.3 Màu nhấn chính \(Primary Accent\)__

__Token__

__Hex__

__Sử dụng__

__Primary__

\#7C9CFF

Nút chính, link, focus ring — trạng thái mặc định\.

__Primary Dark__

\#5B7FE0

Trạng thái hover/active của Primary, đảm bảo contrast khi hover trên nền sáng\.

__Primary Soft__

\#E7EDFF

Nền cho badge/callout liên quan tới hành động chính\.

*Ghi chú: đổi tên từ "Action Blue" \(v2\.0, thực chất là indigo\) sang "Primary" trung tính, tránh nhầm lẫn semantic giữa tên gọi và giá trị hex thực tế\.*

## __1\.4 Semantic Colors \(mới — khắc phục thiếu sót v2\.0\)__

v2\.0 chỉ có một màu accent duy nhất cho mọi tương tác, khiến không thể phân biệt trạng thái thành công/lỗi/cảnh báo\. v2\.1 bổ sung đầy đủ bộ semantic, giữ tông pastel nhất quán:

__Token__

__Hex__

__Sử dụng__

__Success__

\#8FD4B8

Trạng thái thành công, xác nhận hoàn tất\.

__Success Soft__

\#E6F7F0

Nền cho banner/badge success\.

__Warning__

\#F5C99B

Cảnh báo cần chú ý nhưng chưa nghiêm trọng\.

__Warning Soft__

\#FDF1E3

Nền cho banner/badge warning\.

__Error__

\#F0A7A0

Lỗi, hành động phá hủy \(destructive\)\.

__Error Soft__

\#FCEAE8

Nền cho banner/badge lỗi\.

## __1\.5 Pastel phụ trợ \(thay thế Aura Glow\)__

Ba màu pastel dưới đây thay thế hoàn toàn cho "Aura Glow" \(mesh gradient blur\-120px\) của bản v2\.0\. Chúng chỉ dùng làm nền phẳng cho card/badge/illustration — không bao giờ dùng làm gradient hoặc blur:

__Token__

__Hex__

__Sử dụng__

__Lilac__

\#D8CFFB

Card trang trí, icon background, illustration accent\.

__Mint__

\#C9EEE0

Card trang trí thứ cấp, badge trung tính tích cực\.

__Peach__

\#FBDCC7

Card trang trí thứ cấp, nhấn ấm cho nội dung nổi bật\.

__Quy tắc bắt buộc__

Không sử dụng linear\-gradient, radial\-gradient, hoặc backdrop\-filter: blur\(\) cho bất kỳ nền nào\. Mọi bề mặt là màu phẳng \(flat fill\)\. Độ sâu chỉ được tạo bằng box\-shadow mềm \(xem mục 3\.4\) và chênh lệch độ sáng giữa Canvas/Surface/Surface Alt\.

# __2\. Typography__

Font: Inter — áp dụng nhất quán cho toàn bộ hệ thống, không còn tham chiếu tới SF Pro\. Type scale mở rộng từ 3 bậc \(v2\.0\) lên 8 bậc để đủ dùng cho mọi ngữ cảnh nội dung\.

## __2\.1 Type Scale đầy đủ \(mới\)__

__Cấp bậc__

__Size / Weight__

__Letter\-spacing__

__Dùng cho__

Display

40px / 600

\-0\.02em

Hero heading, trang landing

H1

32px / 600

\-0\.015em

Tiêu đề trang

H2

24px / 600

\-0\.01em

Tiêu đề section

H3

20px / 600

0em

Tiêu đề card / sub\-section

Body Large

17px / 400

0em

Đoạn văn chính, mô tả dài

Body

15px / 400

0em

Nội dung mặc định, UI text

Caption

13px / 500

0\.01em

Label, timestamp, meta info

Overline

12px / 600

0\.06em

Eyebrow text, category tag \(uppercase\)

Line\-height: 1\.5 cho Body/Body Large \(đọc thoải mái trên nền sáng\); 1\.3 cho Display/H1/H2 \(tạo nhịp chặt cho tiêu đề\); 1\.4 cho Caption/Overline\.

## __2\.2 Vì sao letter\-spacing được điều chỉnh__

Bản v2\.0 dùng \-0\.04em cho Display — mức tracking âm này copy nguyên từ đặc tính font\-metrics của SF Pro, không phù hợp với Inter \(x\-height và cap\-height khác biệt\), dễ khiến các cặp ký tự như "T", "V", "W" dính vào nhau ở cỡ chữ lớn\. v2\.1 giảm xuống \-0\.02em cho Display và giảm dần theo cấp bậc nhỏ hơn, đã kiểm tra thực tế trên Inter\.

## __2\.3 Button Label__

Size 15px, weight 600, tracking 0\.02em — giữ nguyên tinh thần v2\.0 vì phù hợp cho UI text ngắn, không bị ảnh hưởng bởi vấn đề tracking ở cỡ lớn\.

# __3\. Hệ thống lưới & Hình khối__

## __3\.1 Spacing Scale \(mới — thay cho quy tắc mơ hồ "tối thiểu 20px"\)__

__Token__

__Giá trị__

__Dùng cho__

space\-1

4px

Khoảng cách icon–text sát nhau

space\-2

8px

Padding trong của badge, chip

space\-3

12px

Khoảng cách giữa các phần tử trong 1 nhóm nhỏ

space\-4

16px

Padding trong của button, input

space\-5

20px

Grid gap tối thiểu giữa các bento card

space\-6

24px

Padding trong của card cỡ vừa

space\-8

32px

Padding trong của card lớn / hero card

space\-10

40px

Khoảng cách giữa các section

## __3\.2 Bento Grid__

- __Nguyên tắc__ — dùng grid\-flow\-dense để tạo bố cục bất đối xứng, nhưng giới hạn trong bộ kích thước cố định — không yêu cầu tuyệt đối "không thẻ nào trùng size" vì khó duy trì khi nội dung động \(CMS/dữ liệu người dùng\)\.
- __Bộ size chuẩn__ — 1×1 \(ô cơ bản\), 1×2 \(dọc\), 2×1 \(ngang\), 2×2 \(hero\)\. Mọi bento card phải thuộc một trong 4 size này\.
- __Grid gap__ — space\-5 \(20px\) — áp dụng đồng nhất giữa mọi card, không có ngoại lệ\.

## __3\.3 Bo góc \(Rounding\) — kèm công thức lồng nhau \(mới\)__

__Token__

__Giá trị__

__Dùng cho__

rounded\-sm

12px

Input, chip nhỏ

rounded\-md

16px

Button \(không dùng pill\), badge vuông

rounded\-bento

24px

Thẻ bài \(Card\) — giảm từ 32px để cân bằng với light mode

rounded\-pill

9999px

Button chính, badge dạng pill

__Công thức bo góc lồng nhau \(bắt buộc\)__

inner\-radius = outer\-radius − padding\. Ví dụ: card rounded\-bento \(24px\) chứa ảnh với padding 8px → ảnh con phải có border\-radius = 16px để tâm cong hai lớp trùng nhau\. Đây là lỗi phổ biến bị bỏ sót ở bản v2\.0\.

## __3\.4 Shadow thay cho phát sáng viền \(Elevation\)__

Vì chuyển sang nền sáng, hiệu ứng "viền phát sáng" \(glowing border\) của v2\.0 không còn phù hợp — thay bằng hệ thống box\-shadow mềm, nhiều lớp, mô phỏng ánh sáng tự nhiên đổ từ trên xuống:

__Token__

__Box\-shadow \(CSS\)__

__Dùng cho__

shadow\-xs

0 1px 2px rgba\(31,33,48,0\.04\)

Input, chip

shadow\-sm

0 2px 8px rgba\(31,33,48,0\.06\)

Card mặc định

shadow\-md

0 8px 24px rgba\(31,33,48,0\.08\)

Card khi hover

shadow\-lg

0 16px 40px rgba\(31,33,48,0\.10\)

Modal, popover

# __4\. Animation & Physics \(Framer Motion\)__

v2\.0 dùng chung một cấu hình spring \(stiffness 300 / damping 30\) cho mọi loại chuyển động — điều này khiến chuyển động lớn \(page transition\) và chuyển động nhỏ \(hover\) cảm thấy sai nhịp\. v2\.1 tách 3 bộ cấu hình riêng theo ngữ cảnh\.

## __4\.1 Spring Physics theo ngữ cảnh \(mới\)__

__Loại chuyển động__

__Cấu hình spring__

__Ví dụ áp dụng__

Micro\-interaction

stiffness: 500, damping: 35

Hover card, nhấn button, toggle

Layout / Morph

stiffness: 300, damping: 30

layoutId morph giữa list ↔ detail

Page / Modal transition

stiffness: 220, damping: 26

Mở modal, chuyển route, drawer

## __4\.2 Morphing UI__

Giữ nguyên cách tiếp cận dùng layoutId để biến thẻ bài thành nội dung chi tiết\. Bổ sung yêu cầu: vẫn phải cập nhật URL thực \(qua React Router/Next\.js\) song song với animation, để đảm bảo back\-button, deep\-link và SEO hoạt động đúng — thay vì chuyển trạng thái thuần túy trong SPA không đổi URL\.

## __4\.3 Accessibility cho chuyển động \(mới — thiếu ở v2\.0\)__

__prefers\-reduced\-motion__

Bắt buộc bọc mọi animation trong kiểm tra media query prefers\-reduced\-motion\. Khi người dùng bật chế độ giảm chuyển động, thay animation bằng fade đơn giản \(150ms\) hoặc tắt hẳn animation, không được bỏ qua điều kiện này\.

## __4\.4 Interaction States__

- __Hover \(desktop\)__ — card nhô lên translate\-Y\(\-3px\), shadow chuyển từ shadow\-sm sang shadow\-md\. Không dùng hiệu ứng glow viền \(không còn phù hợp trên nền sáng\)\.
- __Active / Press \(touch\)__ — scale\(0\.98\) trong 100ms — thay thế cho hover trên thiết bị cảm ứng vì không có trạng thái hover thật\.
- __Focus \(bắt buộc\)__ — border 2px màu Primary \+ shadow\-sm màu Primary Soft, áp dụng cho mọi phần tử điều khiển bằng bàn phím\.

# __5\. Components Specs__

## __5\.1 Bento Hero Card__

- __Bo góc__ — rounded\-bento \(24px\)\.
- __Padding__ — space\-8 \(32px\)\.
- __Nền__ — Surface hoặc Surface Alt \(flat\), không dùng gradient\.
- __Độ sâu__ — shadow\-sm mặc định, chuyển shadow\-md khi hover\.

## __5\.2 Spatial Button__

- __Padding__ — 14px trên\-dưới, 28px trái\-phải\.
- __Bo góc__ — rounded\-pill \(9999px\)\.
- __Chiều cao tối thiểu__ — tối thiểu 44px \(đạt chuẩn Apple HIG/Material\) — bắt buộc dù padding text nhỏ hơn mức này\.
- __Hover__ — nền chuyển từ Primary sang Primary Dark, kèm shadow\-sm màu Primary Soft \(không dùng box\-shadow lan tỏa lớn như v2\.0 vì dễ gây layout shift\)\.

## __5\.3 Badges__

- __Hình thức__ — bo tròn 9999px, nền dùng Semantic Soft tương ứng \(Success Soft / Warning Soft / Error Soft / Primary Soft\), không dùng nền glass mờ\.
- __Điều kiện hiển thị \(làm rõ so với v2\.0\)__ — chỉ hiển thị khi trạng thái khác mặc định \(vd: status ≠ "normal"\) hoặc khi có priority > 0 — quy tắc rõ ràng thay vì mô tả chung chung "khi cần thiết"\.

## __5\.4 Touch Target & Input__

- __Touch target__ — mọi phần tử tương tác \(button, checkbox, tab\) tối thiểu 44×44px vùng chạm, kể cả khi kích thước hiển thị nhỏ hơn \(dùng padding vô hình để mở rộng vùng chạm\)\.
- __Input field__ — border 1px Border, nền Canvas, bo rounded\-sm \(12px\); khi focus chuyển border sang Primary 2px\.

# __6\. Accessibility Checklist \(mới — bổ sung toàn phần\)__

Mục này không tồn tại trong bản v2\.0\. Đây là checklist bắt buộc trước khi bàn giao bất kỳ màn hình nào\.

- __Contrast__ — Text Primary/Secondary trên Canvas đạt tối thiểu AA \(4\.5:1 cho text thường, 3:1 cho text lớn ≥24px\)\.
- __Touch Target__ — mọi phần tử tương tác có vùng chạm tối thiểu 44×44px\.
- __Motion__ — mọi animation tôn trọng prefers\-reduced\-motion\.
- __Focus Visible__ — mọi phần tử điều khiển bằng bàn phím có trạng thái focus rõ ràng \(không dựa vào màu sắc/hover only\)\.
- __Không phụ thuộc màu sắc__ — không dùng màu làm phương tiện truyền đạt duy nhất \(vd: badge lỗi phải có icon/text, không chỉ dựa vào màu đỏ pastel\)\.
- __Dark mode__ — Light mode là mặc định của hệ thống này theo yêu cầu client; khuyến nghị đánh giá riêng nếu cần hỗ trợ dark mode trong tương lai\.

__Kết luận__

DORMI v2\.1 giữ tinh thần bố cục Bento Grid và vật lý chuyển động mượt mà của bản gốc, nhưng thay thế toàn bộ ngôn ngữ thị giác dark/neon/gradient bằng một hệ thống sáng, pastel, phẳng màu — đồng thời vá các lỗ hổng về accessibility, semantic color, type scale và spacing đã phát hiện trong bản audit v2\.0\.

