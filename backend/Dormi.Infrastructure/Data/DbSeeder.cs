using System;
using System.Linq;
using System.Threading.Tasks;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

namespace Dormi.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(DormiDbContext db)
    {
        try
        {
            await db.Database.EnsureCreatedAsync();
        }
        catch
        {
            // Fallback
        }

        // ponytail: safe schema patch — EnsureCreated won't add new columns to existing tables
        try
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE \"Users\" ADD COLUMN IF NOT EXISTS \"IsLookingForRoommate\" boolean NOT NULL DEFAULT false");
            await db.Database.ExecuteSqlRawAsync(
                @"CREATE TABLE IF NOT EXISTS ""RoomReports"" (
                    ""Id"" uuid NOT NULL PRIMARY KEY,
                    ""RoomId"" uuid NOT NULL,
                    ""ReporterId"" uuid NOT NULL,
                    ""Reason"" text NOT NULL,
                    ""Details"" text NOT NULL,
                    ""Status"" text NOT NULL DEFAULT 'Pending',
                    ""CreatedAt"" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT ""FK_RoomReports_Rooms_RoomId"" FOREIGN KEY (""RoomId"") REFERENCES ""Rooms"" (""Id"") ON DELETE CASCADE,
                    CONSTRAINT ""FK_RoomReports_Users_ReporterId"" FOREIGN KEY (""ReporterId"") REFERENCES ""Users"" (""Id"") ON DELETE CASCADE
                );");
        }
        catch { /* column/table already exists or non-Postgres */ }

        if (await db.Users.AnyAsync()) return; // Already seeded, preserve all user modifications and created data

        var h = new PasswordHasher<User>();
        var now = DateTime.UtcNow;

        // ============================================================
        // 1. USERS (1 Admin + 5 Landlords + 14 Customers = 20)
        // ============================================================
        User u(Guid id, string email, string name, UserRole role, bool verified = false,
               string? phone = null, string? avatar = null, string? pref = null, string? life = null, bool looking = false)
        {
            var user = new User
            {
                Id = id, Email = email, FullName = name, Role = role, IsVerified = verified,
                PhoneNumber = phone, AvatarUrl = avatar, Preferences = pref, Lifestyle = life,
                IsLookingForRoommate = looking, CreatedAt = now.AddDays(-Random.Shared.Next(1, 90))
            };
            user.PasswordHash = h.HashPassword(user, "Password123!");
            return user;
        }

        // Fixed GUIDs for predictable FK references
        var adminId   = Guid.Parse("a0000000-0000-0000-0000-000000000001");
        var ll1 = Guid.Parse("b0000000-0000-0000-0000-000000000001");
        var ll2 = Guid.Parse("b0000000-0000-0000-0000-000000000002");
        var ll3 = Guid.Parse("b0000000-0000-0000-0000-000000000003");
        var ll4 = Guid.Parse("b0000000-0000-0000-0000-000000000004");
        var ll5 = Guid.Parse("b0000000-0000-0000-0000-000000000005");
        var c1  = Guid.Parse("c0000000-0000-0000-0000-000000000001");
        var c2  = Guid.Parse("c0000000-0000-0000-0000-000000000002");
        var c3  = Guid.Parse("c0000000-0000-0000-0000-000000000003");
        var c4  = Guid.Parse("c0000000-0000-0000-0000-000000000004");
        var c5  = Guid.Parse("c0000000-0000-0000-0000-000000000005");
        var c6  = Guid.Parse("c0000000-0000-0000-0000-000000000006");
        var c7  = Guid.Parse("c0000000-0000-0000-0000-000000000007");
        var c8  = Guid.Parse("c0000000-0000-0000-0000-000000000008");
        var c9  = Guid.Parse("c0000000-0000-0000-0000-000000000009");
        var c10 = Guid.Parse("c0000000-0000-0000-0000-000000000010");
        var c11 = Guid.Parse("c0000000-0000-0000-0000-000000000011");
        var c12 = Guid.Parse("c0000000-0000-0000-0000-000000000012");
        var c13 = Guid.Parse("c0000000-0000-0000-0000-000000000013");
        var c14 = Guid.Parse("c0000000-0000-0000-0000-000000000014");

        var users = new[]
        {
            // Admin
            u(adminId, "admin@dormi.vn", "Quản trị viên Dormi", UserRole.Admin, true, "0900000001"),

            // Landlords
            u(ll1, "landlord@dormi.vn", "Trần Minh Tuấn", UserRole.Landlord, true, "0901111001",
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"),
            u(ll2, "landlord2@dormi.vn", "Nguyễn Thị Hồng", UserRole.Landlord, true, "0901111002",
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"),
            u(ll3, "landlord3@dormi.vn", "Phạm Văn Đức", UserRole.Landlord, true, "0901111003",
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"),
            u(ll4, "landlord4@dormi.vn", "Lê Thị Mai", UserRole.Landlord, false, "0901111004",
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80"),
            u(ll5, "landlord5@dormi.vn", "Võ Hoàng Nam", UserRole.Landlord, true, "0901111005",
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80"),

            // Customers
            u(c1, "tenant@dormi.vn", "Nguyễn Văn An", UserRole.Customer, phone: "0902222001",
              avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
              pref: "Phòng yên tĩnh, gần trường", life: "Yên tĩnh, Không hút thuốc, Dậy sớm", looking: true),
            u(c2, "customer2@dormi.vn", "Trần Thị Bích", UserRole.Customer, phone: "0902222002",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
              pref: "Phòng sạch sẽ, có bếp", life: "Sạch sẽ, Nấu ăn, Yêu thú cưng", looking: true),
            u(c3, "customer3@dormi.vn", "Lê Hoàng Minh", UserRole.Customer, phone: "0902222003",
              avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd9c?auto=format&fit=crop&w=200&q=80",
              pref: "Phòng rộng, giờ tự do", life: "Cú đêm, Chơi game, Thoải mái", looking: true),
            u(c4, "customer4@dormi.vn", "Phạm Thị Dung", UserRole.Customer, phone: "0902222004",
              avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
              pref: "Gần công ty, an ninh", life: "Dậy sớm, Tập gym, Không hút thuốc", looking: true),
            u(c5, "customer5@dormi.vn", "Hoàng Văn Em", UserRole.Customer, phone: "0902222005",
              avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
              pref: "Giá rẻ, có wifi", life: "Sinh viên, Yên tĩnh, Sạch sẽ", looking: true),
            u(c6, "customer6@dormi.vn", "Đặng Thị Phương", UserRole.Customer, phone: "0902222006",
              avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80",
              pref: "Phòng riêng, yên tĩnh", life: "Đọc sách, Yên tĩnh, Dậy sớm", looking: true),
            u(c7, "customer7@dormi.vn", "Vũ Đức Giang", UserRole.Customer, phone: "0902222007",
              avatar: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=200&q=80",
              pref: "Studio, nội thất đầy đủ", life: "Freelancer, Cú đêm, Nghe nhạc"),
            u(c8, "customer8@dormi.vn", "Bùi Thị Hạnh", UserRole.Customer, phone: "0902222008",
              avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80",
              pref: "Gần chợ, thuận tiện", life: "Nấu ăn, Sạch sẽ, Thân thiện", looking: true),
            u(c9, "customer9@dormi.vn", "Ngô Quang Ích", UserRole.Customer, phone: "0902222009",
              avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
              pref: "Phòng máy lạnh", life: "Đi làm, Gọn gàng, Không hút thuốc"),
            u(c10, "customer10@dormi.vn", "Mai Thị Kim", UserRole.Customer, phone: "0902222010",
              avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
              pref: "An ninh, có thang máy", life: "Sinh viên, Yên tĩnh, Không thú cưng", looking: true),
            u(c11, "customer11@dormi.vn", "Trương Văn Long", UserRole.Customer, phone: "0902222011",
              avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
              pref: "Phòng rẻ, ở ghép", life: "Sinh viên, Chơi thể thao, Hòa đồng", looking: true),
            u(c12, "customer12@dormi.vn", "Lý Thị Mỹ", UserRole.Customer, phone: "0902222012",
              avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
              pref: "Gần trung tâm", life: "Đi làm, Gọn gàng, Thích nấu ăn"),
            u(c13, "customer13@dormi.vn", "Cao Hoàng Nam", UserRole.Customer, phone: "0902222013",
              avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80",
              pref: "Phòng studio hiện đại", life: "Designer, Cú đêm, Sáng tạo", looking: true),
            u(c14, "customer14@dormi.vn", "Đinh Thị Oanh", UserRole.Customer, phone: "0902222014",
              avatar: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=200&q=80",
              pref: "Phòng sạch, an ninh", life: "Y tá, Dậy sớm, Gọn gàng"),
        };

        db.Users.AddRange(users);

        // ============================================================
        // 2. ROOMS (20 rooms, 4 per landlord, with real Unsplash images)
        // ============================================================
        var roomData = new[]
        {
            // Landlord 1 - Trần Minh Tuấn (Q.1, Q.3)
            (ll1, "Studio Cao Cấp View Sông Sài Gòn", "Căn hộ studio hiện đại tầng 18, view trực diện sông Sài Gòn. Full nội thất nhập khẩu, bếp từ, máy giặt riêng.", 8500000m, 40.0, "Wifi, Máy lạnh, Tủ lạnh, Máy giặt, Ban công, Thang máy, Bảo vệ 24/7", "Studio", "88 Nguyễn Huệ, Q.1, TP.HCM", RoomStatus.Available,
             new[] { "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
                     "https://images.unsplash.com/photo-1502672260266-1c1de2d96674?auto=format&fit=crop&w=800&q=80" }),
            (ll1, "Phòng Trọ Sạch Sẽ Quận 3", "Phòng mới xây, sơn trắng thoáng mát, gần chợ Tân Định. Giờ giấc tự do, không chung chủ.", 4200000m, 22.0, "Wifi, Máy lạnh, Giờ giấc tự do, Không chung chủ", "Phòng trọ", "56 Hai Bà Trưng, Q.3, TP.HCM", RoomStatus.Available,
             new[] { "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
                     "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80" }),
            (ll1, "Căn Hộ Mini Trung Tâm Q.1", "Căn hộ mini đầy đủ tiện nghi ngay trung tâm Quận 1. Gần Bến Thành, Phố đi bộ.", 6800000m, 30.0, "Wifi, Máy lạnh, Tủ lạnh, Bếp riêng, Thang máy, Bảo vệ 24/7", "Căn hộ mini", "15 Lê Lợi, Q.1, TP.HCM", RoomStatus.Available,
             new[] { "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80",
                     "https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=800&q=80" }),
            (ll1, "Phòng Cho Thuê Giá Sinh Viên Q.3", "Phòng trọ giá rẻ dành cho sinh viên, gần ĐH Kinh tế. Có gác lửng, toilet riêng.", 2800000m, 18.0, "Wifi, Quạt trần, Giờ giấc tự do", "Phòng trọ", "290 Nam Kỳ Khởi Nghĩa, Q.3, TP.HCM", RoomStatus.PendingApproval,
             new[] { "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80" }),

            // Landlord 2 - Nguyễn Thị Hồng (Q.7, Q.4)
            (ll2, "Căn Hộ Phú Mỹ Hưng Full Nội Thất", "Căn hộ 2 phòng ngủ khu Phú Mỹ Hưng, an ninh tuyệt đối. Hồ bơi, gym, công viên.", 12000000m, 70.0, "Wifi, Máy lạnh, Tủ lạnh, Máy giặt, Ban công, Hồ bơi, Gym, Bảo vệ 24/7", "Căn hộ", "101 Nguyễn Lương Bằng, Q.7, TP.HCM", RoomStatus.Available,
             new[] { "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
                     "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
                     "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80" }),
            (ll2, "Phòng Trọ Gần RMIT Quận 7", "Phòng trọ thoáng mát gần RMIT, SC VivoCity. Khu an ninh, yên tĩnh. Phù hợp sinh viên.", 3800000m, 25.0, "Wifi, Máy lạnh, Giờ giấc tự do, Bãi giữ xe", "Phòng trọ", "45 Nguyễn Văn Linh, Q.7, TP.HCM", RoomStatus.Available,
             new[] { "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
                     "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80" }),
            (ll2, "Studio Hiện Đại Quận 4", "Studio mới xây 100%, view Landmark 81. Nội thất Bắc Âu tối giản, phù hợp người trẻ.", 5500000m, 28.0, "Wifi, Máy lạnh, Tủ lạnh, Máy giặt, Thang máy", "Studio", "12 Bến Vân Đồn, Q.4, TP.HCM", RoomStatus.Available,
             new[] { "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
                     "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80" }),
            (ll2, "Phòng Đẹp Khu Vực An Ninh Q.7", "Phòng trọ cao cấp trong khu dân cư an ninh. Có camera, bảo vệ, gần siêu thị.", 4500000m, 30.0, "Wifi, Máy lạnh, Bảo vệ 24/7, Bãi giữ xe, Nội thất đầy đủ", "Phòng trọ", "78 Huỳnh Tấn Phát, Q.7, TP.HCM", RoomStatus.Rented,
             new[] { "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80" }),

            // Landlord 3 - Phạm Văn Đức (Thủ Đức, Q.9)
            (ll3, "Phòng Trọ Gần ĐH FPT Thủ Đức", "Phòng mới, sạch sẽ, gần ĐH FPT và khu công nghệ cao. Phù hợp sinh viên IT.", 3200000m, 20.0, "Wifi tốc độ cao, Máy lạnh, Giờ giấc tự do, Bãi giữ xe", "Phòng trọ", "Lô E2 Khu CNC, TP.Thủ Đức", RoomStatus.Available,
             new[] { "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
                     "https://images.unsplash.com/photo-1585128792020-803d29415281?auto=format&fit=crop&w=800&q=80" }),
            (ll3, "Căn Hộ Studio Vinhomes Grand Park", "Studio đầy đủ nội thất trong Vinhomes Grand Park. Hồ bơi, gym, công viên 36ha.", 7000000m, 35.0, "Wifi, Máy lạnh, Tủ lạnh, Máy giặt, Hồ bơi, Gym, Thang máy", "Studio", "Vinhomes Grand Park, TP.Thủ Đức", RoomStatus.Available,
             new[] { "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80",
                     "https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?auto=format&fit=crop&w=800&q=80" }),
            (ll3, "Phòng Trọ Giá Rẻ Làng ĐH", "Phòng nhỏ gọn gần làng Đại học Thủ Đức. Tiện đi học, gần quán ăn sinh viên.", 2500000m, 16.0, "Wifi, Quạt trần", "Phòng trọ", "Khu phố 6, Linh Trung, TP.Thủ Đức", RoomStatus.PendingApproval,
             new[] { "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=800&q=80" }),
            (ll3, "Nhà Nguyên Căn 3PN Thủ Đức", "Nhà nguyên căn 3 phòng ngủ, sân rộng, phù hợp nhóm bạn hoặc gia đình nhỏ.", 15000000m, 120.0, "Wifi, Máy lạnh, Tủ lạnh, Máy giặt, Bếp riêng, Sân vườn, Bãi giữ xe", "Nhà nguyên căn", "25 Đường số 9, Hiệp Bình Phước, TP.Thủ Đức", RoomStatus.Available,
             new[] { "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
                     "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80" }),

            // Landlord 4 - Lê Thị Mai (Bình Thạnh, Gò Vấp) — chưa xác minh
            (ll4, "Phòng Trọ Bình Thạnh Gần Hàng Xanh", "Phòng mới sơn, toilet riêng, gần ngã tư Hàng Xanh. Đi Q.1 chỉ 10 phút.", 3500000m, 22.0, "Wifi, Máy lạnh, Giờ giấc tự do", "Phòng trọ", "112 Điện Biên Phủ, Bình Thạnh, TP.HCM", RoomStatus.PendingApproval,
             new[] { "https://images.unsplash.com/photo-1598928506311-c55ez637a572?auto=format&fit=crop&w=800&q=80" }),
            (ll4, "Căn Hộ Mini Gò Vấp Giá Tốt", "Căn hộ mini có gác lửng, khu dân cư yên tĩnh. Gần Emart, Lotte Mart.", 4000000m, 28.0, "Wifi, Máy lạnh, Tủ lạnh, Bếp riêng", "Căn hộ mini", "67 Quang Trung, Gò Vấp, TP.HCM", RoomStatus.PendingApproval,
             new[] { "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=800&q=80" }),
            (ll4, "Phòng Cho Thuê Ngắn Hạn Bình Thạnh", "Cho thuê ngắn hạn từ 1 tháng. Full nội thất, dọn vào ở ngay.", 5000000m, 25.0, "Wifi, Máy lạnh, Tủ lạnh, Nội thất đầy đủ, Bảo vệ 24/7", "Phòng trọ", "210 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM", RoomStatus.Hidden,
             new[] { "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80" }),
            (ll4, "Studio Penthouse Gò Vấp", "Phòng tầng thượng có sân thượng riêng, view thành phố. Phù hợp freelancer.", 6000000m, 35.0, "Wifi, Máy lạnh, Tủ lạnh, Máy giặt, Sân thượng riêng", "Studio", "300 Nguyễn Oanh, Gò Vấp, TP.HCM", RoomStatus.Available,
             new[] { "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=800&q=80",
                     "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=800&q=80" }),

            // Landlord 5 - Võ Hoàng Nam (Tân Bình, Tân Phú)
            (ll5, "Phòng Trọ Gần Sân Bay Tân Bình", "Phòng sạch sẽ cách sân bay 1km. Thuận tiện cho tiếp viên, phi công.", 3800000m, 24.0, "Wifi, Máy lạnh, Giờ giấc tự do, Bãi giữ xe", "Phòng trọ", "55 Cộng Hòa, Tân Bình, TP.HCM", RoomStatus.Available,
             new[] { "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
                     "https://images.unsplash.com/photo-1560440021-33f9b867541c?auto=format&fit=crop&w=800&q=80" }),
            (ll5, "Căn Hộ 2PN Tân Phú Mới 100%", "Căn hộ 2 phòng ngủ mới bàn giao, chưa qua sử dụng. Khu Celadon City.", 9500000m, 65.0, "Wifi, Máy lạnh, Tủ lạnh, Máy giặt, Ban công, Hồ bơi, Gym, Thang máy", "Căn hộ", "Celadon City, Tân Phú, TP.HCM", RoomStatus.Available,
             new[] { "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=800&q=80",
                     "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=800&q=80",
                     "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80" }),
            (ll5, "Phòng Trọ Giá Sinh Viên Tân Bình", "Phòng nhỏ giá rẻ cho sinh viên, gần ĐH Bách Khoa. Có gác xép.", 2200000m, 14.0, "Wifi, Quạt trần, Giờ giấc tự do", "Phòng trọ", "132 Hoàng Hoa Thám, Tân Bình, TP.HCM", RoomStatus.Available,
             new[] { "https://images.unsplash.com/photo-1559599238-308793637427?auto=format&fit=crop&w=800&q=80" }),
            (ll5, "Officetel Tân Bình Đa Năng", "Officetel vừa ở vừa làm việc, khu K300. Phù hợp startup, freelancer.", 7500000m, 45.0, "Wifi tốc độ cao, Máy lạnh, Tủ lạnh, Bàn làm việc, Thang máy, Bảo vệ 24/7", "Officetel", "K300, Tân Bình, TP.HCM", RoomStatus.Available,
             new[] { "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
                     "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80" }),
        };

        var rooms = new Room[roomData.Length];
        for (int i = 0; i < roomData.Length; i++)
        {
            var d = roomData[i];
            var room = new Room
            {
                Id = Guid.NewGuid(), LandlordId = d.Item1, Title = d.Item2, Description = d.Item3,
                Price = d.Item4, Area = d.Item5, Utilities = d.Item6, RoomType = d.Item7,
                Address = d.Item8, Status = d.Item9, CreatedAt = now.AddDays(-Random.Shared.Next(1, 60))
            };
            for (int j = 0; j < d.Item10.Length; j++)
            {
                room.Images.Add(new RoomImage { Id = Guid.NewGuid(), RoomId = room.Id, ImageUrl = d.Item10[j], IsPrimary = j == 0 });
            }
            rooms[i] = room;
        }
        db.Rooms.AddRange(rooms);

        // ============================================================
        // 3. ROOMMATE POSTS (8 customers looking for roommates)
        // ============================================================
        var rmPosts = new[]
        {
            new RoommatePost { Id = Guid.NewGuid(), CustomerId = c1, Title = "Tìm bạn ở ghép Q.7 gần RMIT", Description = "Mình SV năm 3 RMIT, sạch sẽ, lịch sự, tìm bạn cùng phòng.", Budget = 3500000, Location = "Quận 7, TP.HCM", MoveInDate = now.AddDays(14), GenderPreference = "Male", LifestyleTraits = "Yên tĩnh, Sạch sẽ, Dậy sớm", IsActive = true, CreatedAt = now.AddDays(-5) },
            new RoommatePost { Id = Guid.NewGuid(), CustomerId = c2, Title = "Tìm bạn nữ ở ghép Bình Thạnh", Description = "Tìm bạn nữ chia sẻ căn hộ 2PN. Mình đi làm 8-5, thích nấu ăn.", Budget = 4000000, Location = "Bình Thạnh, TP.HCM", MoveInDate = now.AddDays(7), GenderPreference = "Female", LifestyleTraits = "Sạch sẽ, Nấu ăn, Thân thiện", IsActive = true, CreatedAt = now.AddDays(-3) },
            new RoommatePost { Id = Guid.NewGuid(), CustomerId = c3, Title = "Tìm roommate Q.1 cho dev", Description = "Developer tìm roommate cùng vibe tech. Cú đêm, code đến 2h sáng là bình thường 😄", Budget = 5000000, Location = "Quận 1, TP.HCM", MoveInDate = now.AddDays(10), GenderPreference = "Any", LifestyleTraits = "Cú đêm, Chơi game, Thoải mái", IsActive = true, CreatedAt = now.AddDays(-7) },
            new RoommatePost { Id = Guid.NewGuid(), CustomerId = c4, Title = "Tìm bạn nữ ở ghép Thủ Đức", Description = "Mình nhân viên văn phòng, tìm bạn nữ sạch sẽ, gọn gàng.", Budget = 3000000, Location = "Thủ Đức, TP.HCM", MoveInDate = now.AddDays(5), GenderPreference = "Female", LifestyleTraits = "Dậy sớm, Tập gym, Gọn gàng", IsActive = true, CreatedAt = now.AddDays(-2) },
            new RoommatePost { Id = Guid.NewGuid(), CustomerId = c5, Title = "SV cần tìm bạn ở ghép giá rẻ", Description = "Mình sinh viên năm 2 UEH, budget thấp, cần bạn cùng share phòng.", Budget = 2000000, Location = "Quận 3, TP.HCM", MoveInDate = now.AddDays(3), GenderPreference = "Male", LifestyleTraits = "Sinh viên, Yên tĩnh, Sạch sẽ", IsActive = true, CreatedAt = now.AddDays(-1) },
            new RoommatePost { Id = Guid.NewGuid(), CustomerId = c6, Title = "Tìm bạn nữ share phòng Q.7", Description = "Mình thích đọc sách, yên tĩnh. Tìm bạn cùng lifestyle.", Budget = 3500000, Location = "Quận 7, TP.HCM", MoveInDate = now.AddDays(12), GenderPreference = "Female", LifestyleTraits = "Đọc sách, Yên tĩnh, Dậy sớm", IsActive = true, CreatedAt = now.AddDays(-4) },
            new RoommatePost { Id = Guid.NewGuid(), CustomerId = c8, Title = "Tìm roommate nữ Gò Vấp", Description = "Mình thích nấu ăn, sạch sẽ. Tìm bạn nữ cùng chia sẻ.", Budget = 3000000, Location = "Gò Vấp, TP.HCM", MoveInDate = now.AddDays(8), GenderPreference = "Female", LifestyleTraits = "Nấu ăn, Sạch sẽ, Thân thiện", IsActive = true, CreatedAt = now.AddDays(-6) },
            new RoommatePost { Id = Guid.NewGuid(), CustomerId = c13, Title = "Designer tìm roommate Tân Bình", Description = "Mình là designer freelance, hay làm đêm. Tìm bạn thoải mái, không ồn.", Budget = 4500000, Location = "Tân Bình, TP.HCM", MoveInDate = now.AddDays(15), GenderPreference = "Any", LifestyleTraits = "Cú đêm, Sáng tạo, Thoải mái", IsActive = true, CreatedAt = now.AddDays(-8) },
        };
        db.RoommatePosts.AddRange(rmPosts);

        // ============================================================
        // 4. FAVORITES (customers save rooms)
        // ============================================================
        db.FavoriteRooms.AddRange(
            new FavoriteRoom { CustomerId = c1, RoomId = rooms[0].Id, SavedAt = now.AddDays(-4) },
            new FavoriteRoom { CustomerId = c1, RoomId = rooms[5].Id, SavedAt = now.AddDays(-3) },
            new FavoriteRoom { CustomerId = c2, RoomId = rooms[1].Id, SavedAt = now.AddDays(-2) },
            new FavoriteRoom { CustomerId = c2, RoomId = rooms[4].Id, SavedAt = now.AddDays(-1) },
            new FavoriteRoom { CustomerId = c3, RoomId = rooms[0].Id, SavedAt = now.AddDays(-5) },
            new FavoriteRoom { CustomerId = c3, RoomId = rooms[2].Id, SavedAt = now.AddDays(-3) },
            new FavoriteRoom { CustomerId = c4, RoomId = rooms[8].Id, SavedAt = now.AddDays(-2) },
            new FavoriteRoom { CustomerId = c5, RoomId = rooms[3].Id, SavedAt = now.AddDays(-1) },
            new FavoriteRoom { CustomerId = c5, RoomId = rooms[10].Id, SavedAt = now.AddDays(-1) },
            new FavoriteRoom { CustomerId = c6, RoomId = rooms[5].Id, SavedAt = now.AddDays(-3) },
            new FavoriteRoom { CustomerId = c7, RoomId = rooms[15].Id, SavedAt = now.AddDays(-2) },
            new FavoriteRoom { CustomerId = c8, RoomId = rooms[1].Id, SavedAt = now.AddDays(-4) },
            new FavoriteRoom { CustomerId = c10, RoomId = rooms[4].Id, SavedAt = now.AddDays(-1) },
            new FavoriteRoom { CustomerId = c11, RoomId = rooms[8].Id, SavedAt = now.AddDays(-5) },
            new FavoriteRoom { CustomerId = c13, RoomId = rooms[19].Id, SavedAt = now.AddDays(-2) }
        );

        // ============================================================
        // 5. MESSAGES (conversations between customers and landlords)
        // ============================================================
        db.Messages.AddRange(
            new Message { Id = Guid.NewGuid(), SenderId = c1, ReceiverId = ll1, Content = "Chào anh, phòng Studio View Sông còn trống không ạ?", IsRead = true, SentAt = now.AddHours(-48) },
            new Message { Id = Guid.NewGuid(), SenderId = ll1, ReceiverId = c1, Content = "Chào em, phòng vẫn còn trống nhé. Em muốn đến xem phòng không?", IsRead = true, SentAt = now.AddHours(-47) },
            new Message { Id = Guid.NewGuid(), SenderId = c1, ReceiverId = ll1, Content = "Dạ em muốn xem chiều mai được không ạ?", IsRead = true, SentAt = now.AddHours(-46) },
            new Message { Id = Guid.NewGuid(), SenderId = ll1, ReceiverId = c1, Content = "Được em, chiều mai 3h anh có ở nhà. Em đến nhé!", IsRead = false, SentAt = now.AddHours(-45) },

            new Message { Id = Guid.NewGuid(), SenderId = c2, ReceiverId = ll2, Content = "Chị ơi, phòng gần RMIT còn không ạ? Em muốn thuê từ tháng tới.", IsRead = true, SentAt = now.AddHours(-72) },
            new Message { Id = Guid.NewGuid(), SenderId = ll2, ReceiverId = c2, Content = "Còn em ơi! Em ghé xem phòng bất cứ lúc nào nhé.", IsRead = true, SentAt = now.AddHours(-71) },

            new Message { Id = Guid.NewGuid(), SenderId = c3, ReceiverId = ll1, Content = "Anh ơi, căn mini Q.1 có thể thương lượng giá không ạ?", IsRead = true, SentAt = now.AddHours(-24) },
            new Message { Id = Guid.NewGuid(), SenderId = ll1, ReceiverId = c3, Content = "Giá đã tốt lắm rồi em, nhưng nếu ký 6 tháng anh giảm 200k/tháng nhé.", IsRead = false, SentAt = now.AddHours(-23) },

            new Message { Id = Guid.NewGuid(), SenderId = c5, ReceiverId = ll3, Content = "Phòng gần FPT Thủ Đức có gần trạm xe bus không anh?", IsRead = true, SentAt = now.AddHours(-36) },
            new Message { Id = Guid.NewGuid(), SenderId = ll3, ReceiverId = c5, Content = "Gần lắm em, đi bộ 3 phút là tới trạm.", IsRead = true, SentAt = now.AddHours(-35) },
            new Message { Id = Guid.NewGuid(), SenderId = c5, ReceiverId = ll3, Content = "Ok anh, em đặt lịch xem phòng nhé!", IsRead = false, SentAt = now.AddHours(-34) },

            new Message { Id = Guid.NewGuid(), SenderId = c7, ReceiverId = ll5, Content = "Phòng gần sân bay có yên tĩnh không anh? Em hay làm việc tại nhà.", IsRead = true, SentAt = now.AddHours(-12) },
            new Message { Id = Guid.NewGuid(), SenderId = ll5, ReceiverId = c7, Content = "Yên tĩnh em nhé, cách xa đường băng. Khu dân cư rất bình yên.", IsRead = false, SentAt = now.AddHours(-11) }
        );

        // ============================================================
        // 6. ROOM REVIEWS
        // ============================================================
        db.RoomReviews.AddRange(
            new RoomReview { Id = Guid.NewGuid(), RoomId = rooms[0].Id, CustomerId = c3, Rating = 5, Comment = "Phòng đẹp, view sông tuyệt vời! Nội thất xịn xò. Chủ nhà thân thiện.", CreatedAt = now.AddDays(-10) },
            new RoomReview { Id = Guid.NewGuid(), RoomId = rooms[0].Id, CustomerId = c1, Rating = 4, Comment = "Phòng rộng, sạch sẽ. Chỉ hơi ồn vào giờ cao điểm.", CreatedAt = now.AddDays(-8) },
            new RoomReview { Id = Guid.NewGuid(), RoomId = rooms[1].Id, CustomerId = c2, Rating = 4, Comment = "Phòng ổn, giá hợp lý. Khu vực thuận tiện đi lại.", CreatedAt = now.AddDays(-7) },
            new RoomReview { Id = Guid.NewGuid(), RoomId = rooms[4].Id, CustomerId = c4, Rating = 5, Comment = "Căn hộ Phú Mỹ Hưng đẳng cấp, tiện ích đầy đủ. 10 điểm!", CreatedAt = now.AddDays(-5) },
            new RoomReview { Id = Guid.NewGuid(), RoomId = rooms[4].Id, CustomerId = c10, Rating = 5, Comment = "An ninh tốt, hồ bơi đẹp, gym hiện đại. Rất hài lòng.", CreatedAt = now.AddDays(-3) },
            new RoomReview { Id = Guid.NewGuid(), RoomId = rooms[5].Id, CustomerId = c1, Rating = 4, Comment = "Gần RMIT, giá sinh viên. Phòng hơi nhỏ nhưng đủ dùng.", CreatedAt = now.AddDays(-6) },
            new RoomReview { Id = Guid.NewGuid(), RoomId = rooms[5].Id, CustomerId = c6, Rating = 3, Comment = "Phòng tạm được, wifi hơi chập chờn.", CreatedAt = now.AddDays(-4) },
            new RoomReview { Id = Guid.NewGuid(), RoomId = rooms[8].Id, CustomerId = c5, Rating = 5, Comment = "Gần FPT, đi học tiện lắm! Phòng mới, sạch sẽ.", CreatedAt = now.AddDays(-2) },
            new RoomReview { Id = Guid.NewGuid(), RoomId = rooms[9].Id, CustomerId = c7, Rating = 4, Comment = "Vinhomes đẹp, tiện ích nhiều. Giá hơi cao nhưng xứng đáng.", CreatedAt = now.AddDays(-1) },
            new RoomReview { Id = Guid.NewGuid(), RoomId = rooms[16].Id, CustomerId = c9, Rating = 4, Comment = "Gần sân bay, thuận tiện. Phòng sạch, chủ nhà nice.", CreatedAt = now.AddDays(-3) },
            new RoomReview { Id = Guid.NewGuid(), RoomId = rooms[19].Id, CustomerId = c13, Rating = 5, Comment = "Officetel K300 quá tiện cho freelancer. Wifi cực nhanh!", CreatedAt = now.AddDays(-1) }
        );

        // ============================================================
        // 7. VIEWING APPOINTMENTS
        // ============================================================
        db.ViewingAppointments.AddRange(
            new ViewingAppointment { Id = Guid.NewGuid(), CustomerId = c1, RoomId = rooms[0].Id, AppointmentDate = now.AddDays(1).Date.AddHours(15), Status = "Approved", Notes = "Em đến lúc 3h chiều nhé", CreatedAt = now.AddDays(-1) },
            new ViewingAppointment { Id = Guid.NewGuid(), CustomerId = c2, RoomId = rooms[5].Id, AppointmentDate = now.AddDays(2).Date.AddHours(10), Status = "Pending", Notes = "Em muốn xem phòng sáng thứ 7", CreatedAt = now.AddHours(-12) },
            new ViewingAppointment { Id = Guid.NewGuid(), CustomerId = c3, RoomId = rooms[2].Id, AppointmentDate = now.AddDays(-3).Date.AddHours(14), Status = "Completed", Notes = "Đã xem, đang cân nhắc", CreatedAt = now.AddDays(-5) },
            new ViewingAppointment { Id = Guid.NewGuid(), CustomerId = c4, RoomId = rooms[8].Id, AppointmentDate = now.AddDays(3).Date.AddHours(9), Status = "Pending", CreatedAt = now.AddHours(-6) },
            new ViewingAppointment { Id = Guid.NewGuid(), CustomerId = c5, RoomId = rooms[8].Id, AppointmentDate = now.AddDays(-1).Date.AddHours(16), Status = "Completed", Notes = "Phòng đẹp, sẽ ký hợp đồng", CreatedAt = now.AddDays(-3) },
            new ViewingAppointment { Id = Guid.NewGuid(), CustomerId = c7, RoomId = rooms[16].Id, AppointmentDate = now.AddDays(4).Date.AddHours(11), Status = "Approved", CreatedAt = now.AddDays(-1) },
            new ViewingAppointment { Id = Guid.NewGuid(), CustomerId = c10, RoomId = rooms[4].Id, AppointmentDate = now.AddDays(-7).Date.AddHours(14), Status = "Rejected", Notes = "Chủ nhà bận, hẹn lại", CreatedAt = now.AddDays(-10) },
            new ViewingAppointment { Id = Guid.NewGuid(), CustomerId = c13, RoomId = rooms[19].Id, AppointmentDate = now.AddDays(5).Date.AddHours(10), Status = "Pending", Notes = "Muốn xem officetel K300", CreatedAt = now.AddHours(-3) }
        );

        // ============================================================
        // 8. LANDLORD SUBSCRIPTIONS
        // ============================================================
        db.LandlordSubscriptions.AddRange(
            new LandlordSubscription { Id = Guid.NewGuid(), LandlordId = ll1, PlanName = "Pro", Price = 199000, StartDate = now.AddDays(-30), EndDate = now.AddDays(335), IsActive = true },
            new LandlordSubscription { Id = Guid.NewGuid(), LandlordId = ll2, PlanName = "Pro", Price = 199000, StartDate = now.AddDays(-60), EndDate = now.AddDays(305), IsActive = true },
            new LandlordSubscription { Id = Guid.NewGuid(), LandlordId = ll3, PlanName = "Enterprise", Price = 499000, StartDate = now.AddDays(-15), EndDate = now.AddDays(350), IsActive = true },
            new LandlordSubscription { Id = Guid.NewGuid(), LandlordId = ll5, PlanName = "Pro", Price = 199000, StartDate = now.AddDays(-45), EndDate = now.AddDays(320), IsActive = true },
            new LandlordSubscription { Id = Guid.NewGuid(), LandlordId = ll4, PlanName = "Free", Price = 0, StartDate = now.AddDays(-10), EndDate = now.AddDays(355), IsActive = true }
        );

        await db.SaveChangesAsync();
    }
}
