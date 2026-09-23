using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Dormi.Domain.Entities;
using Dormi.Infrastructure.Data;
using Dormi.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Dormi.Infrastructure.Services;

public class MessageService : IMessageService
{
    private readonly DormiDbContext _db;
    private readonly IHubContext<ChatHub> _hubContext;

    public MessageService(DormiDbContext db, IHubContext<ChatHub> hubContext)
    {
        _db = db;
        _hubContext = hubContext;
    }

    public async Task<ServiceResult<object>> SendMessageAsync(Guid senderId, SendMessageDto dto)
    {
        if (senderId == dto.ReceiverId)
        {
            return ServiceResult<object>.Fail("Bạn không thể tự gửi tin nhắn cho chính mình.", 400);
        }

        var receiverExists = await _db.Users.AnyAsync(u => u.Id == dto.ReceiverId);
        if (!receiverExists) return ServiceResult<object>.NotFound("Không tìm thấy người nhận.");

        var sender = await _db.Users.FindAsync(senderId);

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

        var messagePayload = new
        {
            id = message.Id.ToString(),
            senderId = message.SenderId.ToString(),
            senderName = sender?.FullName ?? "Người dùng",
            receiverId = message.ReceiverId.ToString(),
            text = message.Content,
            timestamp = message.SentAt.ToString("o")
        };

        try
        {
            await _hubContext.Clients.Group(dto.ReceiverId.ToString().ToLower())
                .SendAsync("ReceiveMessage", messagePayload);
            await _hubContext.Clients.Group(senderId.ToString().ToLower())
                .SendAsync("ReceiveMessage", messagePayload);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SignalR Notification Notice]: {ex.Message}");
        }

        return ServiceResult<object>.Ok(new { id = message.Id, message = "Đã gửi tin nhắn.", data = messagePayload });
    }

    public async Task<ServiceResult<List<MessageResponseDto>>> GetConversationHistoryAsync(Guid userId, Guid otherUserId)
    {
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

        return ServiceResult<List<MessageResponseDto>>.Ok(messages);
    }

    public async Task<ServiceResult<List<ConversationDto>>> GetConversationsAsync(Guid userId)
    {
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
                    OtherUserName = otherUser?.FullName ?? "Người dùng",
                    OtherUserAvatar = otherUser?.AvatarUrl,
                    LastMessage = lastMsg.Content,
                    LastMessageTime = lastMsg.SentAt,
                    UnreadCount = unread
                };
            })
            .ToList();

        return ServiceResult<List<ConversationDto>>.Ok(conversationGroups);
    }
}
