$headers = @{
    "Authorization" = "Bearer rnd_afBrudTEM3ytDmAdGHH3u6kxkywT"
    "Accept" = "application/json"
    "Content-Type" = "application/json"
}

# Test different endpoints
$endpoints = @(
    "https://api.render.com/v1/postgreses",
    "https://api.render.com/v1/databases",
    "https://api.render.com/v1/owners/tea-d7th8r4m0tmc73coi0hg/postgreses",
    "https://api.render.com/v1/workspaces/tea-d7th8r4m0tmc73coi0hg/databases"
)

foreach ($endpoint in $endpoints) {
    Write-Host "Testing: $endpoint" -ForegroundColor Cyan
    try {
        $resp = Invoke-WebRequest -Uri $endpoint -Method GET -Headers $headers -ContentType "application/json" -UseBasicParsing
        Write-Host "Status: $($resp.StatusCode)" -ForegroundColor Green
        Write-Host "Body: $($resp.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
