-- =============================================================================
-- DORMI POSTGRESQL COMPLETE DATABASE DDL & SEED SCRIPT
-- Replaces all mock data with production-ready PostgreSQL relational database data
-- Includes PostGIS Spatial Data for Radius & Distance Filtering
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS "Users" (
    "Id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "Email" varchar(255) NOT NULL UNIQUE,
    "PasswordHash" text NOT NULL,
    "FullName" varchar(255) NOT NULL,
    "PhoneNumber" varchar(50),
    "AvatarUrl" text,
    "Role" integer NOT NULL DEFAULT 0,
    "IsVerified" boolean NOT NULL DEFAULT false,
    "Preferences" text,
    "Lifestyle" text,
    "IsLookingForRoommate" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. ROOMS TABLE
CREATE TABLE IF NOT EXISTS "Rooms" (
    "Id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "LandlordId" uuid NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "Title" varchar(500) NOT NULL,
    "Description" text NOT NULL,
    "Price" numeric(18, 2) NOT NULL,
    "Area" double precision NOT NULL,
    "Utilities" text NOT NULL,
    "RoomType" varchar(100) NOT NULL,
    "Address" text NOT NULL,
    "Latitude" double precision,
    "Longitude" double precision,
    "Location" geometry(Point, 4326),
    "Virtual3DUrl" text,
    "Status" integer NOT NULL DEFAULT 1,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "IX_Rooms_Location" ON "Rooms" USING GIST ("Location");
CREATE INDEX IF NOT EXISTS "IX_Rooms_LandlordId" ON "Rooms" ("LandlordId");

-- 3. ROOM IMAGES
CREATE TABLE IF NOT EXISTS "RoomImages" (
    "Id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "RoomId" uuid NOT NULL REFERENCES "Rooms"("Id") ON DELETE CASCADE,
    "ImageUrl" text NOT NULL,
    "IsPrimary" boolean NOT NULL DEFAULT false
);

-- 4. VIEWING APPOINTMENTS
CREATE TABLE IF NOT EXISTS "ViewingAppointments" (
    "Id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "RoomId" uuid NOT NULL REFERENCES "Rooms"("Id") ON DELETE CASCADE,
    "CustomerId" uuid NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "AppointmentDate" timestamp with time zone NOT NULL,
    "Status" varchar(50) NOT NULL DEFAULT 'Pending',
    "Notes" text,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. FAVORITE ROOMS
CREATE TABLE IF NOT EXISTS "FavoriteRooms" (
    "CustomerId" uuid NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "RoomId" uuid NOT NULL REFERENCES "Rooms"("Id") ON DELETE CASCADE,
    "SavedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("CustomerId", "RoomId")
);

-- 6. MESSAGES
CREATE TABLE IF NOT EXISTS "Messages" (
    "Id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "SenderId" uuid NOT NULL REFERENCES "Users"("Id") ON DELETE RESTRICT,
    "ReceiverId" uuid NOT NULL REFERENCES "Users"("Id") ON DELETE RESTRICT,
    "Content" text NOT NULL,
    "IsRead" boolean NOT NULL DEFAULT false,
    "SentAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. ROOMMATE POSTS
CREATE TABLE IF NOT EXISTS "RoommatePosts" (
    "Id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "CustomerId" uuid NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "Title" varchar(500) NOT NULL,
    "Description" text NOT NULL,
    "Budget" numeric(18, 2) NOT NULL,
    "Location" varchar(255) NOT NULL,
    "MoveInDate" timestamp with time zone NOT NULL,
    "GenderPreference" varchar(50) NOT NULL DEFAULT 'Any',
    "LifestyleTraits" text NOT NULL,
    "IsActive" boolean NOT NULL DEFAULT true,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. ROOM REVIEWS
CREATE TABLE IF NOT EXISTS "RoomReviews" (
    "Id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "RoomId" uuid NOT NULL REFERENCES "Rooms"("Id") ON DELETE CASCADE,
    "CustomerId" uuid NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "Rating" integer NOT NULL CHECK ("Rating" >= 1 AND "Rating" <= 5),
    "Comment" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. LANDLORD SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS "LandlordSubscriptions" (
    "Id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "LandlordId" uuid NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "PlanName" varchar(100) NOT NULL,
    "Price" numeric(18, 2) NOT NULL,
    "StartDate" timestamp with time zone NOT NULL,
    "EndDate" timestamp with time zone NOT NULL,
    "IsActive" boolean NOT NULL DEFAULT true
);

-- 10. ROOM REPORTS
CREATE TABLE IF NOT EXISTS "RoomReports" (
    "Id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "RoomId" uuid NOT NULL REFERENCES "Rooms"("Id") ON DELETE CASCADE,
    "ReporterId" uuid NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "Reason" text NOT NULL,
    "Details" text NOT NULL,
    "Status" text NOT NULL DEFAULT 'Pending',
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS "Notifications" (
    "Id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "UserId" uuid NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "Title" varchar(255) NOT NULL,
    "Message" text NOT NULL,
    "Type" varchar(50) NOT NULL DEFAULT 'General',
    "LinkUrl" text,
    "IsRead" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. VERIFICATION REQUESTS
CREATE TABLE IF NOT EXISTS "VerificationRequests" (
    "Id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "UserId" uuid NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "DocumentType" varchar(50) NOT NULL DEFAULT 'CCCD',
    "DocumentNumber" varchar(50),
    "FrontImageUrl" text NOT NULL,
    "BackImageUrl" text NOT NULL,
    "Status" varchar(50) NOT NULL DEFAULT 'Pending',
    "RejectReason" text,
    "SubmittedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ReviewedAt" timestamp with time zone,
    "ReviewerId" uuid REFERENCES "Users"("Id") ON DELETE SET NULL
);

-- 13. PAYMENT TRANSACTIONS
CREATE TABLE IF NOT EXISTS "PaymentTransactions" (
    "Id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "UserId" uuid NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "SubscriptionId" uuid REFERENCES "LandlordSubscriptions"("Id") ON DELETE SET NULL,
    "Amount" numeric(18, 2) NOT NULL,
    "PaymentMethod" varchar(50) NOT NULL,
    "TransactionRef" varchar(100) NOT NULL UNIQUE,
    "Status" varchar(50) NOT NULL DEFAULT 'Pending',
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CompletedAt" timestamp with time zone
);

-- 14. ROOM VIEWS (Lead Funnel)
CREATE TABLE IF NOT EXISTS "RoomViews" (
    "Id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "RoomId" uuid NOT NULL REFERENCES "Rooms"("Id") ON DELETE CASCADE,
    "ViewerId" uuid REFERENCES "Users"("Id") ON DELETE SET NULL,
    "EventType" varchar(50) NOT NULL DEFAULT 'DetailView',
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 15. LEASE CONTRACTS
CREATE TABLE IF NOT EXISTS "LeaseContracts" (
    "Id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "LandlordId" uuid NOT NULL REFERENCES "Users"("Id") ON DELETE RESTRICT,
    "TenantId" uuid NOT NULL REFERENCES "Users"("Id") ON DELETE RESTRICT,
    "RoomId" uuid NOT NULL REFERENCES "Rooms"("Id") ON DELETE CASCADE,
    "StartDate" timestamp with time zone NOT NULL,
    "EndDate" timestamp with time zone NOT NULL,
    "MonthlyRent" numeric(18, 2) NOT NULL,
    "Deposit" numeric(18, 2) NOT NULL,
    "Status" varchar(50) NOT NULL DEFAULT 'Active',
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 16. TENANT REVIEWS
CREATE TABLE IF NOT EXISTS "TenantReviews" (
    "Id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "LandlordId" uuid NOT NULL REFERENCES "Users"("Id") ON DELETE RESTRICT,
    "TenantId" uuid NOT NULL REFERENCES "Users"("Id") ON DELETE RESTRICT,
    "LeaseContractId" uuid NOT NULL REFERENCES "LeaseContracts"("Id") ON DELETE CASCADE,
    "Rating" integer NOT NULL CHECK ("Rating" >= 1 AND "Rating" <= 5),
    "Punctuality" integer NOT NULL CHECK ("Punctuality" >= 1 AND "Punctuality" <= 5),
    "Cleanliness" integer NOT NULL CHECK ("Cleanliness" >= 1 AND "Cleanliness" <= 5),
    "Respectfulness" integer NOT NULL CHECK ("Respectfulness" >= 1 AND "Respectfulness" <= 5),
    "Comment" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- SEED DATA
-- Default password for all users: Password123!
-- =============================================================================

DO $seed$
DECLARE
    pwd_hash text := 'AQAAAAIAAYagAAAAEIe2/O7R9s6Y9tM6k5k1X7X3X4X5X6X7X8X9X0X1X2X3X4X5X6X7X8X9X0X1==';
    admin_id uuid := 'a0000000-0000-0000-0000-000000000001';
    ll1_id uuid := 'b0000000-0000-0000-0000-000000000001';
    ll2_id uuid := 'b0000000-0000-0000-0000-000000000002';
    ll3_id uuid := 'b0000000-0000-0000-0000-000000000003';
    ll4_id uuid := 'b0000000-0000-0000-0000-000000000004';
    ll5_id uuid := 'b0000000-0000-0000-0000-000000000005';
    c1_id uuid := 'c0000000-0000-0000-0000-000000000001';
    c2_id uuid := 'c0000000-0000-0000-0000-000000000002';
    c3_id uuid := 'c0000000-0000-0000-0000-000000000003';
    c4_id uuid := 'c0000000-0000-0000-0000-000000000004';
    c5_id uuid := 'c0000000-0000-0000-0000-000000000005';
    
    r1_id uuid := 'd0000000-0000-0000-0000-000000000001';
    r2_id uuid := 'd0000000-0000-0000-0000-000000000002';
    r3_id uuid := 'd0000000-0000-0000-0000-000000000003';
    r4_id uuid := 'd0000000-0000-0000-0000-000000000004';
    r5_id uuid := 'd0000000-0000-0000-0000-000000000005';
    r6_id uuid := 'd0000000-0000-0000-0000-000000000006';

    sub1_id uuid := 'e0000000-0000-0000-0000-000000000001';
    sub2_id uuid := 'e0000000-0000-0000-0000-000000000002';
    sub3_id uuid := 'e0000000-0000-0000-0000-000000000003';
    
    lease1_id uuid := 'f0000000-0000-0000-0000-000000000001';
BEGIN

    -- INSERT USERS
    INSERT INTO "Users" ("Id", "Email", "PasswordHash", "FullName", "PhoneNumber", "AvatarUrl", "Role", "IsVerified", "Preferences", "Lifestyle", "IsLookingForRoommate")
    VALUES
    (admin_id, 'admin@dormi.vn', pwd_hash, 'Quản trị viên Dormi', '0900000001', NULL, 2, true, NULL, NULL, false),
    (ll1_id, 'landlord@dormi.vn', pwd_hash, 'Trần Minh Tuấn', '0901111001', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 1, true, NULL, NULL, false),
    (ll2_id, 'landlord2@dormi.vn', pwd_hash, 'Nguyễn Thị Hồng', '0901111002', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', 1, true, NULL, NULL, false),
    (ll3_id, 'landlord3@dormi.vn', pwd_hash, 'Phạm Văn Đức', '0901111003', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', 1, true, NULL, NULL, false),
    (ll4_id, 'landlord4@dormi.vn', pwd_hash, 'Lê Thị Mai', '0901111004', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80', 1, false, NULL, NULL, false),
    (ll5_id, 'landlord5@dormi.vn', pwd_hash, 'Võ Hoàng Nam', '0901111005', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80', 1, true, NULL, NULL, false),
    (c1_id, 'tenant@dormi.vn', pwd_hash, 'Nguyễn Văn An', '0902222001', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80', 0, true, 'Phòng yên tĩnh, gần trường', 'Yên tĩnh, Không hút thuốc, Dậy sớm', true),
    (c2_id, 'customer2@dormi.vn', pwd_hash, 'Trần Thị Bích', '0902222002', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 0, false, 'Phòng sạch sẽ, có bếp', 'Sạch sẽ, Nấu ăn, Yêu thú cưng', true),
    (c3_id, 'customer3@dormi.vn', pwd_hash, 'Lê Hoàng Minh', '0902222003', 'https://images.unsplash.com/photo-1599566150163-29194dcabd9c?auto=format&fit=crop&w=200&q=80', 0, false, 'Phòng rộng, giờ tự do', 'Cú đêm, Chơi game, Thoải mái', true),
    (c4_id, 'customer4@dormi.vn', pwd_hash, 'Phạm Thị Dung', '0902222004', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', 0, false, 'Gần công ty, an ninh', 'Dậy sớm, Tập gym, Không hút thuốc', true),
    (c5_id, 'customer5@dormi.vn', pwd_hash, 'Hoàng Văn Em', '0902222005', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', 0, false, 'Giá rẻ, có wifi', 'Sinh viên, Yên tĩnh, Sạch sẽ', true)
    ON CONFLICT ("Id") DO NOTHING;

    -- INSERT ROOMS WITH POSTGIS SPATIAL POINTS
    INSERT INTO "Rooms" ("Id", "LandlordId", "Title", "Description", "Price", "Area", "Utilities", "RoomType", "Address", "Latitude", "Longitude", "Location", "Status")
    VALUES
    (r1_id, ll1_id, 'Studio Cao Cấp View Sông Sài Gòn', 'Căn hộ studio hiện đại tầng 18, view trực diện sông Sài Gòn. Full nội thất nhập khẩu, bếp từ, máy giặt riêng.', 8500000, 40.0, 'Wifi, Máy lạnh, Tủ lạnh, Máy giặt, Ban công, Thang máy, Bảo vệ 24/7', 'Studio', '88 Nguyễn Huệ, Q.1, TP.HCM', 10.7743, 106.7038, ST_SetSRID(ST_MakePoint(106.7038, 10.7743), 4326), 1),
    (r2_id, ll1_id, 'Phòng Trọ Sạch Sẽ Quận 3', 'Phòng mới xây, sơn trắng thoáng mát, gần chợ Tân Định. Giờ giấc tự do, không chung chủ.', 4200000, 22.0, 'Wifi, Máy lạnh, Giờ giấc tự do, Không chung chủ', 'Phòng trọ', '56 Hai Bà Trưng, Q.3, TP.HCM', 10.7850, 106.6965, ST_SetSRID(ST_MakePoint(106.6965, 10.7850), 4326), 1),
    (r3_id, ll1_id, 'Căn Hộ Mini Trung Tâm Q.1', 'Căn hộ mini đầy đủ tiện nghi ngay trung tâm Quận 1. Gần Bến Thành, Phố đi bộ.', 6800000, 30.0, 'Wifi, Máy lạnh, Tủ lạnh, Bếp riêng, Thang máy, Bảo vệ 24/7', 'Căn hộ mini', '15 Lê Lợi, Q.1, TP.HCM', 10.7725, 106.7001, ST_SetSRID(ST_MakePoint(106.7001, 10.7725), 4326), 1),
    (r4_id, ll2_id, 'Căn Hộ Phú Mỹ Hưng Full Nội Thất', 'Căn hộ 2 phòng ngủ khu Phú Mỹ Hưng, an ninh tuyệt đối. Hồ bơi, gym, công viên.', 12000000, 70.0, 'Wifi, Máy lạnh, Tủ lạnh, Máy giặt, Ban công, Hồ bơi, Gym, Bảo vệ 24/7', 'Căn hộ', '101 Nguyễn Lương Bằng, Q.7, TP.HCM', 10.7285, 106.7218, ST_SetSRID(ST_MakePoint(106.7218, 10.7285), 4326), 1),
    (r5_id, ll2_id, 'Phòng Trọ Gần RMIT Quận 7', 'Phòng trọ thoáng mát gần RMIT, SC VivoCity. Khu an ninh, yên tĩnh. Phù hợp sinh viên.', 3800000, 25.0, 'Wifi, Máy lạnh, Giờ giấc tự do, Bãi giữ xe', 'Phòng trọ', '45 Nguyễn Văn Linh, Q.7, TP.HCM', 10.7315, 106.7050, ST_SetSRID(ST_MakePoint(106.7050, 10.7315), 4326), 1),
    (r6_id, ll3_id, 'Phòng Trọ Gần ĐH FPT Thủ Đức', 'Phòng mới, sạch sẽ, gần ĐH FPT và khu công nghệ cao. Phù hợp sinh viên IT.', 3200000, 20.0, 'Wifi tốc độ cao, Máy lạnh, Giờ giấc tự do, Bãi giữ xe', 'Phòng trọ', 'Lô E2 Khu CNC, TP.Thủ Đức', 10.8540, 106.7900, ST_SetSRID(ST_MakePoint(106.7900, 10.8540), 4326), 1)
    ON CONFLICT ("Id") DO NOTHING;

    -- INSERT ROOM IMAGES
    INSERT INTO "RoomImages" ("Id", "RoomId", "ImageUrl", "IsPrimary")
    VALUES
    (uuid_generate_v4(), r1_id, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', true),
    (uuid_generate_v4(), r1_id, 'https://images.unsplash.com/photo-1502672260266-1c1de2d96674?auto=format&fit=crop&w=800&q=80', false),
    (uuid_generate_v4(), r2_id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', true),
    (uuid_generate_v4(), r3_id, 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80', true),
    (uuid_generate_v4(), r4_id, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80', true),
    (uuid_generate_v4(), r5_id, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80', true),
    (uuid_generate_v4(), r6_id, 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80', true)
    ON CONFLICT ("Id") DO NOTHING;

    -- INSERT ROOMMATE POSTS
    INSERT INTO "RoommatePosts" ("Id", "CustomerId", "Title", "Description", "Budget", "Location", "MoveInDate", "GenderPreference", "LifestyleTraits", "IsActive")
    VALUES
    (uuid_generate_v4(), c1_id, 'Tìm bạn ở ghép Q.7 gần RMIT', 'Mình SV năm 3 RMIT, sạch sẽ, lịch sự, tìm bạn cùng phòng.', 3500000, 'Quận 7, TP.HCM', CURRENT_TIMESTAMP + interval '14 days', 'Male', 'Yên tĩnh, Sạch sẽ, Dậy sớm', true),
    (uuid_generate_v4(), c2_id, 'Tìm bạn nữ ở ghép Bình Thạnh', 'Tìm bạn nữ chia sẻ căn hộ 2PN. Mình đi làm 8-5, thích nấu ăn.', 4000000, 'Bình Thạnh, TP.HCM', CURRENT_TIMESTAMP + interval '7 days', 'Female', 'Sạch sẽ, Nấu ăn, Thân thiện', true),
    (uuid_generate_v4(), c3_id, 'Tìm roommate Q.1 cho dev', 'Developer tìm roommate cùng vibe tech. Cú đêm, code đến 2h sáng là bình thường 😄', 5000000, 'Quận 1, TP.HCM', CURRENT_TIMESTAMP + interval '10 days', 'Any', 'Cú đêm, Chơi game, Thoải mái', true)
    ON CONFLICT ("Id") DO NOTHING;

    -- INSERT FAVORITES
    INSERT INTO "FavoriteRooms" ("CustomerId", "RoomId", "SavedAt")
    VALUES
    (c1_id, r1_id, CURRENT_TIMESTAMP - interval '3 days'),
    (c1_id, r5_id, CURRENT_TIMESTAMP - interval '2 days'),
    (c2_id, r2_id, CURRENT_TIMESTAMP - interval '1 day')
    ON CONFLICT DO NOTHING;

    -- INSERT SUBSCRIPTIONS
    INSERT INTO "LandlordSubscriptions" ("Id", "LandlordId", "PlanName", "Price", "StartDate", "EndDate", "IsActive")
    VALUES
    (sub1_id, ll1_id, 'Pro', 199000, CURRENT_TIMESTAMP - interval '30 days', CURRENT_TIMESTAMP + interval '335 days', true),
    (sub2_id, ll2_id, 'Pro', 199000, CURRENT_TIMESTAMP - interval '60 days', CURRENT_TIMESTAMP + interval '305 days', true),
    (sub3_id, ll3_id, 'Enterprise', 499000, CURRENT_TIMESTAMP - interval '15 days', CURRENT_TIMESTAMP + interval '350 days', true)
    ON CONFLICT ("Id") DO NOTHING;

    -- INSERT PAYMENT TRANSACTIONS
    INSERT INTO "PaymentTransactions" ("Id", "UserId", "SubscriptionId", "Amount", "PaymentMethod", "TransactionRef", "Status", "CreatedAt", "CompletedAt")
    VALUES
    (uuid_generate_v4(), ll1_id, sub1_id, 199000, 'MoMo', 'MOMO_LL1_SQL', 'Completed', CURRENT_TIMESTAMP - interval '30 days', CURRENT_TIMESTAMP - interval '30 days'),
    (uuid_generate_v4(), ll2_id, sub2_id, 199000, 'VNPay', 'VNP_LL2_SQL', 'Completed', CURRENT_TIMESTAMP - interval '60 days', CURRENT_TIMESTAMP - interval '60 days'),
    (uuid_generate_v4(), ll3_id, sub3_id, 499000, 'BankTransfer', 'BANK_LL3_SQL', 'Completed', CURRENT_TIMESTAMP - interval '15 days', CURRENT_TIMESTAMP - interval '15 days')
    ON CONFLICT ("Id") DO NOTHING;

    -- INSERT VERIFICATION REQUESTS (CCCD)
    INSERT INTO "VerificationRequests" ("Id", "UserId", "DocumentType", "DocumentNumber", "FrontImageUrl", "BackImageUrl", "Status", "SubmittedAt", "ReviewedAt", "ReviewerId")
    VALUES
    (uuid_generate_v4(), ll1_id, 'CCCD', '079090001234', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600', 'Approved', CURRENT_TIMESTAMP - interval '65 days', CURRENT_TIMESTAMP - interval '60 days', admin_id),
    (uuid_generate_v4(), ll4_id, 'CCCD', '079090001236', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600', 'Pending', CURRENT_TIMESTAMP - interval '2 days', NULL, NULL)
    ON CONFLICT ("Id") DO NOTHING;

    -- INSERT NOTIFICATIONS
    INSERT INTO "Notifications" ("Id", "UserId", "Title", "Message", "Type", "LinkUrl", "IsRead", "CreatedAt")
    VALUES
    (uuid_generate_v4(), ll1_id, 'Hồ sơ xác minh đã duyệt', 'Tài khoản chủ trọ của bạn đã được chứng thực danh tính chính chủ.', 'Verification', '/landlord/verify', true, CURRENT_TIMESTAMP - interval '60 days'),
    (uuid_generate_v4(), c1_id, 'Lịch hẹn được xác nhận', 'Chủ trọ Trần Minh Tuấn đã xác nhận lịch xem phòng vào 15:00 ngày mai.', 'Appointment', '/tenant/appointments', false, CURRENT_TIMESTAMP - interval '1 day'),
    (uuid_generate_v4(), admin_id, 'Hồ sơ chủ trọ mới cần duyệt', 'Chủ trọ Lê Thị Mai đã nộp hồ sơ CCCD cần xét duyệt.', 'AdminAlert', '/admin/verify', false, CURRENT_TIMESTAMP - interval '2 days')
    ON CONFLICT ("Id") DO NOTHING;

    -- INSERT LEASES & TENANT REVIEWS
    INSERT INTO "LeaseContracts" ("Id", "LandlordId", "TenantId", "RoomId", "StartDate", "EndDate", "MonthlyRent", "Deposit", "Status")
    VALUES
    (lease1_id, ll1_id, c3_id, r3_id, CURRENT_TIMESTAMP - interval '6 months', CURRENT_TIMESTAMP - interval '5 days', 6800000, 6800000, 'Completed')
    ON CONFLICT ("Id") DO NOTHING;

    INSERT INTO "TenantReviews" ("Id", "LandlordId", "TenantId", "LeaseContractId", "Rating", "Punctuality", "Cleanliness", "Respectfulness", "Comment")
    VALUES
    (uuid_generate_v4(), ll1_id, c3_id, lease1_id, 5, 5, 5, 5, 'Bạn Minh thanh toán tiền phòng rất đúng hạn, phòng ốc giữ gìn sạch sẽ ngăn nắp, giao tiếp lịch sự hòa đồng.')
    ON CONFLICT ("Id") DO NOTHING;

END $seed$;
