using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Dormi.Infrastructure.Data;
using Dormi.Infrastructure.Hubs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Dormi.Infrastructure.Services;

public class RoomService : IRoomService
{
    private readonly DormiDbContext _db;
    private readonly IImageService _imageService;
    private readonly IHubContext<ChatHub> _hubContext;

    public RoomService(DormiDbContext db, IImageService imageService, IHubContext<ChatHub> hubContext)
    {
        _db = db;
        _imageService = imageService;
        _hubContext = hubContext;
    }

    private static bool IsValidImageFile(IFormFile file, out string? errorMessage)
    {
        if (file == null || file.Length == 0)
        {
            errorMessage = "Vui lòng chọn tập tin ảnh hợp lệ.";
            return false;
        }

        if (file.Length > 20 * 1024 * 1024)
        {
            errorMessage = "Dung lượng ảnh vượt quá giới hạn tối đa 20MB.";
            return false;
        }

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".heic", ".heif", ".svg" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!string.IsNullOrEmpty(ext) && !allowedExtensions.Contains(ext))
        {
            errorMessage = "Định dạng tập tin không được hỗ trợ. Chỉ chấp nhận các định dạng: .jpg, .jpeg, .png, .webp, .heic.";
            return false;
        }

        errorMessage = null;
        return true;
    }

    public async Task<ServiceResult<object>> GetRoomsAsync(RoomQueryFilterDto filter, Guid? currentUserId, bool isAdmin, bool isLandlord)
    {
        var query = _db.Rooms
            .Include(r => r.Landlord)
            .Include(r => r.Images)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Query))
        {
            var searchTerm = filter.Query.Trim().ToLower();
            query = query.Where(r => r.Title.ToLower().Contains(searchTerm) || 
                                     r.Address.ToLower().Contains(searchTerm) ||
                                     r.Description.ToLower().Contains(searchTerm));
        }

        if (!string.IsNullOrWhiteSpace(filter.RoomType))
        {
            query = query.Where(r => r.RoomType.ToLower() == filter.RoomType.Trim().ToLower());
        }

        if (filter.MinPrice.HasValue)
        {
            query = query.Where(r => r.Price >= filter.MinPrice.Value);
        }

        if (filter.MaxPrice.HasValue)
        {
            query = query.Where(r => r.Price <= filter.MaxPrice.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.District))
        {
            var districtTerm = filter.District.Trim().ToLower();
            query = query.Where(r => r.Address.ToLower().Contains(districtTerm));
        }

        Point? userPoint = null;
        if (filter.Latitude.HasValue && filter.Longitude.HasValue)
        {
            userPoint = new Point(filter.Longitude.Value, filter.Latitude.Value) { SRID = 4326 };
            if (filter.RadiusKm.HasValue && filter.RadiusKm.Value > 0)
            {
                double distanceMeters = filter.RadiusKm.Value * 1000.0;
                query = query.Where(r => r.Location != null && r.Location.IsWithinDistance(userPoint, distanceMeters));
            }
        }

        if (isAdmin)
        {
            if (filter.Status.HasValue)
            {
                query = query.Where(r => r.Status == filter.Status.Value);
            }
        }
        else if (isLandlord && currentUserId.HasValue && currentUserId.Value != Guid.Empty)
        {
            if (filter.Status.HasValue && (filter.Status.Value == RoomStatus.PendingApproval || filter.Status.Value == RoomStatus.Hidden))
            {
                query = query.Where(r => r.LandlordId == currentUserId.Value && r.Status == filter.Status.Value);
            }
            else if (filter.Status.HasValue)
            {
                query = query.Where(r => r.Status == filter.Status.Value);
            }
            else
            {
                query = query.Where(r => r.LandlordId == currentUserId.Value);
            }
        }
        else
        {
            if (filter.Status.HasValue && (filter.Status.Value == RoomStatus.PendingApproval || filter.Status.Value == RoomStatus.Hidden))
            {
                return ServiceResult<object>.Forbidden("Bạn không có quyền truy cập danh sách phòng ở trạng thái này.");
            }

            if (filter.Status.HasValue && filter.Status.Value == RoomStatus.Rented)
            {
                query = query.Where(r => r.Status == RoomStatus.Rented);
            }
            else
            {
                query = query.Where(r => r.Status == RoomStatus.Available);
            }
        }

        var totalItems = await query.CountAsync();
        var page = filter.Page < 1 ? 1 : filter.Page;
        var pageSize = filter.PageSize < 1 ? 10 : filter.PageSize;

        query = filter.SortBy switch
        {
            "price-asc" or "price-low" => query.OrderBy(r => r.Price),
            "price-desc" or "price-high" => query.OrderByDescending(r => r.Price),
            "oldest" => query.OrderBy(r => r.CreatedAt),
            "area-desc" => query.OrderByDescending(r => r.Area),
            "area-asc" => query.OrderBy(r => r.Area),
            "verified" => query.OrderByDescending(r => r.Landlord.IsVerified).ThenByDescending(r => r.CreatedAt),
            _ => query.OrderByDescending(r => r.CreatedAt)
        };

        var rooms = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new RoomResponseDto
            {
                Id = r.Id,
                LandlordId = r.LandlordId,
                LandlordName = r.Landlord.FullName,
                LandlordPhone = r.Landlord.PhoneNumber,
                Title = r.Title,
                Description = r.Description,
                Price = r.Price,
                Area = r.Area,
                Utilities = r.Utilities,
                RoomType = r.RoomType,
                Address = r.Address,
                Latitude = r.Latitude,
                Longitude = r.Longitude,
                DistanceKm = (userPoint != null && r.Location != null) ? Math.Round(r.Location.Distance(userPoint) / 1000.0, 2) : null,
                Virtual3DUrl = r.Virtual3DUrl,
                Status = r.Status,
                IsVerifiedLandlord = r.Landlord.IsVerified,
                CreatedAt = r.CreatedAt,
                Images = r.Images.Select(img => new RoomImageDto
                {
                    Id = img.Id,
                    ImageUrl = img.ImageUrl,
                    IsPrimary = img.IsPrimary
                }).ToList()
            })
            .ToListAsync();

        return ServiceResult<object>.Ok(new
        {
            TotalItems = totalItems,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalItems / pageSize),
            Data = rooms
        });
    }

    public async Task<ServiceResult<List<RoomResponseDto>>> GetFeaturedRoomsAsync(int limit = 6)
    {
        var featured = await _db.Rooms
            .Include(r => r.Landlord)
            .Include(r => r.Images)
            .Where(r => r.Status == RoomStatus.Available)
            .OrderByDescending(r => r.Landlord.IsVerified)
            .ThenByDescending(r => r.CreatedAt)
            .Take(limit)
            .Select(r => new RoomResponseDto
            {
                Id = r.Id,
                LandlordId = r.LandlordId,
                LandlordName = r.Landlord.FullName,
                LandlordPhone = r.Landlord.PhoneNumber,
                Title = r.Title,
                Description = r.Description,
                Price = r.Price,
                Area = r.Area,
                Utilities = r.Utilities,
                RoomType = r.RoomType,
                Address = r.Address,
                Latitude = r.Latitude,
                Longitude = r.Longitude,
                DistanceKm = null,
                Virtual3DUrl = r.Virtual3DUrl,
                Status = r.Status,
                IsVerifiedLandlord = r.Landlord.IsVerified,
                CreatedAt = r.CreatedAt,
                Images = r.Images.Select(img => new RoomImageDto
                {
                    Id = img.Id,
                    ImageUrl = img.ImageUrl,
                    IsPrimary = img.IsPrimary
                }).ToList()
            })
            .ToListAsync();

        return ServiceResult<List<RoomResponseDto>>.Ok(featured);
    }

    public async Task<ServiceResult<RoomResponseDto>> GetRoomByIdAsync(Guid id, Guid? currentUserId, bool isAdmin, string? clientIp)
    {
        var room = await _db.Rooms
            .Include(r => r.Landlord)
            .Include(r => r.Images)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (room == null) return ServiceResult<RoomResponseDto>.NotFound("Không tìm thấy phòng trọ.");

        if (!isAdmin && room.LandlordId != currentUserId)
        {
            if (room.Status != RoomStatus.Available && room.Status != RoomStatus.Rented)
            {
                return ServiceResult<RoomResponseDto>.NotFound("Phòng trọ này hiện chưa được công khai.");
            }
        }

        try
        {
            var ip = clientIp ?? "unknown";
            var cooldownThreshold = DateTime.UtcNow.AddMinutes(-30);
            var isDuplicateView = await _db.RoomViews.AnyAsync(v =>
                v.RoomId == id &&
                v.EventType == "DetailView" &&
                v.CreatedAt >= cooldownThreshold &&
                ((currentUserId.HasValue && v.ViewerId == currentUserId.Value) || (!currentUserId.HasValue && v.IpAddress == ip))
            );

            if (!isDuplicateView)
            {
                _db.RoomViews.Add(new RoomView
                {
                    Id = Guid.NewGuid(),
                    RoomId = id,
                    ViewerId = currentUserId,
                    EventType = "DetailView",
                    IpAddress = ip,
                    CreatedAt = DateTime.UtcNow
                });
                await _db.SaveChangesAsync();
            }
        }
        catch
        {
            // Suppress analytics failure
        }

        var dto = new RoomResponseDto
        {
            Id = room.Id,
            LandlordId = room.LandlordId,
            LandlordName = room.Landlord?.FullName ?? "Chủ phòng",
            LandlordPhone = room.Landlord?.PhoneNumber,
            Title = room.Title,
            Description = room.Description,
            Price = room.Price,
            Area = room.Area,
            Utilities = room.Utilities,
            RoomType = room.RoomType,
            Address = room.Address,
            Latitude = room.Latitude,
            Longitude = room.Longitude,
            DistanceKm = null,
            Virtual3DUrl = room.Virtual3DUrl,
            Status = room.Status,
            IsVerifiedLandlord = room.Landlord?.IsVerified ?? false,
            CreatedAt = room.CreatedAt,
            Images = room.Images.Select(img => new RoomImageDto
            {
                Id = img.Id,
                ImageUrl = img.ImageUrl,
                IsPrimary = img.IsPrimary
            }).ToList()
        };

        return ServiceResult<RoomResponseDto>.Ok(dto);
    }

    public async Task<ServiceResult<RoomResponseDto>> CreateRoomAsync(CreateRoomDto dto, Guid landlordId)
    {
        var user = await _db.Users.FindAsync(landlordId);
        if (user == null || user.Role != UserRole.Landlord)
        {
            return ServiceResult<RoomResponseDto>.Fail("Tài khoản của bạn chưa phải là Chủ trọ.", 400);
        }

        if (!user.IsVerified)
        {
            return ServiceResult<RoomResponseDto>.Fail("Tài khoản Chủ trọ của bạn chưa được xác minh danh tính. Vui lòng gửi yêu cầu xác minh trước khi đăng tin.", 400);
        }

        Point? locationPoint = null;
        if (dto.Latitude.HasValue && dto.Longitude.HasValue)
        {
            locationPoint = new Point(dto.Longitude.Value, dto.Latitude.Value) { SRID = 4326 };
        }

        var room = new Room
        {
            Id = Guid.NewGuid(),
            LandlordId = landlordId,
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Price = dto.Price,
            Area = dto.Area,
            Utilities = dto.Utilities?.Trim() ?? string.Empty,
            RoomType = dto.RoomType.Trim(),
            Address = dto.Address.Trim(),
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            Location = locationPoint,
            Virtual3DUrl = dto.Virtual3DUrl,
            Status = RoomStatus.PendingApproval,
            CreatedAt = DateTime.UtcNow
        };

        if (dto.ImageUrls != null && dto.ImageUrls.Count > 0)
        {
            for (int i = 0; i < dto.ImageUrls.Count; i++)
            {
                room.Images.Add(new RoomImage
                {
                    Id = Guid.NewGuid(),
                    RoomId = room.Id,
                    ImageUrl = dto.ImageUrls[i],
                    IsPrimary = i == 0
                });
            }
        }

        _db.Rooms.Add(room);
        await _db.SaveChangesAsync();

        try
        {
            await _hubContext.Clients.Group("admins").SendAsync("NewRoomPending", new
            {
                roomId = room.Id,
                title = room.Title,
                landlordId = room.LandlordId,
                createdAt = room.CreatedAt
            });
        }
        catch
        {
            // Suppress real-time notify failure
        }

        var responseDto = new RoomResponseDto
        {
            Id = room.Id,
            LandlordId = room.LandlordId,
            Title = room.Title,
            Description = room.Description,
            Price = room.Price,
            Area = room.Area,
            Utilities = room.Utilities,
            RoomType = room.RoomType,
            Address = room.Address,
            Latitude = room.Latitude,
            Longitude = room.Longitude,
            DistanceKm = null,
            Virtual3DUrl = room.Virtual3DUrl,
            Status = room.Status,
            CreatedAt = room.CreatedAt,
            Images = room.Images.Select(img => new RoomImageDto
            {
                Id = img.Id,
                ImageUrl = img.ImageUrl,
                IsPrimary = img.IsPrimary
            }).ToList()
        };

        return ServiceResult<RoomResponseDto>.Ok(responseDto, 201);
    }

    public async Task<ServiceResult<RoomResponseDto>> UpdateRoomAsync(Guid id, UpdateRoomDto dto, Guid currentUserId, bool isAdmin)
    {
        var room = await _db.Rooms.Include(r => r.Images).Include(r => r.Landlord).FirstOrDefaultAsync(r => r.Id == id);
        if (room == null) return ServiceResult<RoomResponseDto>.NotFound("Không tìm thấy phòng trọ.");

        if (!isAdmin && room.LandlordId != currentUserId)
        {
            return ServiceResult<RoomResponseDto>.Forbidden();
        }

        bool criticalFieldsChanged = (room.Title != dto.Title) ||
                                     (room.Price != dto.Price) ||
                                     (room.Address != dto.Address) ||
                                     (room.Description != dto.Description);

        if (room.Status == RoomStatus.Available && criticalFieldsChanged)
        {
            room.Status = RoomStatus.PendingApproval;
            _db.Notifications.Add(new Notification
            {
                Id = Guid.NewGuid(),
                UserId = currentUserId,
                Title = "Tin đăng phòng cần kiểm duyệt lại",
                Message = $"Tin đăng '{room.Title}' đã được cập nhật thông tin quan trọng và chuyển về trạng thái chờ duyệt.",
                Type = "System",
                LinkUrl = $"/rooms/{room.Id}",
                CreatedAt = DateTime.UtcNow
            });
        }
        else if (dto.Status != room.Status)
        {
            if (room.Status == RoomStatus.PendingApproval)
            {
                if (dto.Status == RoomStatus.Available)
                {
                    return ServiceResult<RoomResponseDto>.Fail("Phòng trọ đang chờ duyệt không thể tự chuyển sang trạng thái 'Đang cho thuê'.", 400);
                }
                room.Status = RoomStatus.PendingApproval;
            }
            else if (room.Status == RoomStatus.Available || room.Status == RoomStatus.Rented || room.Status == RoomStatus.Hidden)
            {
                if (dto.Status == RoomStatus.Available || dto.Status == RoomStatus.Rented || dto.Status == RoomStatus.Hidden)
                {
                    room.Status = dto.Status;
                }
                else
                {
                    return ServiceResult<RoomResponseDto>.Fail("Chủ trọ chỉ có thể chuyển đổi trạng thái giữa 'Đang cho thuê', 'Đã thuê' hoặc 'Ẩn tin'.", 400);
                }
            }
        }

        room.Title = dto.Title;
        room.Description = dto.Description;
        room.Price = dto.Price;
        room.Area = dto.Area;
        room.Utilities = dto.Utilities;
        room.RoomType = dto.RoomType;
        room.Address = dto.Address;
        room.Virtual3DUrl = dto.Virtual3DUrl;

        if (dto.Latitude.HasValue && dto.Longitude.HasValue)
        {
            room.Latitude = dto.Latitude;
            room.Longitude = dto.Longitude;
            room.Location = new Point(dto.Longitude.Value, dto.Latitude.Value) { SRID = 4326 };
        }

        if (dto.ImageUrls != null)
        {
            await _db.RoomImages.Where(img => img.RoomId == id).ExecuteDeleteAsync();

            if (dto.ImageUrls.Count > 0)
            {
                var newImages = dto.ImageUrls.Select((url, index) => new RoomImage
                {
                    Id = Guid.NewGuid(),
                    RoomId = room.Id,
                    ImageUrl = url,
                    IsPrimary = index == 0
                }).ToList();

                _db.RoomImages.AddRange(newImages);
            }
        }

        await _db.SaveChangesAsync();

        if (room.Status == RoomStatus.PendingApproval)
        {
            try
            {
                await _hubContext.Clients.Group("admins").SendAsync("NewRoomPendingApproval", new
                {
                    roomId = room.Id.ToString(),
                    title = room.Title,
                    landlordId = room.LandlordId.ToString(),
                    landlordName = room.Landlord?.FullName ?? "Chủ trọ",
                    price = room.Price,
                    address = room.Address,
                    createdAt = DateTime.UtcNow.ToString("o")
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SignalR Room Re-moderation Notice]: {ex.Message}");
            }
        }

        var responseDto = new RoomResponseDto
        {
            Id = room.Id,
            LandlordId = room.LandlordId,
            LandlordName = room.Landlord?.FullName ?? "",
            LandlordPhone = room.Landlord?.PhoneNumber,
            Title = room.Title,
            Description = room.Description,
            Price = room.Price,
            Area = room.Area,
            Utilities = room.Utilities,
            RoomType = room.RoomType,
            Address = room.Address,
            Latitude = room.Latitude,
            Longitude = room.Longitude,
            Virtual3DUrl = room.Virtual3DUrl,
            Status = room.Status,
            IsVerifiedLandlord = room.Landlord?.IsVerified ?? false,
            CreatedAt = room.CreatedAt,
            Images = room.Images.Select(img => new RoomImageDto
            {
                Id = img.Id,
                ImageUrl = img.ImageUrl,
                IsPrimary = img.IsPrimary
            }).ToList()
        };

        return ServiceResult<RoomResponseDto>.Ok(responseDto);
    }

    public async Task<ServiceResult<object>> DeleteRoomAsync(Guid id, Guid currentUserId, bool isAdmin)
    {
        var room = await _db.Rooms.FindAsync(id);
        if (room == null) return ServiceResult<object>.NotFound("Không tìm thấy phòng trọ.");

        if (!isAdmin && room.LandlordId != currentUserId)
        {
            return ServiceResult<object>.Forbidden();
        }

        _db.Rooms.Remove(room);
        await _db.SaveChangesAsync();

        return ServiceResult<object>.Ok(new { message = "Đã xoá phòng trọ thành công." });
    }

    public async Task<ServiceResult<List<RoomImageDto>>> GetRoomImagesAsync(Guid roomId)
    {
        var images = await _db.RoomImages
            .Where(img => img.RoomId == roomId)
            .Select(img => new RoomImageDto
            {
                Id = img.Id,
                ImageUrl = img.ImageUrl,
                IsPrimary = img.IsPrimary
            })
            .ToListAsync();

        return ServiceResult<List<RoomImageDto>>.Ok(images);
    }

    public async Task<ServiceResult<RoomImageDto>> AddRoomImageAsync(Guid roomId, IFormFile file, bool isPrimary, Guid currentUserId, bool isAdmin)
    {
        var room = await _db.Rooms.Include(r => r.Images).FirstOrDefaultAsync(r => r.Id == roomId);
        if (room == null) return ServiceResult<RoomImageDto>.NotFound("Không tìm thấy phòng trọ.");

        if (!isAdmin && room.LandlordId != currentUserId)
        {
            return ServiceResult<RoomImageDto>.Forbidden();
        }

        if (!IsValidImageFile(file, out var error))
        {
            return ServiceResult<RoomImageDto>.Fail(error ?? "Ảnh không hợp lệ.", 400);
        }

        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);
        memoryStream.Position = 0;

        var imageUrl = await _imageService.UploadImageAsync(memoryStream, file.FileName);
        if (string.IsNullOrEmpty(imageUrl) || imageUrl.Contains("unsplash.com"))
        {
            var bytes = memoryStream.ToArray();
            var ext = Path.GetExtension(file.FileName).TrimStart('.').ToLowerInvariant();
            var mime = string.IsNullOrEmpty(file.ContentType) ? $"image/{ext}" : file.ContentType;
            imageUrl = $"data:{mime};base64,{Convert.ToBase64String(bytes)}";
        }

        if (isPrimary)
        {
            foreach (var img in room.Images)
            {
                img.IsPrimary = false;
            }
        }

        var roomImage = new RoomImage
        {
            Id = Guid.NewGuid(),
            RoomId = roomId,
            ImageUrl = imageUrl,
            IsPrimary = isPrimary || room.Images.Count == 0
        };

        _db.RoomImages.Add(roomImage);
        await _db.SaveChangesAsync();

        return ServiceResult<RoomImageDto>.Ok(new RoomImageDto
        {
            Id = roomImage.Id,
            ImageUrl = roomImage.ImageUrl,
            IsPrimary = roomImage.IsPrimary
        });
    }

    public async Task<ServiceResult<object>> DeleteRoomImageAsync(Guid roomId, Guid imageId, Guid currentUserId, bool isAdmin)
    {
        var room = await _db.Rooms.FindAsync(roomId);
        if (room == null) return ServiceResult<object>.NotFound("Không tìm thấy phòng.");

        if (!isAdmin && room.LandlordId != currentUserId)
        {
            return ServiceResult<object>.Forbidden();
        }

        var roomImage = await _db.RoomImages.FirstOrDefaultAsync(img => img.Id == imageId && img.RoomId == roomId);
        if (roomImage == null) return ServiceResult<object>.NotFound("Không tìm thấy ảnh.");

        _db.RoomImages.Remove(roomImage);
        await _db.SaveChangesAsync();

        return ServiceResult<object>.Ok(new { message = "Đã xoá ảnh khỏi phòng thành công." });
    }

    public async Task<ServiceResult<object>> SetPrimaryImageAsync(Guid roomId, Guid imageId, Guid currentUserId, bool isAdmin)
    {
        var room = await _db.Rooms.Include(r => r.Images).FirstOrDefaultAsync(r => r.Id == roomId);
        if (room == null) return ServiceResult<object>.NotFound("Không tìm thấy phòng trọ.");

        if (!isAdmin && room.LandlordId != currentUserId)
        {
            return ServiceResult<object>.Forbidden();
        }

        var targetImage = room.Images.FirstOrDefault(img => img.Id == imageId);
        if (targetImage == null) return ServiceResult<object>.NotFound("Không tìm thấy hình ảnh này trong phòng.");

        foreach (var img in room.Images)
        {
            img.IsPrimary = img.Id == imageId;
        }

        await _db.SaveChangesAsync();
        return ServiceResult<object>.Ok(new { message = "Đã đặt làm ảnh chính thành công." });
    }

    public async Task<ServiceResult<object>> ReportRoomAsync(Guid roomId, CreateRoomReportDto dto, Guid reporterId)
    {
        var roomExists = await _db.Rooms.AnyAsync(r => r.Id == roomId);
        if (!roomExists) return ServiceResult<object>.NotFound("Không tìm thấy phòng trọ.");

        if (string.IsNullOrWhiteSpace(dto.Reason))
        {
            return ServiceResult<object>.Fail("Vui lòng chọn lý do báo cáo.", 400);
        }

        var report = new RoomReport
        {
            Id = Guid.NewGuid(),
            RoomId = roomId,
            ReporterId = reporterId,
            Reason = dto.Reason.Trim(),
            Details = dto.Details?.Trim() ?? string.Empty,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _db.RoomReports.Add(report);
        await _db.SaveChangesAsync();

        return ServiceResult<object>.Ok(new { message = "Gửi báo cáo thành công. Ban quản trị sẽ tiến hành xác minh.", reportId = report.Id });
    }

    public async Task<ServiceResult<object>> TrackVirtualTourClickAsync(Guid roomId, Guid? currentUserId, string? clientIp)
    {
        var room = await _db.Rooms.FindAsync(roomId);
        if (room == null) return ServiceResult<object>.NotFound("Không tìm thấy phòng trọ.");

        try
        {
            _db.RoomViews.Add(new RoomView
            {
                Id = Guid.NewGuid(),
                RoomId = roomId,
                ViewerId = currentUserId,
                EventType = "VirtualTourClick",
                IpAddress = clientIp ?? "unknown",
                CreatedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
        }
        catch
        {
            // Suppress analytics failure
        }

        return ServiceResult<object>.Ok(new { message = "Ghi nhận lượt trải nghiệm 3D thành công." });
    }

    public async Task<ServiceResult<object>> UploadGeneralImageAsync(IFormFile file)
    {
        if (!IsValidImageFile(file, out var error))
        {
            return ServiceResult<object>.Fail(error ?? "Tập tin ảnh không hợp lệ.", 400);
        }

        try
        {
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            memoryStream.Position = 0;

            var imageUrl = await _imageService.UploadImageAsync(memoryStream, file.FileName);
            if (string.IsNullOrEmpty(imageUrl) || imageUrl.Contains("unsplash.com"))
            {
                var bytes = memoryStream.ToArray();
                var ext = Path.GetExtension(file.FileName).TrimStart('.').ToLowerInvariant();
                var mime = string.IsNullOrEmpty(file.ContentType) ? $"image/{ext}" : file.ContentType;
                imageUrl = $"data:{mime};base64,{Convert.ToBase64String(bytes)}";
            }

            return ServiceResult<object>.Ok(new { imageUrl });
        }
        catch (Exception ex)
        {
            return ServiceResult<object>.Fail($"Tải ảnh thất bại: {ex.Message}", 400);
        }
    }
}
