using System;

namespace Dormi.Domain.Entities;

// ponytail: Supporting attachment/document for a Lease Contract (e.g. Contract PDF, Handover memo).
public class LeaseDocument
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid LeaseContractId { get; set; }
    public LeaseContract LeaseContract { get; set; } = null!;
    public string DocumentType { get; set; } = "CONTRACT_PDF"; // CONTRACT_PDF, HANDOVER_MEMO, ADDENDUM, OTHER
    public string FileUrl { get; set; } = string.Empty;
    public string? Title { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
