using System;
using System.Collections.Generic;
using Dormi.Domain.Enums;

namespace Dormi.Application.DTOs;

// Admin DTOs
public class AdminStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalCustomers { get; set; }
    public int TotalLandlords { get; set; }
    public int TotalRooms { get; set; }
    public int PendingVerifications { get; set; }
    public int TotalAppointments { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class UserModerationDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsVerifiedLandlord { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class VerificationApprovalDto
{
    public bool Approved { get; set; }
}

// Roommate Matcher DTOs
public class CreateRoommatePostDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Budget { get; set; }
    public string Location { get; set; } = string.Empty;
    public DateTime MoveInDate { get; set; }
    public string GenderPreference { get; set; } = "Any";
    public string LifestyleTraits { get; set; } = string.Empty;
}

public class RoommatePostResponseDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerAvatar { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Budget { get; set; }
    public string Location { get; set; } = string.Empty;
    public DateTime MoveInDate { get; set; }
    public string GenderPreference { get; set; } = string.Empty;
    public string LifestyleTraits { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public double? MatchScore { get; set; } // AI match score (0-100%) or null if missing traits
    public DateTime CreatedAt { get; set; }
}

// Room Review DTOs
public class CreateReviewDto
{
    public int Rating { get; set; } // 1 to 5
    public string Comment { get; set; } = string.Empty;
}

public class ReviewResponseDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerAvatar { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class RoomReviewSummaryDto
{
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    public List<ReviewResponseDto> Reviews { get; set; } = new();
}

// Landlord Analytics & Billing DTOs
public class LandlordAnalyticsDto
{
    public int TotalListings { get; set; }
    public int ActiveListings { get; set; }
    public int TotalAppointments { get; set; }
    public int PendingAppointments { get; set; }
    public int TotalViews { get; set; }
    public double ConversionRate { get; set; }
}

public class SubscriptionDto
{
    public Guid Id { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
}

public class CheckoutDto
{
    public string PlanName { get; set; } = "Pro"; // Pro, Enterprise
}
