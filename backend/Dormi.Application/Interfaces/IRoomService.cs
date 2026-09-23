using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;
using Microsoft.AspNetCore.Http;

namespace Dormi.Application.Interfaces;

public interface IRoomService
{
    Task<ServiceResult<object>> GetRoomsAsync(RoomQueryFilterDto filter, Guid? currentUserId, bool isAdmin, bool isLandlord);
    Task<ServiceResult<List<RoomResponseDto>>> GetFeaturedRoomsAsync(int limit = 6);
    Task<ServiceResult<RoomResponseDto>> GetRoomByIdAsync(Guid id, Guid? currentUserId, bool isAdmin, string? clientIp);
    Task<ServiceResult<RoomResponseDto>> CreateRoomAsync(CreateRoomDto dto, Guid landlordId);
    Task<ServiceResult<RoomResponseDto>> UpdateRoomAsync(Guid id, UpdateRoomDto dto, Guid currentUserId, bool isAdmin);
    Task<ServiceResult<object>> DeleteRoomAsync(Guid id, Guid currentUserId, bool isAdmin);
    Task<ServiceResult<List<RoomImageDto>>> GetRoomImagesAsync(Guid roomId);
    Task<ServiceResult<RoomImageDto>> AddRoomImageAsync(Guid roomId, IFormFile file, bool isPrimary, Guid currentUserId, bool isAdmin);
    Task<ServiceResult<object>> DeleteRoomImageAsync(Guid roomId, Guid imageId, Guid currentUserId, bool isAdmin);
    Task<ServiceResult<object>> SetPrimaryImageAsync(Guid roomId, Guid imageId, Guid currentUserId, bool isAdmin);
    Task<ServiceResult<object>> ReportRoomAsync(Guid roomId, CreateRoomReportDto dto, Guid reporterId);
    Task<ServiceResult<object>> TrackVirtualTourClickAsync(Guid roomId, Guid? currentUserId, string? clientIp);
    Task<ServiceResult<object>> UploadGeneralImageAsync(IFormFile file);
}
