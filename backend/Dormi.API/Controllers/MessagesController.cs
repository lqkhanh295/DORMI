using System;
using System.Threading.Tasks;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : BaseApiController
{
    private readonly IMessageService _messageService;

    public MessagesController(IMessageService messageService)
    {
        _messageService = messageService;
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto)
    {
        var senderId = GetCurrentUserId();
        if (!senderId.HasValue) return Unauthorized();

        var result = await _messageService.SendMessageAsync(senderId.Value, dto);
        return HandleResult(result);
    }

    [HttpGet("{otherUserId:guid}")]
    public async Task<IActionResult> GetConversationHistory(Guid otherUserId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _messageService.GetConversationHistoryAsync(userId.Value, otherUserId);
        return HandleResult(result);
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _messageService.GetConversationsAsync(userId.Value);
        return HandleResult(result);
    }
}
