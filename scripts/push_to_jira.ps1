<#
.SYNOPSIS
    Script tự động đẩy toàn bộ 8 bug tickets từ file CSV lên Jira Cloud REST API.
.DESCRIPTION
    Yêu cầu: Jira URL, Email tài khoản Atlassian, API Token và Project Key.
.EXAMPLE
    .\scripts\push_to_jira.ps1 -JiraUrl "https://your-company.atlassian.net" -Email "your-email@example.com" -ApiToken "YOUR_API_TOKEN" -ProjectKey "DORMI"
#>

param (
    [Parameter(Mandatory=$true)]
    [string]$JiraUrl,

    [Parameter(Mandatory=$true)]
    [string]$Email,

    [Parameter(Mandatory=$true)]
    [string]$ApiToken,

    [Parameter(Mandatory=$true)]
    [string]$ProjectKey
)

$csvPath = Join-Path $PSScriptRoot "..\jira_import_tickets.csv"
if (!(Test-Path $csvPath)) {
    Write-Error "Không tìm thấy file CSV tại: $csvPath"
    exit 1
}

$tickets = Import-Csv -Path $csvPath -Encoding UTF8
$authBytes = [System.Text.Encoding]::UTF8.GetBytes("${Email}:${ApiToken}")
$base64Auth = [Convert]::ToBase64String($authBytes)

$headers = @{
    "Authorization" = "Basic $base64Auth"
    "Content-Type"  = "application/json"
    "Accept"        = "application/json"
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " BẮT ĐẦU ĐẨY TICKETS LÊN JIRA PROJECT: $ProjectKey" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

foreach ($t in $tickets) {
    Write-Host "Đang tạo ticket: $($t.Summary)..." -NoNewline

    $body = @{
        fields = @{
            project = @{ key = $ProjectKey }
            summary = $t.Summary
            description = @{
                type = "doc"
                version = 1
                content = @(
                    @{
                        type = "paragraph"
                        content = @(
                            @{
                                type = "text"
                                text = $t.Description
                            }
                        )
                    }
                )
            }
            issuetype = @{ name = "Bug" }
            priority = @{ name = $t.Priority }
            labels = ($t.Labels -split ",")
        }
    } | ConvertTo-Json -Depth 10

    try {
        $endpoint = "$($JiraUrl.TrimEnd('/'))/rest/api/3/issue"
        $response = Invoke-RestMethod -Uri $endpoint -Method Post -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($body))
        Write-Host " [THÀNH CÔNG] Key: $($response.key)" -ForegroundColor Green
    } catch {
        Write-Host " [THẤT BẠI] $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "  Chi tiết lỗi: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
        }
    }
}

Write-Host "`nĐã hoàn thành quá trình import tickets lên Jira!" -ForegroundColor Cyan
