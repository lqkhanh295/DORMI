using System;

namespace Dormi.Domain.Entities;

// ponytail: Application supporting document (CCCD, payslip, labor contract).
public class ApplicationDocument
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RentalApplicationId { get; set; }
    public RentalApplication RentalApplication { get; set; } = null!;
    public string DocumentType { get; set; } = "ID_CARD"; // ID_CARD, PAYSLIP, WORK_CONTRACT, STUDENT_CARD, OTHER
    public string FileUrl { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
