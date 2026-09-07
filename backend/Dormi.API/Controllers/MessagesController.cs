using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Dormi.Application.DTOs;
using Dormi.Domain.Entities;
using Dormi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly DormiDbContext _db;

    public MessagesController(DormiDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var senderId)) return Unauthorized();

        if (senderId == dto.ReceiverId)
        {
            return BadRequest(new { message = "Bạn không thể tự gửi tin nhắn cho chính mình." });
        }

        var receiverExists = await _db.Users.AnyAsync(u => u.Id == dto.ReceiverId);
        if (!receiverExists) return NotFound(new { message = "Không tìm thấy người nhận." });

        var message = new Message
        {
            Id = Guid.NewGuid(),
            SenderId = senderId,
            ReceiverId = dto.ReceiverId,
            Content = dto.Content,
            IsRead = false,
            SentAt = DateTime.UtcNow
        };

        _db.Messages.Add(message);
        await _db.SaveChangesAsync();

        return Ok(new { id = message.Id, message = "Đã gửi tin nhắn." });
    }

    [HttpGet("{otherUserId}")]
    public async Task<IActionResult> GetConversationHistory(Guid otherUserId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var messages = await _db.Messages
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .Where(m => (m.SenderId == userId && m.ReceiverId == otherUserId) ||
                        (m.SenderId == otherUserId && m.ReceiverId == userId))
            .OrderBy(m => m.SentAt)
            .Select(m => new MessageResponseDto
            {
                Id = m.Id,
                SenderId = m.SenderId,
                SenderName = m.Sender.FullName,
                ReceiverId = m.ReceiverId,
                ReceiverName = m.Receiver.FullName,
                Content = m.Content,
                IsRead = m.IsRead,
                SentAt = m.SentAt
            })
            .ToListAsync();

        // Mark incoming messages as read
        var unreadIncoming = await _db.Messages
            .Where(m => m.SenderId == otherUserId && m.ReceiverId == userId && !m.IsRead)
            .ToListAsync();

        if (unreadIncoming.Count > 0)
        {
            foreach (var msg in unreadIncoming)
            {
                msg.IsRead = true;
            }
            await _db.SaveChangesAsync();
        }

        return Ok(messages);
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var messages = await _db.Messages
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .Where(m => m.SenderId == userId || m.ReceiverId == userId)
            .OrderByDescending(m => m.SentAt)
            .ToListAsync();

        var conversationGroups = messages
            .GroupBy(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
            .Select(g =>
            {
                var otherUserId = g.Key;
                var lastMsg = g.First();
                var otherUser = lastMsg.SenderId == userId ? lastMsg.Receiver : lastMsg.Sender;
                var unread = g.Count(m => m.ReceiverId == userId && !m.IsRead);

                return new ConversationDto
                {
                    OtherUserId = otherUserId,
                    OtherUserName = otherUser.FullName,
                    OtherUserAvatar = otherUser.AvatarUrl,
                    LastMessage = lastMsg.Content,
                    LastMessageTime = lastMsg.SentAt,
                    UnreadCount = unread
                };
            })
            .ToList();

        return Ok(conversationGroups);
    }
}
