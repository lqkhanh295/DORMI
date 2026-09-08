using System;
using System.Collections.Generic;
using Dormi.Domain.Enums;

namespace Dormi.Application.DTOs;

public class CreateRoomDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public double Area { get; set; }
    public string Utilities { get; set; } = string.Empty;
    public string RoomType { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? Virtual3DUrl { get; set; }
    public List<string>? ImageUrls { get; set; }
}

public class UpdateRoomDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public double Area { get; set; }
    public string Utilities { get; set; } = string.Empty;
    public string RoomType { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? Virtual3DUrl { get; set; }
    public RoomStatus Status { get; set; }
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
    public string? Virtual3DUrl { get; set; }
    public RoomStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<RoomImageDto> Images { get; set; } = new();
}

public class RoomQueryFilterDto
{
    public string? Query { get; set; }
    public string? RoomType { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public RoomStatus? Status { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
