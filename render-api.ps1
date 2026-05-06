$headers = @{
    "Authorization" = "Bearer rnd_afBrudTEM3ytDmAdGHH3u6kxkywT"
    "Accept" = "application/json"
    "Content-Type" = "application/json"
}

# Test: List existing postgres
Write-Host "=== Testing Render API ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "https://api.render.com/v1/postgreses" -Method GET -Headers $headers -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "GET /postgreses failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Creating PostgreSQL ===" -ForegroundColor Cyan
$body = @{
    name = "videoautostudio-db"
    ownerId = "tea-d7th8r4m0tmc73coi0hg"
    plan = "free"
    region = "singapore"
    version = "16"
} | ConvertTo-Json -Compress

try {
    $createResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/postgreses" -Method POST -Headers $headers -Body $body -ContentType "application/json"
    $createResponse | ConvertTo-Json -Depth 10
} catch {
    Write-Host "POST /postgreses failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}
