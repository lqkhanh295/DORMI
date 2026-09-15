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
    public string PaymentMethod { get; set; } = "VNPay"; // VNPay, MoMo, BankTransfer
}

// Notification DTOs
public class NotificationDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "System";
    public string? LinkUrl { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Verification DTOs
public class SubmitVerificationDto
{
    public string DocumentType { get; set; } = "CCCD"; // CCCD, BusinessLicense
    public string DocumentNumber { get; set; } = string.Empty;
    public string FrontImageUrl { get; set; } = string.Empty;
    public string BackImageUrl { get; set; } = string.Empty;
}

public class VerificationRequestDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public string DocumentNumber { get; set; } = string.Empty;
    public string FrontImageUrl { get; set; } = string.Empty;
    public string BackImageUrl { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public string? RejectReason { get; set; }
    public DateTime SubmittedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
}

public class ReviewVerificationDto
{
    public bool Approved { get; set; }
    public string? RejectReason { get; set; }
}

// Payment & Transaction DTOs
public class PaymentVerifyDto
{
    public string TransactionRef { get; set; } = string.Empty;
    public string? SecureHash { get; set; }
    public string? ResponseCode { get; set; }
    public string? PaymentMethod { get; set; }
    public bool Success { get; set; } = true;
}

public class PaymentTransactionDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? SubscriptionId { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string TransactionRef { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

// Real Lead Analytics DTOs
public class DailyLeadMetricDto
{
    public string Date { get; set; } = string.Empty;
    public int Views { get; set; }
    public int Saves { get; set; }
    public int Contacts { get; set; }
}

public class RoomLeadPerformanceDto
{
    public Guid RoomId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int Views { get; set; }
    public int Saves { get; set; }
    public int Contacts { get; set; }
}

public class RealLeadAnalyticsDto
{
    public int TotalViews { get; set; }
    public int TotalSaves { get; set; }
    public int TotalContacts { get; set; }
    public double SaveRate { get; set; }
    public double ContactRate { get; set; }
    public List<DailyLeadMetricDto> DailyMetrics { get; set; } = new();
    public List<RoomLeadPerformanceDto> TopRooms { get; set; } = new();
}

// Tenant Discovery DTOs
public class TenantDiscoveryDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Preferences { get; set; }
    public string? Lifestyle { get; set; }
    public double MatchScore { get; set; }
    public string? BudgetRange { get; set; }
}

// Tenant Review & Lease DTOs
public class CreateTenantReviewDto
{
    public Guid? LeaseId { get; set; }
    public Guid TenantId { get; set; }
    public int Rating { get; set; }
    public int PunctualityScore { get; set; } = 5;
    public int CleanlinessScore { get; set; } = 5;
    public int RespectScore { get; set; } = 5;
    public string Comment { get; set; } = string.Empty;
    public bool IsAnonymous { get; set; } = true;
}

public class TenantReviewDto
{
    public Guid Id { get; set; }
    public Guid LandlordId { get; set; }
    public string LandlordName { get; set; } = string.Empty;
    public Guid TenantId { get; set; }
    public int Rating { get; set; }
    public int PunctualityScore { get; set; }
    public int CleanlinessScore { get; set; }
    public int RespectScore { get; set; }
    public string Comment { get; set; } = string.Empty;
    public bool IsAnonymous { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class LeaseContractDto
{
    public Guid Id { get; set; }
    public Guid RoomId { get; set; }
    public string RoomTitle { get; set; } = string.Empty;
    public Guid LandlordId { get; set; }
    public string LandlordName { get; set; } = string.Empty;
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MonthlyRent { get; set; }
    public string Status { get; set; } = string.Empty;
}
