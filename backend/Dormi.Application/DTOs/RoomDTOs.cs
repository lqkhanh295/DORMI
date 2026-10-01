using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Dormi.Domain.Enums;

namespace Dormi.Application.DTOs;

public class CreateRoomDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(5000)]
    public string Description { get; set; } = string.Empty;

    [Range(0, 1_000_000_000)]
    public decimal Price { get; set; }

    [Range(1, 10_000)]
    public double Area { get; set; }

    [MaxLength(1000)]
    public string Utilities { get; set; } = string.Empty;

    [MaxLength(100)]
    public string RoomType { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    [MaxLength(1000)]
    public string? Virtual3DUrl { get; set; }

    [MaxLength(20)]
    public List<string>? ImageUrls { get; set; }
}

public class UpdateRoomDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(5000)]
    public string Description { get; set; } = string.Empty;

    [Range(0, 1_000_000_000)]
    public decimal Price { get; set; }

    [Range(1, 10_000)]
    public double Area { get; set; }

    [MaxLength(1000)]
    public string Utilities { get; set; } = string.Empty;

    [MaxLength(100)]
    public string RoomType { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    [MaxLength(1000)]
    public string? Virtual3DUrl { get; set; }

    public RoomStatus Status { get; set; }

    [MaxLength(20)]
    public List<string>? ImageUrls { get; set; }
}

public class RoomImageDto
{
    public Guid Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
}

public class RoomResponseDto
{
    public Guid Id { get; set; }
    public Guid LandlordId { get; set; }
    public string LandlordName { get; set; } = string.Empty;
    public string? LandlordPhone { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public double Area { get; set; }
    public string Utilities { get; set; } = string.Empty;
    public string RoomType { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public double? DistanceKm { get; set; }
    public string? Virtual3DUrl { get; set; }
    public RoomStatus Status { get; set; }
    public bool IsVerifiedLandlord { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<RoomImageDto> Images { get; set; } = new();
}

public class RoomQueryFilterDto
{
    public string? Query { get; set; }
    public string? District { get; set; }
    public string? RoomType { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public double? RadiusKm { get; set; }
    public RoomStatus? Status { get; set; }
    public string? SortBy { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class CreateRoomReportDto
{
    public string Reason { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
}
