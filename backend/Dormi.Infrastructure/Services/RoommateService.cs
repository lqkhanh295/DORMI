using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Dormi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Dormi.Infrastructure.Services;

public class RoommateService : IRoommateService
{
    private readonly DormiDbContext _db;

    public RoommateService(DormiDbContext db)
    {
        _db = db;
    }

    public async Task<ServiceResult<List<RoommatePostResponseDto>>> GetRoommatePostsAsync(
        string? location, 
        decimal? maxBudget, 
        string? genderPreference, 
        Guid? currentUserId)
    {
        var query = _db.RoommatePosts
            .Include(r => r.Customer)
            .Where(r => r.IsActive)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(location))
        {
            var loc = location.Trim().ToLower();
            query = query.Where(r => r.Location.ToLower().Contains(loc));
        }

        if (maxBudget.HasValue)
        {
            query = query.Where(r => r.Budget <= maxBudget.Value);
        }

        if (!string.IsNullOrWhiteSpace(genderPreference) && genderPreference != "Any")
        {
            query = query.Where(r => r.GenderPreference == "Any" || r.GenderPreference == genderPreference);
        }

        string userLifestyle = "";
        if (currentUserId.HasValue)
        {
            var currentUser = await _db.Users.FindAsync(currentUserId.Value);
            userLifestyle = currentUser?.Lifestyle?.ToLower() ?? "";
        }

        var rawPosts = await query
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var posts = rawPosts.Select(r => new RoommatePostResponseDto
        {
            Id = r.Id,
            CustomerId = r.CustomerId,
            CustomerName = r.Customer?.FullName ?? "Khách thuê",
            CustomerAvatar = r.Customer?.AvatarUrl,
            Title = r.Title,
            Description = r.Description,
            Budget = r.Budget,
            Location = r.Location,
            MoveInDate = r.MoveInDate,
            GenderPreference = r.GenderPreference,
            LifestyleTraits = r.LifestyleTraits,
            IsActive = r.IsActive,
            MatchScore = CalculateMatchScore(userLifestyle, r.LifestyleTraits),
            CreatedAt = r.CreatedAt
        }).ToList();

        return ServiceResult<List<RoommatePostResponseDto>>.Ok(posts);
    }

    public async Task<ServiceResult<RoommatePostResponseDto>> GetRoommatePostByIdAsync(Guid id, Guid? currentUserId)
    {
        var post = await _db.RoommatePosts
            .Include(r => r.Customer)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (post == null) return ServiceResult<RoommatePostResponseDto>.NotFound("Không tìm thấy bài đăng ở ghép.");

        string userLifestyle = "";
        if (currentUserId.HasValue)
        {
            var currentUser = await _db.Users.FindAsync(currentUserId.Value);
            userLifestyle = currentUser?.Lifestyle?.ToLower() ?? "";
        }

        return ServiceResult<RoommatePostResponseDto>.Ok(new RoommatePostResponseDto
        {
            Id = post.Id,
            CustomerId = post.CustomerId,
            CustomerName = post.Customer?.FullName ?? "Khách thuê",
            CustomerAvatar = post.Customer?.AvatarUrl,
            Title = post.Title,
            Description = post.Description,
            Budget = post.Budget,
            Location = post.Location,
            MoveInDate = post.MoveInDate,
            GenderPreference = post.GenderPreference,
            LifestyleTraits = post.LifestyleTraits,
            IsActive = post.IsActive,
            MatchScore = CalculateMatchScore(userLifestyle, post.LifestyleTraits),
            CreatedAt = post.CreatedAt
        });
    }

    public async Task<ServiceResult<object>> CreateRoommatePostAsync(Guid userId, CreateRoommatePostDto dto)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null || user.Role != UserRole.Customer)
        {
            return ServiceResult<object>.Fail("Chỉ tài khoản Khách thuê mới có thể tạo bài đăng tìm người ở ghép.", 400);
        }

        var post = new RoommatePost
        {
            Id = Guid.NewGuid(),
            CustomerId = userId,
            Title = dto.Title,
            Description = dto.Description,
            Budget = dto.Budget,
            Location = dto.Location,
            MoveInDate = dto.MoveInDate,
            GenderPreference = dto.GenderPreference,
            LifestyleTraits = dto.LifestyleTraits,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        user.IsLookingForRoommate = true;
        _db.RoommatePosts.Add(post);
        await _db.SaveChangesAsync();

        return ServiceResult<object>.Ok(new { id = post.Id, message = "Đã tạo bài tìm người ở ghép thành công!" }, 201);
    }

    public async Task<ServiceResult<object>> UpdateRoommatePostAsync(Guid id, Guid userId, CreateRoommatePostDto dto)
    {
        var post = await _db.RoommatePosts.FindAsync(id);
        if (post == null) return ServiceResult<object>.NotFound("Không tìm thấy bài đăng ở ghép.");

        if (post.CustomerId != userId) return ServiceResult<object>.Forbidden();

        post.Title = dto.Title;
        post.Description = dto.Description;
        post.Budget = dto.Budget;
        post.Location = dto.Location;
        post.MoveInDate = dto.MoveInDate;
        post.GenderPreference = dto.GenderPreference;
        post.LifestyleTraits = dto.LifestyleTraits;

        await _db.SaveChangesAsync();
        return ServiceResult<object>.Ok(new { message = "Cập nhật bài ở ghép thành công." });
    }

    public async Task<ServiceResult<object>> DeleteRoommatePostAsync(Guid id, Guid userId)
    {
        var post = await _db.RoommatePosts.FindAsync(id);
        if (post == null) return ServiceResult<object>.NotFound("Không tìm thấy bài đăng ở ghép.");

        if (post.CustomerId != userId) return ServiceResult<object>.Forbidden();

        _db.RoommatePosts.Remove(post);
        await _db.SaveChangesAsync();

        return ServiceResult<object>.Ok(new { message = "Đã xóa bài đăng ở ghép." });
    }

    public async Task<ServiceResult<List<RoommatePostResponseDto>>> GetRecommendationsAsync(Guid userId)
    {
        var currentUser = await _db.Users.FindAsync(userId);
        var userLifestyle = currentUser?.Lifestyle?.ToLower() ?? "";

        var posts = await _db.RoommatePosts
            .Include(r => r.Customer)
            .Where(r => r.IsActive && r.CustomerId != userId)
            .ToListAsync();

        var recommendations = posts.Select(post =>
        {
            double? matchScore = CalculateMatchScore(userLifestyle, post.LifestyleTraits);
            return new RoommatePostResponseDto
            {
                Id = post.Id,
                CustomerId = post.CustomerId,
                CustomerName = post.Customer?.FullName ?? "Khách thuê",
                CustomerAvatar = post.Customer?.AvatarUrl,
                Title = post.Title,
                Description = post.Description,
                Budget = post.Budget,
                Location = post.Location,
                MoveInDate = post.MoveInDate,
                GenderPreference = post.GenderPreference,
                LifestyleTraits = post.LifestyleTraits,
                IsActive = post.IsActive,
                MatchScore = matchScore,
                CreatedAt = post.CreatedAt
            };
        })
        .OrderByDescending(r => r.MatchScore ?? 0)
        .ToList();

        return ServiceResult<List<RoommatePostResponseDto>>.Ok(recommendations);
    }

    public static double? CalculateMatchScore(string userTraits, string candidateTraits)
    {
        if (string.IsNullOrWhiteSpace(userTraits) || string.IsNullOrWhiteSpace(candidateTraits))
        {
            return null;
        }

        var uSet = userTraits.Split(',', ';', ' ').Where(s => !string.IsNullOrWhiteSpace(s)).Select(s => s.Trim().ToLower()).ToHashSet();
        var cSet = candidateTraits.Split(',', ';', ' ').Where(s => !string.IsNullOrWhiteSpace(s)).Select(s => s.Trim().ToLower()).ToHashSet();

        if (uSet.Count == 0 || cSet.Count == 0) return null;

        int intersectCount = uSet.Intersect(cSet).Count();
        int unionCount = uSet.Union(cSet).Count();

        double jaccardRatio = (double)intersectCount / unionCount;
        return Math.Round(60.0 + (jaccardRatio * 40.0), 1);
    }
}
