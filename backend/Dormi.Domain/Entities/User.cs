using System;
using System.Collections.Generic;
using Dormi.Domain.Enums;

namespace Dormi.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; }
    public bool IsVerified { get; set; } = false;
    public string? Preferences { get; set; }
    public string? Lifestyle { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigations
    public ICollection<Room> Rooms { get; set; } = new List<Room>();
    public ICollection<FavoriteRoom> FavoriteRooms { get; set; } = new List<FavoriteRoom>();
    public ICollection<Message> SentMessages { get; set; } = new List<Message>();
    public ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();
}
