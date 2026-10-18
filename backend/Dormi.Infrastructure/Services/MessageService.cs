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
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;

namespace Dormi.Infrastructure.Services;

public class MessageService : IMessageService
{
    private readonly DormiDbContext _db;
    private readonly IHubContext<ChatHub> _hubContext;
    private readonly IDistributedCache? _cache;
    private readonly IMemoryCache? _memCache;

    public MessageService(DormiDbContext db, IHubContext<ChatHub> hubContext, IDistributedCache? cache = null, IMemoryCache? memCache = null)
    {
        _db = db;
        _hubContext = hubContext;
        _cache = cache;
        _memCache = memCache;
    }

    public async Task<ServiceResult<object>> SendMessageAsync(Guid senderId, SendMessageDto dto)
    {
        if (senderId == dto.ReceiverId)
        {
            return ServiceResult<object>.Fail("Bạn không thể tự gửi tin nhắn cho chính mình.", 400);
        }

        // ponytail: cache sender name and receiver validation to avoid multiple remote DB roundtrips per message
        string senderName = "Người dùng";
        if (_memCache != null && _memCache.TryGetValue($"user_name:{senderId}", out string? cachedName) && !string.IsNullOrEmpty(cachedName))
        {
            senderName = cachedName;
        }

        bool receiverExists = false;
        if (_memCache != null && _memCache.TryGetValue($"user_exists:{dto.ReceiverId}", out bool cachedExists))
        {
            receiverExists = cachedExists;
        }

        if (!receiverExists || senderName == "Người dùng")
        {
            var userInfos = await _db.Users
                .AsNoTracking()
                .Where(u => u.Id == senderId || u.Id == dto.ReceiverId)
                .Select(u => new { u.Id, u.FullName, u.Email })
                .ToListAsync();

            var receiver = userInfos.FirstOrDefault(u => u.Id == dto.ReceiverId);
            if (receiver == null) return ServiceResult<object>.NotFound("Không tìm thấy người nhận.");
            _memCache?.Set($"user_exists:{dto.ReceiverId}", true, TimeSpan.FromMinutes(30));

            var sender = userInfos.FirstOrDefault(u => u.Id == senderId);
            if (sender != null)
            {
                senderName = !string.IsNullOrWhiteSpace(sender.FullName) ? sender.FullName : (!string.IsNullOrWhiteSpace(sender.Email) ? sender.Email : "Người dùng");
                _memCache?.Set($"user_name:{senderId}", senderName, TimeSpan.FromMinutes(30));
            }
        }

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
            senderName = senderName,
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

        var pairKey = senderId < dto.ReceiverId ? $"{senderId}:{dto.ReceiverId}" : $"{dto.ReceiverId}:{senderId}";
        _memCache?.Remove($"conv_hist:{pairKey}");
        _memCache?.Remove($"conversations:{senderId}");
        _memCache?.Remove($"conversations:{dto.ReceiverId}");

        return ServiceResult<object>.Ok(new { id = message.Id, message = "Đã gửi tin nhắn.", data = messagePayload });
    }

    public async Task<ServiceResult<List<MessageResponseDto>>> GetConversationHistoryAsync(Guid userId, Guid otherUserId)
    {
        var pairKey = userId < otherUserId ? $"{userId}:{otherUserId}" : $"{otherUserId}:{userId}";
        var cacheKey = $"conv_hist:{pairKey}";

        if (_memCache != null && _memCache.TryGetValue(cacheKey, out List<MessageResponseDto>? cachedMessages) && cachedMessages != null)
        {
            return ServiceResult<List<MessageResponseDto>>.Ok(cachedMessages);
        }

        var messages = await _db.Messages
            .AsNoTracking()
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

        // ponytail: mark unread messages directly using single ExecuteUpdateAsync without second roundtrip SELECT
        if (messages.Any(m => m.SenderId == otherUserId && !m.IsRead))
        {
            await _db.Messages
                .Where(m => m.SenderId == otherUserId && m.ReceiverId == userId && !m.IsRead)
                .ExecuteUpdateAsync(s => s.SetProperty(m => m.IsRead, true));

            _memCache?.Remove($"conversations:{userId}");
        }

        _memCache?.Set(cacheKey, messages, TimeSpan.FromSeconds(15));
        return ServiceResult<List<MessageResponseDto>>.Ok(messages);
    }

    public async Task<ServiceResult<List<ConversationDto>>> GetConversationsAsync(Guid userId)
    {
        var cacheKey = $"conversations:{userId}";
        if (_memCache != null && _memCache.TryGetValue(cacheKey, out List<ConversationDto>? memCached) && memCached != null)
        {
            return ServiceResult<List<ConversationDto>>.Ok(memCached);
        }

        // ponytail: select only lightweight message fields without heavy User joins
        var rawMessages = await _db.Messages
            .AsNoTracking()
            .Where(m => m.SenderId == userId || m.ReceiverId == userId)
            .OrderByDescending(m => m.SentAt)
            .Select(m => new
            {
                m.SenderId,
                m.ReceiverId,
                m.Content,
                m.SentAt,
                m.IsRead
            })
            .ToListAsync();

        var groups = rawMessages
            .GroupBy(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
            .ToList();

        var distinctOtherUserIds = groups.Select(g => g.Key).ToList();
        var usersMap = new Dictionary<Guid, (string Name, string? Avatar)>();

        if (distinctOtherUserIds.Count > 0)
        {
            var userEntities = await _db.Users
                .AsNoTracking()
                .Where(u => distinctOtherUserIds.Contains(u.Id))
                .Select(u => new { u.Id, u.FullName, u.Email, u.AvatarUrl })
                .ToListAsync();

            foreach (var u in userEntities)
            {
                var name = !string.IsNullOrWhiteSpace(u.FullName) ? u.FullName : (!string.IsNullOrWhiteSpace(u.Email) ? u.Email : "Người dùng");
                usersMap[u.Id] = (name, u.AvatarUrl);
            }
        }

        var conversationGroups = groups.Select(g =>
        {
            var otherUserId = g.Key;
            var lastMsg = g.First();
            var unread = g.Count(m => m.ReceiverId == userId && !m.IsRead);
            usersMap.TryGetValue(otherUserId, out var userInfo);

            return new ConversationDto
            {
                OtherUserId = otherUserId,
                OtherUserName = userInfo.Name ?? "Người dùng",
                OtherUserAvatar = userInfo.Avatar,
                LastMessage = lastMsg.Content,
                LastMessageTime = lastMsg.SentAt,
                UnreadCount = unread
            };
        }).ToList();

        if (_cache != null && conversationGroups.Count > 0)
        {
            await Task.WhenAll(conversationGroups.Select(async conv =>
            {
                var presence = await _cache.GetStringAsync($"presence:{conv.OtherUserId.ToString().ToLower()}");
                conv.IsOnline = !string.IsNullOrEmpty(presence);
            }));
        }

        _memCache?.Set(cacheKey, conversationGroups, TimeSpan.FromSeconds(60));
        return ServiceResult<List<ConversationDto>>.Ok(conversationGroups);
    }
}
