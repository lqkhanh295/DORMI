using System;

namespace Dormi.Application.DTOs;

// Viewing Appointments DTOs
public class CreateAppointmentDto
{
    public Guid RoomId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string? Notes { get; set; }
}

public class UpdateAppointmentStatusDto
{
    public string Status { get; set; } = string.Empty; // Approved, Rejected, Cancelled, Completed
}

public class AppointmentResponseDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public Guid RoomId { get; set; }
    public string RoomTitle { get; set; } = string.Empty;
    public string RoomAddress { get; set; } = string.Empty;
    public DateTime AppointmentDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Messaging DTOs
public class SendMessageDto
{
    public Guid ReceiverId { get; set; }
    public string Content { get; set; } = string.Empty;
}

public class MessageResponseDto
{
    public Guid Id { get; set; }
    public Guid SenderId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public Guid ReceiverId { get; set; }
    public string ReceiverName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime SentAt { get; set; }
}

public class ConversationDto
{
    public Guid OtherUserId { get; set; }
    public string OtherUserName { get; set; } = string.Empty;
    public string? OtherUserAvatar { get; set; }
    public string LastMessage { get; set; } = string.Empty;
    public DateTime LastMessageTime { get; set; }
    public int UnreadCount { get; set; }
}

// Profiles DTOs
public class CustomerProfileDto
{
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Preferences { get; set; }
    public string? Lifestyle { get; set; }
    public bool? IsLookingForRoommate { get; set; }
}

public class LandlordProfileDto
{
    public string? FullName { get; set; }
    public bool IsVerified { get; set; }
    public string? PhoneNumber { get; set; }
}
