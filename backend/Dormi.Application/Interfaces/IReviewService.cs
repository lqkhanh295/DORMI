using System;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;

namespace Dormi.Application.Interfaces;

public interface IReviewService
{
    Task<ServiceResult<RoomReviewSummaryDto>> GetRoomReviewsAsync(Guid roomId);
    Task<ServiceResult<object>> AddReviewAsync(Guid roomId, Guid userId, CreateReviewDto dto);
}
