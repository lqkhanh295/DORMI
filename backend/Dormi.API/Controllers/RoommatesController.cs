using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Dormi.Application.DTOs;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Dormi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoommatesController : ControllerBase
{
    private readonly DormiDbContext _db;

    public RoommatesController(DormiDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetRoommatePosts(
        [FromQuery] string? location,
        [FromQuery] decimal? maxBudget,
        [FromQuery] string? genderPreference)
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

        var posts = await query
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new RoommatePostResponseDto
            {
                Id = r.Id,
                CustomerId = r.CustomerId,
                CustomerName = r.Customer.FullName,
                CustomerAvatar = r.Customer.AvatarUrl,
                Title = r.Title,
                Description = r.Description,
                Budget = r.Budget,
                Location = r.Location,
                MoveInDate = r.MoveInDate,
                GenderPreference = r.GenderPreference,
                LifestyleTraits = r.LifestyleTraits,
                IsActive = r.IsActive,
                MatchScore = 85.0,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return Ok(posts);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoommatePostById(Guid id)
    {
        var post = await _db.RoommatePosts
            .Include(r => r.Customer)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (post == null) return NotFound(new { message = "Không tìm thấy bài đăng ở ghép." });

        return Ok(new RoommatePostResponseDto
        {
            Id = post.Id,
            CustomerId = post.CustomerId,
            CustomerName = post.Customer.FullName,
            CustomerAvatar = post.Customer.AvatarUrl,
            Title = post.Title,
            Description = post.Description,
            Budget = post.Budget,
            Location = post.Location,
            MoveInDate = post.MoveInDate,
            GenderPreference = post.GenderPreference,
            LifestyleTraits = post.LifestyleTraits,
            IsActive = post.IsActive,
            MatchScore = 90.0,
            CreatedAt = post.CreatedAt
        });
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateRoommatePost([FromBody] CreateRoommatePostDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user == null || user.Role != UserRole.Customer)
        {
            return BadRequest(new { message = "Chỉ tài khoản Khách thuê mới có thể tạo bài đăng tìm người ở ghép." });
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

        _db.RoommatePosts.Add(post);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRoommatePostById), new { id = post.Id }, new { id = post.Id, message = "Đã tạo bài tìm người ở ghép thành công!" });
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRoommatePost(Guid id, [FromBody] CreateRoommatePostDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var post = await _db.RoommatePosts.FindAsync(id);
        if (post == null) return NotFound();

        if (post.CustomerId != userId) return Forbid();

        post.Title = dto.Title;
        post.Description = dto.Description;
        post.Budget = dto.Budget;
        post.Location = dto.Location;
        post.MoveInDate = dto.MoveInDate;
        post.GenderPreference = dto.GenderPreference;
        post.LifestyleTraits = dto.LifestyleTraits;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Cập nhật bài ở ghép thành công." });
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRoommatePost(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var post = await _db.RoommatePosts.FindAsync(id);
        if (post == null) return NotFound();

        if (post.CustomerId != userId) return Forbid();

        _db.RoommatePosts.Remove(post);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa bài đăng ở ghép." });
    }

    [Authorize]
    [HttpGet("recommendations")]
    public async Task<IActionResult> GetRecommendations()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var currentUser = await _db.Users.FindAsync(userId);
        var userLifestyle = currentUser?.Lifestyle?.ToLower() ?? "";

        var posts = await _db.RoommatePosts
            .Include(r => r.Customer)
            .Where(r => r.IsActive && r.CustomerId != userId && r.Customer.IsLookingForRoommate)
            .ToListAsync();

        var recommendations = posts.Select(post =>
        {
            double matchScore = CalculateMatchScore(userLifestyle, post.LifestyleTraits);
            return new RoommatePostResponseDto
            {
                Id = post.Id,
                CustomerId = post.CustomerId,
                CustomerName = post.Customer.FullName,
                CustomerAvatar = post.Customer.AvatarUrl,
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
        .OrderByDescending(r => r.MatchScore)
        .ToList();

        return Ok(recommendations);
    }

    public static double CalculateMatchScore(string userTraits, string candidateTraits)
    {
        if (string.IsNullOrWhiteSpace(userTraits) || string.IsNullOrWhiteSpace(candidateTraits))
        {
            return 75.0;
        }

        var uSet = userTraits.Split(',', ';', ' ').Where(s => !string.IsNullOrWhiteSpace(s)).Select(s => s.Trim().ToLower()).ToHashSet();
        var cSet = candidateTraits.Split(',', ';', ' ').Where(s => !string.IsNullOrWhiteSpace(s)).Select(s => s.Trim().ToLower()).ToHashSet();

        if (uSet.Count == 0 || cSet.Count == 0) return 75.0;

        int intersectCount = uSet.Intersect(cSet).Count();
        int unionCount = uSet.Union(cSet).Count();

        double jaccardRatio = (double)intersectCount / unionCount;
        return Math.Round(60.0 + (jaccardRatio * 40.0), 1);
    }
}
