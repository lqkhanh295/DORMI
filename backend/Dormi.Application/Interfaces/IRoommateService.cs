using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;

namespace Dormi.Application.Interfaces;

public interface IRoommateService
{
    Task<ServiceResult<List<RoommatePostResponseDto>>> GetRoommatePostsAsync(string? location, decimal? maxBudget, string? genderPreference, Guid? currentUserId);
    Task<ServiceResult<RoommatePostResponseDto>> GetRoommatePostByIdAsync(Guid id, Guid? currentUserId);
    Task<ServiceResult<object>> CreateRoommatePostAsync(Guid userId, CreateRoommatePostDto dto);
    Task<ServiceResult<object>> UpdateRoommatePostAsync(Guid id, Guid userId, CreateRoommatePostDto dto);
    Task<ServiceResult<object>> DeleteRoommatePostAsync(Guid id, Guid userId);
    Task<ServiceResult<List<RoommatePostResponseDto>>> GetRecommendationsAsync(Guid userId);
}
