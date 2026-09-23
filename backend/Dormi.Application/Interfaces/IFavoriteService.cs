using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;

namespace Dormi.Application.Interfaces;

public interface IFavoriteService
{
    Task<ServiceResult<List<RoomResponseDto>>> GetFavoritesAsync(Guid userId);
    Task<ServiceResult<object>> AddFavoriteAsync(Guid userId, Guid roomId);
    Task<ServiceResult<object>> RemoveFavoriteAsync(Guid userId, Guid roomId);
}
