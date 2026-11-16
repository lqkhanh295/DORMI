using System;
using System.Threading.Tasks;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Dormi.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : BaseApiController
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var result = await _adminService.GetStatsAsync();
        return HandleResult(result);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] UserRole? role)
    {
        var result = await _adminService.GetUsersAsync(role);
        return HandleResult(result);
    }

    [HttpGet("verifications")]
    public async Task<IActionResult> GetPendingVerifications()
    {
        var result = await _adminService.GetPendingVerificationsAsync();
        return HandleResult(result);
    }

    [HttpPatch("verifications/{id:guid}")]
    [HttpPatch("verifications/{id:guid}/review")]
    public async Task<IActionResult> UpdateVerificationStatus(Guid id, [FromBody] ReviewVerificationDto dto)
    {
        var result = await _adminService.UpdateVerificationStatusAsync(id, dto);
        return HandleResult(result);
    }

    [HttpGet("rooms")]
    public async Task<IActionResult> GetRoomsForModeration()
    {
        var result = await _adminService.GetRoomsForModerationAsync();
        return HandleResult(result);
    }

    [HttpPatch("rooms/{roomId:guid}/status")]
    public async Task<IActionResult> UpdateRoomStatus(Guid roomId, [FromQuery] RoomStatus status)
    {
        var result = await _adminService.UpdateRoomStatusAsync(roomId, status);
        return HandleResult(result);
    }

    [HttpGet("reports")]
    public async Task<IActionResult> GetReports()
    {
        var result = await _adminService.GetReportsAsync();
        return HandleResult(result);
    }

    [HttpPatch("reports/{reportId:guid}/status")]
    public async Task<IActionResult> UpdateReportStatus(Guid reportId, [FromQuery] string status)
    {
        var result = await _adminService.UpdateReportStatusAsync(reportId, status);
        return HandleResult(result);
    }

    [HttpGet("roommate-posts")]
    public async Task<IActionResult> GetRoommatePostsForModeration()
    {
        var result = await _adminService.GetRoommatePostsForModerationAsync();
        return HandleResult(result);
    }

    [HttpPatch("roommate-posts/{id:guid}/status")]
    public async Task<IActionResult> UpdateRoommatePostStatus(Guid id, [FromQuery] bool isActive)
    {
        var result = await _adminService.UpdateRoommatePostStatusAsync(id, isActive);
        return HandleResult(result);
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions()
    {
        var result = await _adminService.GetTransactionsAsync();
        return HandleResult(result);
    }

    [HttpGet("transactions/export")]
    public async Task<IActionResult> ExportTransactionsCsv()
    {
        var result = await _adminService.GetTransactionsAsync();
        if (!result.Success || result.Data == null) return BadRequest("Không thể lấy dữ liệu giao dịch.");

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("STT,MaGiaoDich,HoTen,Email,SoTien,PhuongThuc,TrangThai,MoTa,NgayTao,NgayHoanTat");
        int index = 1;
        foreach (var t in result.Data)
        {
            var fullName = (t.UserFullName ?? "").Replace(",", " ");
            var desc = (t.Description ?? "").Replace(",", " ");
            var created = t.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss");
            var completed = t.CompletedAt?.ToString("yyyy-MM-dd HH:mm:ss") ?? "";
            sb.AppendLine($"{index++},{t.TransactionRef},{fullName},{t.UserEmail},{t.Amount},{t.PaymentMethod},{t.Status},{desc},{created},{completed}");
        }

        var preamble = System.Text.Encoding.UTF8.GetPreamble();
        var bytes = System.Text.Encoding.UTF8.GetBytes(sb.ToString());
        var fileBytes = new byte[preamble.Length + bytes.Length];
        Buffer.BlockCopy(preamble, 0, fileBytes, 0, preamble.Length);
        Buffer.BlockCopy(bytes, 0, fileBytes, preamble.Length, bytes.Length);

        return File(fileBytes, "text/csv; charset=utf-8", $"dormi_transactions_{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
    }

    [HttpGet("users/export")]
    public async Task<IActionResult> ExportUsersCsv()
    {
        var result = await _adminService.GetUsersAsync(null);
        if (!result.Success || result.Data == null) return BadRequest("Không thể lấy dữ liệu người dùng.");

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("STT,UserId,HoTen,Email,VaiTro,XacMinh,NgayDangKy");
        int index = 1;
        foreach (var u in result.Data)
        {
            var fullName = (u.FullName ?? "").Replace(",", " ");
            var created = u.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss");
            sb.AppendLine($"{index++},{u.Id},{fullName},{u.Email},{u.Role},{u.IsVerifiedLandlord},{created}");
        }

        var preamble = System.Text.Encoding.UTF8.GetPreamble();
        var bytes = System.Text.Encoding.UTF8.GetBytes(sb.ToString());
        var fileBytes = new byte[preamble.Length + bytes.Length];
        Buffer.BlockCopy(preamble, 0, fileBytes, 0, preamble.Length);
        Buffer.BlockCopy(bytes, 0, fileBytes, preamble.Length, bytes.Length);

        return File(fileBytes, "text/csv; charset=utf-8", $"dormi_users_{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
    }
}
