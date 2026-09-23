using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;

namespace Dormi.Application.Interfaces;

public interface IMessageService
{
    Task<ServiceResult<object>> SendMessageAsync(Guid senderId, SendMessageDto dto);
    Task<ServiceResult<List<MessageResponseDto>>> GetConversationHistoryAsync(Guid userId, Guid otherUserId);
    Task<ServiceResult<List<ConversationDto>>> GetConversationsAsync(Guid userId);
}
