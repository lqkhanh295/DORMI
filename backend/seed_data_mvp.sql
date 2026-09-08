--
-- PostgreSQL database dump
--

\restrict 85fPuW6fBawAr2SeBdPIfQirAincIu7DrhHUfHeFJ4w9hyKPpDfDPpffuvEiBdY

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Users" VALUES ('a0000000-0000-0000-0000-000000000001', 'admin@dormi.vn', 'AQAAAAIAAYagAAAAEADDxghCJJPHdERwinZp6WeYQiQlYMIvGAs8IS1jG8M1QZR+pGbCxykDhify8gf3/Q==', 'Quản trị viên Dormi', '0900000001', NULL, 2, true, NULL, NULL, '2026-08-25 00:12:15.179769+07', false);
INSERT INTO public."Users" VALUES ('b0000000-0000-0000-0000-000000000001', 'landlord@dormi.vn', 'AQAAAAIAAYagAAAAEPsszQdlvhGxq1VnB/B8k0PpxuWqm+l30kWamxtGz4as6Yy4LlUe9b0oRehW7BVYPA==', 'Trần Minh Tuấn', '0901111001', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 1, true, NULL, NULL, '2026-08-29 00:12:15.179769+07', false);
INSERT INTO public."Users" VALUES ('b0000000-0000-0000-0000-000000000002', 'landlord2@dormi.vn', 'AQAAAAIAAYagAAAAEHTuVqWdp28Xyd/hBeBhZlu5uJFH/tP9bkEU9HqJqal956CBFv10G/ET7OU9GB3qXw==', 'Nguyễn Thị Hồng', '0901111002', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', 1, true, NULL, NULL, '2026-08-31 00:12:15.179769+07', false);
INSERT INTO public."Users" VALUES ('b0000000-0000-0000-0000-000000000003', 'landlord3@dormi.vn', 'AQAAAAIAAYagAAAAEMMW+3VN+8D2pj3BKPH6gwkmvqcq6774TbxeJpaU2ScQOC6Ly+KZQDoHAQSBGoNWXg==', 'Phạm Văn Đức', '0901111003', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', 1, true, NULL, NULL, '2026-07-22 00:12:15.179769+07', false);
INSERT INTO public."Users" VALUES ('b0000000-0000-0000-0000-000000000004', 'landlord4@dormi.vn', 'AQAAAAIAAYagAAAAEDz/tFkaWM7SSupHAg65INC18NuXtDWaRiAUlzfjU0OcAz/RsBHMJvNOs+iJmJpeaw==', 'Lê Thị Mai', '0901111004', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80', 1, false, NULL, NULL, '2026-07-22 00:12:15.179769+07', false);
INSERT INTO public."Users" VALUES ('b0000000-0000-0000-0000-000000000005', 'landlord5@dormi.vn', 'AQAAAAIAAYagAAAAEHYW5N9t0N8isvo8Rk5Mvw3VFxc6+K0WLxO4Jz2rv8Ia6Jug4fQWz63sys4kU/qXZA==', 'Võ Hoàng Nam', '0901111005', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80', 1, true, NULL, NULL, '2026-07-24 00:12:15.179769+07', false);
INSERT INTO public."Users" VALUES ('c0000000-0000-0000-0000-000000000001', 'tenant@dormi.vn', 'AQAAAAIAAYagAAAAEAy5LbRcd/NBqDRnstAT1SzJVe1AgwNypAeKoPXISjuePFgJzeCTPhJj0dakW4JOOg==', 'Nguyễn Văn An', '0902222001', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80', 0, false, 'Phòng yên tĩnh, gần trường', 'Yên tĩnh, Không hút thuốc, Dậy sớm', '2026-07-24 00:12:15.179769+07', true);
INSERT INTO public."Users" VALUES ('c0000000-0000-0000-0000-000000000002', 'customer2@dormi.vn', 'AQAAAAIAAYagAAAAELjkvWoQE6AxQ/1XNE+VToNltepBcIYNgZTX2gEAJQIdWycKTI5Sq/o6DsWmKi2X6A==', 'Trần Thị Bích', '0902222002', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 0, false, 'Phòng sạch sẽ, có bếp', 'Sạch sẽ, Nấu ăn, Yêu thú cưng', '2026-07-23 00:12:15.179769+07', true);
INSERT INTO public."Users" VALUES ('c0000000-0000-0000-0000-000000000003', 'customer3@dormi.vn', 'AQAAAAIAAYagAAAAECm3m2He8u3iQPgElodGVKMxXhzmqHHwX8GBWRV9Jrm7zGjwEpPMkKNW/RURYgoQIQ==', 'Lê Hoàng Minh', '0902222003', 'https://images.unsplash.com/photo-1599566150163-29194dcabd9c?auto=format&fit=crop&w=200&q=80', 0, false, 'Phòng rộng, giờ tự do', 'Cú đêm, Chơi game, Thoải mái', '2026-06-25 00:12:15.179769+07', true);
INSERT INTO public."Users" VALUES ('c0000000-0000-0000-0000-000000000004', 'customer4@dormi.vn', 'AQAAAAIAAYagAAAAEOHN1N9NE1UZgDKqtnZxbDQVqxqNDhMV03DnKnIFQkBnwvW6g9z79hgcz7+jEPpQ8w==', 'Phạm Thị Dung', '0902222004', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', 0, false, 'Gần công ty, an ninh', 'Dậy sớm, Tập gym, Không hút thuốc', '2026-07-10 00:12:15.179769+07', true);
INSERT INTO public."Users" VALUES ('c0000000-0000-0000-0000-000000000005', 'customer5@dormi.vn', 'AQAAAAIAAYagAAAAEKTB/fiQo7sFW5watucWWd6G/j9yeo+eV706scjSLi8guhE4HkTUKuoi1RkHzqcVbw==', 'Hoàng Văn Em', '0902222005', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', 0, false, 'Giá rẻ, có wifi', 'Sinh viên, Yên tĩnh, Sạch sẽ', '2026-07-26 00:12:15.179769+07', true);
INSERT INTO public."Users" VALUES ('c0000000-0000-0000-0000-000000000006', 'customer6@dormi.vn', 'AQAAAAIAAYagAAAAEJjRHydDGhXTVVWvIrmBAzAMXzUOW9CWcd2moYiUIylLR1kPyBB5TnYhUd0deQEFsg==', 'Đặng Thị Phương', '0902222006', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80', 0, false, 'Phòng riêng, yên tĩnh', 'Đọc sách, Yên tĩnh, Dậy sớm', '2026-07-16 00:12:15.179769+07', true);
INSERT INTO public."Users" VALUES ('c0000000-0000-0000-0000-000000000007', 'customer7@dormi.vn', 'AQAAAAIAAYagAAAAEBy/+jt1o6YT7NnzSG2NG+GD4/gyscnwwMwv/TczZJNTaY6eK+jePJ6m7sWWHD+mXQ==', 'Vũ Đức Giang', '0902222007', 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=200&q=80', 0, false, 'Studio, nội thất đầy đủ', 'Freelancer, Cú đêm, Nghe nhạc', '2026-07-16 00:12:15.179769+07', false);
INSERT INTO public."Users" VALUES ('c0000000-0000-0000-0000-000000000008', 'customer8@dormi.vn', 'AQAAAAIAAYagAAAAEHqaEbxwiqHaW7NABBHbXcae7UubeVdmAYaMYmf1IqcHywrhfJmD0xYOqxDFIQu01A==', 'Bùi Thị Hạnh', '0902222008', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80', 0, false, 'Gần chợ, thuận tiện', 'Nấu ăn, Sạch sẽ, Thân thiện', '2026-07-26 00:12:15.179769+07', true);
INSERT INTO public."Users" VALUES ('c0000000-0000-0000-0000-000000000009', 'customer9@dormi.vn', 'AQAAAAIAAYagAAAAEDiGVGvk+RUPzMEUjFF6ZAvcyMH8eFzYj3nV/hyQ0ASWjrpF26CpOKCD9d7vNoukJA==', 'Ngô Quang Ích', '0902222009', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80', 0, false, 'Phòng máy lạnh', 'Đi làm, Gọn gàng, Không hút thuốc', '2026-07-15 00:12:15.179769+07', false);
INSERT INTO public."Users" VALUES ('c0000000-0000-0000-0000-000000000010', 'customer10@dormi.vn', 'AQAAAAIAAYagAAAAEFdQ6JG8syxBlcjGIeGNZ34iRHutTD1k5z02HSegE3t65LcNRGl0AU3q4niPo09kWw==', 'Mai Thị Kim', '0902222010', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80', 0, false, 'An ninh, có thang máy', 'Sinh viên, Yên tĩnh, Không thú cưng', '2026-09-05 00:12:15.179769+07', true);
INSERT INTO public."Users" VALUES ('c0000000-0000-0000-0000-000000000011', 'customer11@dormi.vn', 'AQAAAAIAAYagAAAAEGqcGJ6uregZ8O3zrHWJ88DyVlZKHfeLvjUjeuSQ0SfFYoFrDL0euLJ2ygCtxGU6Iw==', 'Trương Văn Long', '0902222011', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80', 0, false, 'Phòng rẻ, ở ghép', 'Sinh viên, Chơi thể thao, Hòa đồng', '2026-06-14 00:12:15.179769+07', true);
INSERT INTO public."Users" VALUES ('c0000000-0000-0000-0000-000000000012', 'customer12@dormi.vn', 'AQAAAAIAAYagAAAAEHGEw6SuatTOmXjYWdBvNg0IB0Ughv49c7uF6vAvsP4mLNgCePijJGRCzQyyNAZm6g==', 'Lý Thị Mỹ', '0902222012', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80', 0, false, 'Gần trung tâm', 'Đi làm, Gọn gàng, Thích nấu ăn', '2026-07-01 00:12:15.179769+07', false);
INSERT INTO public."Users" VALUES ('c0000000-0000-0000-0000-000000000013', 'customer13@dormi.vn', 'AQAAAAIAAYagAAAAENOKXCTFWW2JgWrx40bMSNdiEF6sEb2STRwhdPO507pOkwqBgD0TlrnvefMYLnVrog==', 'Cao Hoàng Nam', '0902222013', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80', 0, false, 'Phòng studio hiện đại', 'Designer, Cú đêm, Sáng tạo', '2026-08-16 00:12:15.179769+07', true);
INSERT INTO public."Users" VALUES ('c0000000-0000-0000-0000-000000000014', 'customer14@dormi.vn', 'AQAAAAIAAYagAAAAELR6zprmE1K5fXHdj4NqX6AaP71w0xenTbAR8THqZfeQCg+/Kzbs7leL1Cv/hOm7WA==', 'Đinh Thị Oanh', '0902222014', 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=200&q=80', 0, false, 'Phòng sạch, an ninh', 'Y tá, Dậy sớm, Gọn gàng', '2026-07-26 00:12:15.179769+07', false);


--
-- Data for Name: Rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Rooms" VALUES ('084003fb-25f5-432b-be53-303e1e5202fb', 'b0000000-0000-0000-0000-000000000004', 'Căn Hộ Mini Gò Vấp Giá Tốt', 'Căn hộ mini có gác lửng, khu dân cư yên tĩnh. Gần Emart, Lotte Mart.', 4000000, 28, 'Wifi, Máy lạnh, Tủ lạnh, Bếp riêng', 'Căn hộ mini', '67 Quang Trung, Gò Vấp, TP.HCM', NULL, 2, '2026-08-17 00:12:15.179769+07');
INSERT INTO public."Rooms" VALUES ('0b1962cc-8650-4ee0-aa51-f1d5f71cbb72', 'b0000000-0000-0000-0000-000000000001', 'Căn Hộ Mini Trung Tâm Q.1', 'Căn hộ mini đầy đủ tiện nghi ngay trung tâm Quận 1. Gần Bến Thành, Phố đi bộ.', 6800000, 30, 'Wifi, Máy lạnh, Tủ lạnh, Bếp riêng, Thang máy, Bảo vệ 24/7', 'Căn hộ mini', '15 Lê Lợi, Q.1, TP.HCM', NULL, 0, '2026-07-26 00:12:15.179769+07');
INSERT INTO public."Rooms" VALUES ('18bdccf2-3119-4f6f-8a2f-7047d2dc0414', 'b0000000-0000-0000-0000-000000000003', 'Nhà Nguyên Căn 3PN Thủ Đức', 'Nhà nguyên căn 3 phòng ngủ, sân rộng, phù hợp nhóm bạn hoặc gia đình nhỏ.', 15000000, 120, 'Wifi, Máy lạnh, Tủ lạnh, Máy giặt, Bếp riêng, Sân vườn, Bãi giữ xe', 'Nhà nguyên căn', '25 Đường số 9, Hiệp Bình Phước, TP.Thủ Đức', NULL, 0, '2026-08-19 00:12:15.179769+07');
INSERT INTO public."Rooms" VALUES ('19d8080d-3dd1-4982-82b0-8fc375ec90ca', 'b0000000-0000-0000-0000-000000000001', 'Phòng Cho Thuê Giá Sinh Viên Q.3', 'Phòng trọ giá rẻ dành cho sinh viên, gần ĐH Kinh tế. Có gác lửng, toilet riêng.', 2800000, 18, 'Wifi, Quạt trần, Giờ giấc tự do', 'Phòng trọ', '290 Nam Kỳ Khởi Nghĩa, Q.3, TP.HCM', NULL, 2, '2026-07-13 00:12:15.179769+07');
INSERT INTO public."Rooms" VALUES ('3487b084-b369-4417-b8a9-2e76db42aac2', 'b0000000-0000-0000-0000-000000000002', 'Phòng Đẹp Khu Vực An Ninh Q.7', 'Phòng trọ cao cấp trong khu dân cư an ninh. Có camera, bảo vệ, gần siêu thị.', 4500000, 30, 'Wifi, Máy lạnh, Bảo vệ 24/7, Bãi giữ xe, Nội thất đầy đủ', 'Phòng trọ', '78 Huỳnh Tấn Phát, Q.7, TP.HCM', NULL, 1, '2026-09-06 00:12:15.179769+07');
INSERT INTO public."Rooms" VALUES ('3f17e5b5-08e6-43f7-9b7f-323da27b392e', 'b0000000-0000-0000-0000-000000000003', 'Căn Hộ Studio Vinhomes Grand Park', 'Studio đầy đủ nội thất trong Vinhomes Grand Park. Hồ bơi, gym, công viên 36ha.', 7000000, 35, 'Wifi, Máy lạnh, Tủ lạnh, Máy giặt, Hồ bơi, Gym, Thang máy', 'Studio', 'Vinhomes Grand Park, TP.Thủ Đức', NULL, 0, '2026-08-08 00:12:15.179769+07');
INSERT INTO public."Rooms" VALUES ('46ff4c27-dbb5-4008-a9d7-456311a724cf', 'b0000000-0000-0000-0000-000000000004', 'Phòng Cho Thuê Ngắn Hạn Bình Thạnh', 'Cho thuê ngắn hạn từ 1 tháng. Full nội thất, dọn vào ở ngay.', 5000000, 25, 'Wifi, Máy lạnh, Tủ lạnh, Nội thất đầy đủ, Bảo vệ 24/7', 'Phòng trọ', '210 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM', NULL, 3, '2026-09-01 00:12:15.179769+07');
INSERT INTO public."Rooms" VALUES ('4adad10c-da25-4193-8f97-2e81837e86ba', 'b0000000-0000-0000-0000-000000000002', 'Studio Hiện Đại Quận 4', 'Studio mới xây 100%, view Landmark 81. Nội thất Bắc Âu tối giản, phù hợp người trẻ.', 5500000, 28, 'Wifi, Máy lạnh, Tủ lạnh, Máy giặt, Thang máy', 'Studio', '12 Bến Vân Đồn, Q.4, TP.HCM', NULL, 0, '2026-08-23 00:12:15.179769+07');
INSERT INTO public."Rooms" VALUES ('658e449a-d375-4133-9c5b-7435997eeb75', 'b0000000-0000-0000-0000-000000000003', 'Phòng Trọ Gần ĐH FPT Thủ Đức', 'Phòng mới, sạch sẽ, gần ĐH FPT và khu công nghệ cao. Phù hợp sinh viên IT.', 3200000, 20, 'Wifi tốc độ cao, Máy lạnh, Giờ giấc tự do, Bãi giữ xe', 'Phòng trọ', 'Lô E2 Khu CNC, TP.Thủ Đức', NULL, 0, '2026-09-05 00:12:15.179769+07');
INSERT INTO public."Rooms" VALUES ('87793f0e-72d5-4d04-93bf-e2aa4623b375', 'b0000000-0000-0000-0000-000000000005', 'Phòng Trọ Giá Sinh Viên Tân Bình', 'Phòng nhỏ giá rẻ cho sinh viên, gần ĐH Bách Khoa. Có gác xép.', 2200000, 14, 'Wifi, Quạt trần, Giờ giấc tự do', 'Phòng trọ', '132 Hoàng Hoa Thám, Tân Bình, TP.HCM', NULL, 0, '2026-07-12 00:12:15.179769+07');
INSERT INTO public."Rooms" VALUES ('919e98da-c2cb-40c2-88ce-25b1d652c871', 'b0000000-0000-0000-0000-000000000004', 'Studio Penthouse Gò Vấp', 'Phòng tầng thượng có sân thượng riêng, view thành phố. Phù hợp freelancer.', 6000000, 35, 'Wifi, Máy lạnh, Tủ lạnh, Máy giặt, Sân thượng riêng', 'Studio', '300 Nguyễn Oanh, Gò Vấp, TP.HCM', NULL, 0, '2026-07-13 00:12:15.179769+07');
INSERT INTO public."Rooms" VALUES ('9492ce69-f612-4b18-8bfd-6023a2fbe2c1', 'b0000000-0000-0000-0000-000000000005', 'Phòng Trọ Gần Sân Bay Tân Bình', 'Phòng sạch sẽ cách sân bay 1km. Thuận tiện cho tiếp viên, phi công.', 3800000, 24, 'Wifi, Máy lạnh, Giờ giấc tự do, Bãi giữ xe', 'Phòng trọ', '55 Cộng Hòa, Tân Bình, TP.HCM', NULL, 0, '2026-08-17 00:12:15.179769+07');
INSERT INTO public."Rooms" VALUES ('bbc572d0-6240-4a1c-b06b-b310a2d760be', 'b0000000-0000-0000-0000-000000000001', 'Studio Cao Cấp View Sông Sài Gòn', 'Căn hộ studio hiện đại tầng 18, view trực diện sông Sài Gòn. Full nội thất nhập khẩu, bếp từ, máy giặt riêng.', 8500000, 40, 'Wifi, Máy lạnh, Tủ lạnh, Máy giặt, Ban công, Thang máy, Bảo vệ 24/7', 'Studio', '88 Nguyễn Huệ, Q.1, TP.HCM', NULL, 0, '2026-08-29 00:12:15.179769+07');
INSERT INTO public."Rooms" VALUES ('d0ab49dd-8022-4e8d-a4d8-3aef835eb465', 'b0000000-0000-0000-0000-000000000002', 'Căn Hộ Phú Mỹ Hưng Full Nội Thất', 'Căn hộ 2 phòng ngủ khu Phú Mỹ Hưng, an ninh tuyệt đối. Hồ bơi, gym, công viên.', 12000000, 70, 'Wifi, Máy lạnh, Tủ lạnh, Máy giặt, Ban công, Hồ bơi, Gym, Bảo vệ 24/7', 'Căn hộ', '101 Nguyễn Lương Bằng, Q.7, TP.HCM', NULL, 0, '2026-09-05 00:12:15.179769+07');
INSERT INTO public."Rooms" VALUES ('d636025d-cc42-4e7f-b534-76c7b860339d', 'b0000000-0000-0000-0000-000000000005', 'Căn Hộ 2PN Tân Phú Mới 100%', 'Căn hộ 2 phòng ngủ mới bàn giao, chưa qua sử dụng. Khu Celadon City.', 9500000, 65, 'Wifi, Máy lạnh, Tủ lạnh, Máy giặt, Ban công, Hồ bơi, Gym, Thang máy', 'Căn hộ', 'Celadon City, Tân Phú, TP.HCM', NULL, 0, '2026-08-06 00:12:15.179769+07');
INSERT INTO public."Rooms" VALUES ('e4464bda-300f-4626-8dc3-a55f7afb1e15', 'b0000000-0000-0000-0000-000000000005', 'Officetel Tân Bình Đa Năng', 'Officetel vừa ở vừa làm việc, khu K300. Phù hợp startup, freelancer.', 7500000, 45, 'Wifi tốc độ cao, Máy lạnh, Tủ lạnh, Bàn làm việc, Thang máy, Bảo vệ 24/7', 'Officetel', 'K300, Tân Bình, TP.HCM', NULL, 0, '2026-08-06 00:12:15.179769+07');
INSERT INTO public."Rooms" VALUES ('e45a6b3f-ea50-4433-8666-b6232e116c0b', 'b0000000-0000-0000-0000-000000000001', 'Phòng Trọ Sạch Sẽ Quận 3', 'Phòng mới xây, sơn trắng thoáng mát, gần chợ Tân Định. Giờ giấc tự do, không chung chủ.', 4200000, 22, 'Wifi, Máy lạnh, Giờ giấc tự do, Không chung chủ', 'Phòng trọ', '56 Hai Bà Trưng, Q.3, TP.HCM', NULL, 0, '2026-07-28 00:12:15.179769+07');
INSERT INTO public."Rooms" VALUES ('e48238a4-831b-4236-8760-6f49fe0dd540', 'b0000000-0000-0000-0000-000000000004', 'Phòng Trọ Bình Thạnh Gần Hàng Xanh', 'Phòng mới sơn, toilet riêng, gần ngã tư Hàng Xanh. Đi Q.1 chỉ 10 phút.', 3500000, 22, 'Wifi, Máy lạnh, Giờ giấc tự do', 'Phòng trọ', '112 Điện Biên Phủ, Bình Thạnh, TP.HCM', NULL, 2, '2026-08-20 00:12:15.179769+07');
INSERT INTO public."Rooms" VALUES ('e86fd319-5059-485e-b382-f9384493c102', 'b0000000-0000-0000-0000-000000000002', 'Phòng Trọ Gần RMIT Quận 7', 'Phòng trọ thoáng mát gần RMIT, SC VivoCity. Khu an ninh, yên tĩnh. Phù hợp sinh viên.', 3800000, 25, 'Wifi, Máy lạnh, Giờ giấc tự do, Bãi giữ xe', 'Phòng trọ', '45 Nguyễn Văn Linh, Q.7, TP.HCM', NULL, 0, '2026-08-31 00:12:15.179769+07');
INSERT INTO public."Rooms" VALUES ('f46a71eb-174b-4e9c-8204-08e3831f4ad4', 'b0000000-0000-0000-0000-000000000003', 'Phòng Trọ Giá Rẻ Làng ĐH', 'Phòng nhỏ gọn gần làng Đại học Thủ Đức. Tiện đi học, gần quán ăn sinh viên.', 2500000, 16, 'Wifi, Quạt trần', 'Phòng trọ', 'Khu phố 6, Linh Trung, TP.Thủ Đức', NULL, 2, '2026-09-05 00:12:15.179769+07');


--
-- Data for Name: FavoriteRooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."FavoriteRooms" VALUES ('c0000000-0000-0000-0000-000000000001', 'bbc572d0-6240-4a1c-b06b-b310a2d760be', '2026-09-05 00:12:15.179769+07');
INSERT INTO public."FavoriteRooms" VALUES ('c0000000-0000-0000-0000-000000000001', 'e86fd319-5059-485e-b382-f9384493c102', '2026-09-06 00:12:15.179769+07');
INSERT INTO public."FavoriteRooms" VALUES ('c0000000-0000-0000-0000-000000000002', 'd0ab49dd-8022-4e8d-a4d8-3aef835eb465', '2026-09-08 00:12:15.179769+07');
INSERT INTO public."FavoriteRooms" VALUES ('c0000000-0000-0000-0000-000000000002', 'e45a6b3f-ea50-4433-8666-b6232e116c0b', '2026-09-07 00:12:15.179769+07');
INSERT INTO public."FavoriteRooms" VALUES ('c0000000-0000-0000-0000-000000000003', '0b1962cc-8650-4ee0-aa51-f1d5f71cbb72', '2026-09-06 00:12:15.179769+07');
INSERT INTO public."FavoriteRooms" VALUES ('c0000000-0000-0000-0000-000000000003', 'bbc572d0-6240-4a1c-b06b-b310a2d760be', '2026-09-04 00:12:15.179769+07');
INSERT INTO public."FavoriteRooms" VALUES ('c0000000-0000-0000-0000-000000000004', '658e449a-d375-4133-9c5b-7435997eeb75', '2026-09-07 00:12:15.179769+07');
INSERT INTO public."FavoriteRooms" VALUES ('c0000000-0000-0000-0000-000000000005', '19d8080d-3dd1-4982-82b0-8fc375ec90ca', '2026-09-08 00:12:15.179769+07');
INSERT INTO public."FavoriteRooms" VALUES ('c0000000-0000-0000-0000-000000000005', 'f46a71eb-174b-4e9c-8204-08e3831f4ad4', '2026-09-08 00:12:15.179769+07');
INSERT INTO public."FavoriteRooms" VALUES ('c0000000-0000-0000-0000-000000000006', 'e86fd319-5059-485e-b382-f9384493c102', '2026-09-06 00:12:15.179769+07');
INSERT INTO public."FavoriteRooms" VALUES ('c0000000-0000-0000-0000-000000000007', '919e98da-c2cb-40c2-88ce-25b1d652c871', '2026-09-07 00:12:15.179769+07');
INSERT INTO public."FavoriteRooms" VALUES ('c0000000-0000-0000-0000-000000000008', 'e45a6b3f-ea50-4433-8666-b6232e116c0b', '2026-09-05 00:12:15.179769+07');
INSERT INTO public."FavoriteRooms" VALUES ('c0000000-0000-0000-0000-000000000010', 'd0ab49dd-8022-4e8d-a4d8-3aef835eb465', '2026-09-08 00:12:15.179769+07');
INSERT INTO public."FavoriteRooms" VALUES ('c0000000-0000-0000-0000-000000000011', '658e449a-d375-4133-9c5b-7435997eeb75', '2026-09-04 00:12:15.179769+07');
INSERT INTO public."FavoriteRooms" VALUES ('c0000000-0000-0000-0000-000000000013', 'e4464bda-300f-4626-8dc3-a55f7afb1e15', '2026-09-07 00:12:15.179769+07');


--
-- Data for Name: LandlordSubscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."LandlordSubscriptions" VALUES ('1d97095e-3471-4adf-82fb-2f50b14c37b3', 'b0000000-0000-0000-0000-000000000005', 'Pro', 199000, '2026-07-26 00:12:15.179769+07', '2027-07-26 00:12:15.179769+07', true);
INSERT INTO public."LandlordSubscriptions" VALUES ('3ab0b25a-dd42-445b-a8c7-0a79fd16de93', 'b0000000-0000-0000-0000-000000000002', 'Pro', 199000, '2026-07-11 00:12:15.179769+07', '2027-07-11 00:12:15.179769+07', true);
INSERT INTO public."LandlordSubscriptions" VALUES ('3af4d669-fbe7-4050-a66d-9eaaa44ff2cf', 'b0000000-0000-0000-0000-000000000003', 'Enterprise', 499000, '2026-08-25 00:12:15.179769+07', '2027-08-25 00:12:15.179769+07', true);
INSERT INTO public."LandlordSubscriptions" VALUES ('3fe9efdb-6c94-47db-b6d8-be2bf5fb3970', 'b0000000-0000-0000-0000-000000000004', 'Free', 0, '2026-08-30 00:12:15.179769+07', '2027-08-30 00:12:15.179769+07', true);
INSERT INTO public."LandlordSubscriptions" VALUES ('61086b22-5d74-4232-8a6f-85e1e4eb3daf', 'b0000000-0000-0000-0000-000000000001', 'Pro', 199000, '2026-08-10 00:12:15.179769+07', '2027-08-10 00:12:15.179769+07', true);


--
-- Data for Name: Messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Messages" VALUES ('1659855b-43ca-4aad-b756-8c2a1b44f810', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000005', 'Gần lắm em, đi bộ 3 phút là tới trạm.', true, '2026-09-07 13:12:15.179769+07');
INSERT INTO public."Messages" VALUES ('181edc98-d7c8-463d-a8cf-d664973a4008', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Giá đã tốt lắm rồi em, nhưng nếu ký 6 tháng anh giảm 200k/tháng nhé.', false, '2026-09-08 01:12:15.179769+07');
INSERT INTO public."Messages" VALUES ('1dccf845-8c67-479a-81db-80b90bfc1fcd', 'c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 'Phòng gần FPT Thủ Đức có gần trạm xe bus không anh?', true, '2026-09-07 12:12:15.179769+07');
INSERT INTO public."Messages" VALUES ('33b11f1f-055a-4925-afc4-eeddcfc8f25c', 'b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000007', 'Yên tĩnh em nhé, cách xa đường băng. Khu dân cư rất bình yên.', false, '2026-09-08 13:12:15.179769+07');
INSERT INTO public."Messages" VALUES ('6a728792-a36d-453d-9f70-1a4d8e9229aa', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Được em, chiều mai 3h anh có ở nhà. Em đến nhé!', false, '2026-09-07 03:12:15.179769+07');
INSERT INTO public."Messages" VALUES ('7027d0b7-34e3-4e81-bee8-ef6e68e0d018', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Dạ em muốn xem chiều mai được không ạ?', true, '2026-09-07 02:12:15.179769+07');
INSERT INTO public."Messages" VALUES ('7093aa37-9186-4829-a041-18d46a841366', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Chào em, phòng vẫn còn trống nhé. Em muốn đến xem phòng không?', true, '2026-09-07 01:12:15.179769+07');
INSERT INTO public."Messages" VALUES ('86e1fcd1-803e-405a-8fa8-66509a34a4bf', 'c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000005', 'Phòng gần sân bay có yên tĩnh không anh? Em hay làm việc tại nhà.', true, '2026-09-08 12:12:15.179769+07');
INSERT INTO public."Messages" VALUES ('8afc0ce2-ae2e-4fa1-92a7-e2bfa0c0a41f', 'c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 'Ok anh, em đặt lịch xem phòng nhé!', false, '2026-09-07 14:12:15.179769+07');
INSERT INTO public."Messages" VALUES ('96fca600-e86f-4b12-9d1e-ca0dd8447058', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Chào anh, phòng Studio View Sông còn trống không ạ?', true, '2026-09-07 00:12:15.179769+07');
INSERT INTO public."Messages" VALUES ('b53f3cc4-fa1c-4dfd-a246-1bf90fd8ae69', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Còn em ơi! Em ghé xem phòng bất cứ lúc nào nhé.', true, '2026-09-06 01:12:15.179769+07');
INSERT INTO public."Messages" VALUES ('d275b6b7-0b6a-4b01-bb1b-3565de9727d6', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Anh ơi, căn mini Q.1 có thể thương lượng giá không ạ?', true, '2026-09-08 00:12:15.179769+07');
INSERT INTO public."Messages" VALUES ('de72a16c-154b-495c-9dc7-4f8c34082de1', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Chị ơi, phòng gần RMIT còn không ạ? Em muốn thuê từ tháng tới.', true, '2026-09-06 00:12:15.179769+07');


--
-- Data for Name: RoomImages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."RoomImages" VALUES ('1041acf2-f514-4771-985c-6f21a90f6b14', 'bbc572d0-6240-4a1c-b06b-b310a2d760be', 'https://images.unsplash.com/photo-1502672260266-1c1de2d96674?auto=format&fit=crop&w=800&q=80', false);
INSERT INTO public."RoomImages" VALUES ('2827fd7a-b187-4571-8f46-d1a69c709ae2', '3487b084-b369-4417-b8a9-2e76db42aac2', 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80', true);
INSERT INTO public."RoomImages" VALUES ('2b28a3d1-1fde-4ab3-91de-71e920c3f644', 'f46a71eb-174b-4e9c-8204-08e3831f4ad4', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=800&q=80', true);
INSERT INTO public."RoomImages" VALUES ('31153b3a-eaf6-40f5-9438-31578babe797', '18bdccf2-3119-4f6f-8a2f-7047d2dc0414', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', true);
INSERT INTO public."RoomImages" VALUES ('34ae8f67-2d77-46e9-b707-4cf9df61aaa4', '3f17e5b5-08e6-43f7-9b7f-323da27b392e', 'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?auto=format&fit=crop&w=800&q=80', false);
INSERT INTO public."RoomImages" VALUES ('3618e47b-6e18-42de-b679-7fc4c86984cb', '084003fb-25f5-432b-be53-303e1e5202fb', 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=800&q=80', true);
INSERT INTO public."RoomImages" VALUES ('3fcf8ebd-7e71-410c-a51b-f7c6562de5ba', '9492ce69-f612-4b18-8bfd-6023a2fbe2c1', 'https://images.unsplash.com/photo-1560440021-33f9b867541c?auto=format&fit=crop&w=800&q=80', false);
INSERT INTO public."RoomImages" VALUES ('43430611-4345-4cad-a912-ec323a5f60e0', '19d8080d-3dd1-4982-82b0-8fc375ec90ca', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80', true);
INSERT INTO public."RoomImages" VALUES ('447dc85e-bf1f-4dec-9dea-2368759014a3', 'e45a6b3f-ea50-4433-8666-b6232e116c0b', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', true);
INSERT INTO public."RoomImages" VALUES ('4607d7e5-8928-4b79-b792-f643cc82e4ac', 'e4464bda-300f-4626-8dc3-a55f7afb1e15', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', false);
INSERT INTO public."RoomImages" VALUES ('4aea5015-b8e1-4d51-82e4-306246c1cb26', '0b1962cc-8650-4ee0-aa51-f1d5f71cbb72', 'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=800&q=80', false);
INSERT INTO public."RoomImages" VALUES ('5706df6e-8466-48d6-9705-1421cf045827', 'd636025d-cc42-4e7f-b534-76c7b860339d', 'https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=800&q=80', false);
INSERT INTO public."RoomImages" VALUES ('5fb4eda7-d8b7-43ad-a6ec-ca1cbd26891b', '919e98da-c2cb-40c2-88ce-25b1d652c871', 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=800&q=80', true);
INSERT INTO public."RoomImages" VALUES ('6665834f-ff7b-4996-b958-75b9bca08c21', 'd636025d-cc42-4e7f-b534-76c7b860339d', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80', false);
INSERT INTO public."RoomImages" VALUES ('690a0e7a-ca42-4132-94b8-1b84457a5142', '919e98da-c2cb-40c2-88ce-25b1d652c871', 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=800&q=80', false);
INSERT INTO public."RoomImages" VALUES ('7037a405-afe0-4d6a-bb9e-f09ba6e79763', 'e4464bda-300f-4626-8dc3-a55f7afb1e15', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', true);
INSERT INTO public."RoomImages" VALUES ('809bcd97-0142-4100-bbf1-6021cb737000', '658e449a-d375-4133-9c5b-7435997eeb75', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80', true);
INSERT INTO public."RoomImages" VALUES ('81c1aedd-5ac6-4f63-8581-5ef0715185dd', '4adad10c-da25-4193-8f97-2e81837e86ba', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80', false);
INSERT INTO public."RoomImages" VALUES ('86811f58-edf1-49ef-aa05-abe4cd83f365', 'd636025d-cc42-4e7f-b534-76c7b860339d', 'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=800&q=80', true);
INSERT INTO public."RoomImages" VALUES ('92d1e6d1-0c01-4876-b390-e0997ecb0f8d', 'e45a6b3f-ea50-4433-8666-b6232e116c0b', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80', false);
INSERT INTO public."RoomImages" VALUES ('93c374dc-90da-4e86-bcad-82fe5629be99', '9492ce69-f612-4b18-8bfd-6023a2fbe2c1', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80', true);
INSERT INTO public."RoomImages" VALUES ('962beb05-7740-4df2-9853-7616ad2fcdc7', 'e48238a4-831b-4236-8760-6f49fe0dd540', 'https://images.unsplash.com/photo-1598928506311-c55ez637a572?auto=format&fit=crop&w=800&q=80', true);
INSERT INTO public."RoomImages" VALUES ('9cf716bb-4edd-45ad-a8d0-fa236be9f0f7', 'd0ab49dd-8022-4e8d-a4d8-3aef835eb465', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80', true);
INSERT INTO public."RoomImages" VALUES ('9d69a5b2-f839-4dcb-b136-860d0f1b5465', '46ff4c27-dbb5-4008-a9d7-456311a724cf', 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80', true);
INSERT INTO public."RoomImages" VALUES ('a7df039c-f205-4953-9355-a54a93a477d4', '0b1962cc-8650-4ee0-aa51-f1d5f71cbb72', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80', true);
INSERT INTO public."RoomImages" VALUES ('b124dbde-c12e-49bb-86d5-85645886a93b', '4adad10c-da25-4193-8f97-2e81837e86ba', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', true);
INSERT INTO public."RoomImages" VALUES ('b3de8647-f760-4671-a574-bf31e1831833', 'd0ab49dd-8022-4e8d-a4d8-3aef835eb465', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', false);
INSERT INTO public."RoomImages" VALUES ('bb138107-739f-430b-a30c-090fe686d8d7', 'bbc572d0-6240-4a1c-b06b-b310a2d760be', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', true);
INSERT INTO public."RoomImages" VALUES ('bf5fda61-dc28-4e8a-87a2-455339db7548', '18bdccf2-3119-4f6f-8a2f-7047d2dc0414', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80', false);
INSERT INTO public."RoomImages" VALUES ('c24839f9-8c43-4928-b352-156b347925fc', 'd0ab49dd-8022-4e8d-a4d8-3aef835eb465', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', false);
INSERT INTO public."RoomImages" VALUES ('ca03ea2f-0a43-44bf-9b44-22991d310b56', 'e86fd319-5059-485e-b382-f9384493c102', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80', true);
INSERT INTO public."RoomImages" VALUES ('cd7db418-ee10-4fe5-b289-234d50f66fbf', 'e86fd319-5059-485e-b382-f9384493c102', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80', false);
INSERT INTO public."RoomImages" VALUES ('e87aeff1-b3f5-4394-80f7-dd21092fbaa5', '87793f0e-72d5-4d04-93bf-e2aa4623b375', 'https://images.unsplash.com/photo-1559599238-308793637427?auto=format&fit=crop&w=800&q=80', true);
INSERT INTO public."RoomImages" VALUES ('eafb635e-5b3e-4b69-ba97-356e0bfe849b', '3f17e5b5-08e6-43f7-9b7f-323da27b392e', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80', true);
INSERT INTO public."RoomImages" VALUES ('f849d3e7-ad05-4250-b5a1-ef4a1f3e7881', '658e449a-d375-4133-9c5b-7435997eeb75', 'https://images.unsplash.com/photo-1585128792020-803d29415281?auto=format&fit=crop&w=800&q=80', false);


--
-- Data for Name: RoomReviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."RoomReviews" VALUES ('11066f3d-30fe-43e4-82fc-9b711755e74e', 'e86fd319-5059-485e-b382-f9384493c102', 'c0000000-0000-0000-0000-000000000006', 3, 'Phòng tạm được, wifi hơi chập chờn.', '2026-09-05 00:12:15.179769+07');
INSERT INTO public."RoomReviews" VALUES ('1a29dd96-4cf6-4605-85c9-c2dfaa6198e9', '658e449a-d375-4133-9c5b-7435997eeb75', 'c0000000-0000-0000-0000-000000000005', 5, 'Gần FPT, đi học tiện lắm! Phòng mới, sạch sẽ.', '2026-09-07 00:12:15.179769+07');
INSERT INTO public."RoomReviews" VALUES ('2e33cfb2-e4f1-43df-ae91-0c1bc39b0836', 'e86fd319-5059-485e-b382-f9384493c102', 'c0000000-0000-0000-0000-000000000001', 4, 'Gần RMIT, giá sinh viên. Phòng hơi nhỏ nhưng đủ dùng.', '2026-09-03 00:12:15.179769+07');
INSERT INTO public."RoomReviews" VALUES ('4fa9ba2d-fcca-439b-aaf2-7ef5ae20b58d', 'e4464bda-300f-4626-8dc3-a55f7afb1e15', 'c0000000-0000-0000-0000-000000000013', 5, 'Officetel K300 quá tiện cho freelancer. Wifi cực nhanh!', '2026-09-08 00:12:15.179769+07');
INSERT INTO public."RoomReviews" VALUES ('5ed20f08-cedf-4682-b6dc-a639a0af5fa3', 'd0ab49dd-8022-4e8d-a4d8-3aef835eb465', 'c0000000-0000-0000-0000-000000000004', 5, 'Căn hộ Phú Mỹ Hưng đẳng cấp, tiện ích đầy đủ. 10 điểm!', '2026-09-04 00:12:15.179769+07');
INSERT INTO public."RoomReviews" VALUES ('a002fd76-33f4-4e19-8856-5c42f53e8a30', 'bbc572d0-6240-4a1c-b06b-b310a2d760be', 'c0000000-0000-0000-0000-000000000001', 4, 'Phòng rộng, sạch sẽ. Chỉ hơi ồn vào giờ cao điểm.', '2026-09-01 00:12:15.179769+07');
INSERT INTO public."RoomReviews" VALUES ('a37ced99-1d30-4255-984c-1199a5bdd0c7', 'e45a6b3f-ea50-4433-8666-b6232e116c0b', 'c0000000-0000-0000-0000-000000000002', 4, 'Phòng ổn, giá hợp lý. Khu vực thuận tiện đi lại.', '2026-09-02 00:12:15.179769+07');
INSERT INTO public."RoomReviews" VALUES ('b7329e05-24f6-4112-8268-fe4f467cb411', '3f17e5b5-08e6-43f7-9b7f-323da27b392e', 'c0000000-0000-0000-0000-000000000007', 4, 'Vinhomes đẹp, tiện ích nhiều. Giá hơi cao nhưng xứng đáng.', '2026-09-08 00:12:15.179769+07');
INSERT INTO public."RoomReviews" VALUES ('d40f9ee0-d041-4e63-ab9a-34f9b81c6df4', 'bbc572d0-6240-4a1c-b06b-b310a2d760be', 'c0000000-0000-0000-0000-000000000003', 5, 'Phòng đẹp, view sông tuyệt vời! Nội thất xịn xò. Chủ nhà thân thiện.', '2026-08-30 00:12:15.179769+07');
INSERT INTO public."RoomReviews" VALUES ('e6ca0f72-1342-4f6c-b1cd-3b014da1dba3', 'd0ab49dd-8022-4e8d-a4d8-3aef835eb465', 'c0000000-0000-0000-0000-000000000010', 5, 'An ninh tốt, hồ bơi đẹp, gym hiện đại. Rất hài lòng.', '2026-09-06 00:12:15.179769+07');
INSERT INTO public."RoomReviews" VALUES ('e7e06c12-f666-47cc-a9fe-cd7e4e6ea6c7', '9492ce69-f612-4b18-8bfd-6023a2fbe2c1', 'c0000000-0000-0000-0000-000000000009', 4, 'Gần sân bay, thuận tiện. Phòng sạch, chủ nhà nice.', '2026-09-06 00:12:15.179769+07');


--
-- Data for Name: RoommatePosts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."RoommatePosts" VALUES ('185e8468-1660-445e-8451-bc76b1812997', 'c0000000-0000-0000-0000-000000000002', 'Tìm bạn nữ ở ghép Bình Thạnh', 'Tìm bạn nữ chia sẻ căn hộ 2PN. Mình đi làm 8-5, thích nấu ăn.', 4000000, 'Bình Thạnh, TP.HCM', '2026-09-16 00:12:15.179769+07', 'Female', 'Sạch sẽ, Nấu ăn, Thân thiện', true, '2026-09-06 00:12:15.179769+07');
INSERT INTO public."RoommatePosts" VALUES ('28e80a24-c92f-472f-bda2-5debc3c51b5d', 'c0000000-0000-0000-0000-000000000008', 'Tìm roommate nữ Gò Vấp', 'Mình thích nấu ăn, sạch sẽ. Tìm bạn nữ cùng chia sẻ.', 3000000, 'Gò Vấp, TP.HCM', '2026-09-17 00:12:15.179769+07', 'Female', 'Nấu ăn, Sạch sẽ, Thân thiện', true, '2026-09-03 00:12:15.179769+07');
INSERT INTO public."RoommatePosts" VALUES ('50744307-be4f-4a7e-b2cd-b2aee5481481', 'c0000000-0000-0000-0000-000000000005', 'SV cần tìm bạn ở ghép giá rẻ', 'Mình sinh viên năm 2 UEH, budget thấp, cần bạn cùng share phòng.', 2000000, 'Quận 3, TP.HCM', '2026-09-12 00:12:15.179769+07', 'Male', 'Sinh viên, Yên tĩnh, Sạch sẽ', true, '2026-09-08 00:12:15.179769+07');
INSERT INTO public."RoommatePosts" VALUES ('8cca195e-16ab-4c3f-bac2-c78f4ca3a17e', 'c0000000-0000-0000-0000-000000000004', 'Tìm bạn nữ ở ghép Thủ Đức', 'Mình nhân viên văn phòng, tìm bạn nữ sạch sẽ, gọn gàng.', 3000000, 'Thủ Đức, TP.HCM', '2026-09-14 00:12:15.179769+07', 'Female', 'Dậy sớm, Tập gym, Gọn gàng', true, '2026-09-07 00:12:15.179769+07');
INSERT INTO public."RoommatePosts" VALUES ('a6489a97-d37c-4557-b9dc-86adabb148d0', 'c0000000-0000-0000-0000-000000000001', 'Tìm bạn ở ghép Q.7 gần RMIT', 'Mình SV năm 3 RMIT, sạch sẽ, lịch sự, tìm bạn cùng phòng.', 3500000, 'Quận 7, TP.HCM', '2026-09-23 00:12:15.179769+07', 'Male', 'Yên tĩnh, Sạch sẽ, Dậy sớm', true, '2026-09-04 00:12:15.179769+07');
INSERT INTO public."RoommatePosts" VALUES ('b6a50804-e767-4d3e-afd6-c187b7e26b0b', 'c0000000-0000-0000-0000-000000000006', 'Tìm bạn nữ share phòng Q.7', 'Mình thích đọc sách, yên tĩnh. Tìm bạn cùng lifestyle.', 3500000, 'Quận 7, TP.HCM', '2026-09-21 00:12:15.179769+07', 'Female', 'Đọc sách, Yên tĩnh, Dậy sớm', true, '2026-09-05 00:12:15.179769+07');
INSERT INTO public."RoommatePosts" VALUES ('ce8ec645-2ef5-4979-96ea-0f5231259194', 'c0000000-0000-0000-0000-000000000003', 'Tìm roommate Q.1 cho dev', 'Developer tìm roommate cùng vibe tech. Cú đêm, code đến 2h sáng là bình thường 😄', 5000000, 'Quận 1, TP.HCM', '2026-09-19 00:12:15.179769+07', 'Any', 'Cú đêm, Chơi game, Thoải mái', true, '2026-09-02 00:12:15.179769+07');
INSERT INTO public."RoommatePosts" VALUES ('fa1220e2-0365-4ea2-8872-914b88517a17', 'c0000000-0000-0000-0000-000000000013', 'Designer tìm roommate Tân Bình', 'Mình là designer freelance, hay làm đêm. Tìm bạn thoải mái, không ồn.', 4500000, 'Tân Bình, TP.HCM', '2026-09-24 00:12:15.179769+07', 'Any', 'Cú đêm, Sáng tạo, Thoải mái', true, '2026-09-01 00:12:15.179769+07');


--
-- Data for Name: ViewingAppointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."ViewingAppointments" VALUES ('010e2530-ae4d-4e1a-bb8d-179811c15d21', 'c0000000-0000-0000-0000-000000000004', '658e449a-d375-4133-9c5b-7435997eeb75', '2026-09-11 16:00:00+07', 'Pending', NULL, '2026-09-08 18:12:15.179769+07');
INSERT INTO public."ViewingAppointments" VALUES ('05ea196e-9e83-426f-b3b9-0f8731d4cc72', 'c0000000-0000-0000-0000-000000000010', 'd0ab49dd-8022-4e8d-a4d8-3aef835eb465', '2026-09-01 21:00:00+07', 'Rejected', 'Chủ nhà bận, hẹn lại', '2026-08-30 00:12:15.179769+07');
INSERT INTO public."ViewingAppointments" VALUES ('071c7941-e7b5-45f6-b80b-5b3d366ccd96', 'c0000000-0000-0000-0000-000000000001', 'bbc572d0-6240-4a1c-b06b-b310a2d760be', '2026-09-09 22:00:00+07', 'Approved', 'Em đến lúc 3h chiều nhé', '2026-09-08 00:12:15.179769+07');
INSERT INTO public."ViewingAppointments" VALUES ('6c0b3563-05e8-40a8-a996-39b3473ed20d', 'c0000000-0000-0000-0000-000000000007', '9492ce69-f612-4b18-8bfd-6023a2fbe2c1', '2026-09-12 18:00:00+07', 'Approved', NULL, '2026-09-08 00:12:15.179769+07');
INSERT INTO public."ViewingAppointments" VALUES ('6e6634e7-e069-40cf-9e1f-5c4715c6ea62', 'c0000000-0000-0000-0000-000000000005', '658e449a-d375-4133-9c5b-7435997eeb75', '2026-09-07 23:00:00+07', 'Completed', 'Phòng đẹp, sẽ ký hợp đồng', '2026-09-06 00:12:15.179769+07');
INSERT INTO public."ViewingAppointments" VALUES ('88c70586-1c93-46e8-b676-f3bf56a9c825', 'c0000000-0000-0000-0000-000000000013', 'e4464bda-300f-4626-8dc3-a55f7afb1e15', '2026-09-13 17:00:00+07', 'Pending', 'Muốn xem officetel K300', '2026-09-08 21:12:15.179769+07');
INSERT INTO public."ViewingAppointments" VALUES ('a7b98d23-0c69-4f99-b1cc-fc3f7db97c23', 'c0000000-0000-0000-0000-000000000002', 'e86fd319-5059-485e-b382-f9384493c102', '2026-09-10 17:00:00+07', 'Pending', 'Em muốn xem phòng sáng thứ 7', '2026-09-08 12:12:15.179769+07');
INSERT INTO public."ViewingAppointments" VALUES ('ceb1f2c0-468d-4d54-9a87-1d796f66062d', 'c0000000-0000-0000-0000-000000000003', '0b1962cc-8650-4ee0-aa51-f1d5f71cbb72', '2026-09-05 21:00:00+07', 'Completed', 'Đã xem, đang cân nhắc', '2026-09-04 00:12:15.179769+07');


--
-- Data for Name: __EFMigrationsHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- PostgreSQL database dump complete
--

\unrestrict 85fPuW6fBawAr2SeBdPIfQirAincIu7DrhHUfHeFJ4w9hyKPpDfDPpffuvEiBdY

