using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;

namespace Dormi.Application.Interfaces;

public interface IAppointmentService
{
    Task<ServiceResult<object>> CreateAppointmentAsync(Guid userId, CreateAppointmentDto dto);
    Task<ServiceResult<List<AppointmentResponseDto>>> GetMyAppointmentsAsync(Guid userId);
    Task<ServiceResult<object>> UpdateStatusAsync(Guid id, Guid userId, bool isAdmin, UpdateAppointmentStatusDto dto);
}
