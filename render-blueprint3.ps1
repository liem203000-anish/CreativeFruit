$apiKey = "rnd_afBrudTEM3ytDmAdGHH3u6kxkywT"
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Accept" = "application/json"
}

$yamlContent = @"
databases:
  - name: videoautostudio-db
    plan: free
    region: singapore
    postgresMajorVersion: "16"

services:
  - type: web
    plan: free
    name: videoautostudio-backend
    runtime: node
    region: singapore
    repo: https://github.com/thanhliem121004/CreativeFruit
    branch: main
    rootDir: VideoAutoStudio/backend
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "4000"
      - key: DATABASE_URL
        fromDatabase:
          name: videoautostudio-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRY
        value: "7d"
      - key: FRONTEND_URL
        value: "https://creative-fruit.vercel.app"
"@

$yamlPath = "$env:TEMP\render.yaml"
$yamlContent | Out-File -FilePath $yamlPath -Encoding UTF8

# Read file as bytes
$yamlBytes = [System.IO.File]::ReadAllBytes($yamlPath)

# Create multipart form data
$boundary = [System.Guid]::NewGuid().ToString()
$memStream = New-Object System.IO.MemoryStream
$writer = New-Object System.IO.BinaryWriter($memStream)

# Part 1: file
$part1 = [System.Text.Encoding]::UTF8.GetBytes("--$boundary`r`nContent-Disposition: form-data; name=`"file`"; filename=`"render.yaml`"`r`nContent-Type: text/yaml`r`n`r`n")
$writer.Write($part1)
$writer.Write($yamlBytes)
$writer.Write([byte]13)
$writer.Write([byte]10)

# Part 2: ownerId
$part2 = [System.Text.Encoding]::UTF8.GetBytes("--$boundary`r`nContent-Disposition: form-data; name=`"ownerId`"`r`n`r`ntea-d7th8r4m0tmc73coi0hg`r`n")
$writer.Write($part2)

# End
$end = [System.Text.Encoding]::UTF8.GetBytes("--$boundary--`r`n")
$writer.Write($end)
$writer.Flush()

$bodyBytes = $memStream.ToArray()
$writer.Dispose()
$memStream.Dispose()

$contentType = "multipart/form-data; boundary=$boundary"

Write-Host "=== Creating Blueprint via Render API ===" -ForegroundColor Cyan
Write-Host "Endpoint: POST https://api.render.com/v1/blueprints" -ForegroundColor Gray

try {
    $resp = Invoke-WebRequest -Uri "https://api.render.com/v1/blueprints" `
        -Method POST `
        -Headers $headers `
        -ContentType $contentType `
        -Body $bodyBytes `
        -UseBasicParsing

    Write-Host "Status: $($resp.StatusCode) $($resp.StatusDescription)" -ForegroundColor Green
    $resp.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $sr = New-Object System.IO.StreamReader($stream)
        $bodyResp = $sr.ReadToEnd()
        $sr.Dispose()
        Write-Host "Response: $bodyResp" -ForegroundColor Yellow
    } catch {}
}

# Also list existing blueprints
Write-Host "`n=== Listing Blueprints ===" -ForegroundColor Cyan
try {
    $listResp = Invoke-WebRequest -Uri "https://api.render.com/v1/blueprints" `
        -Method GET `
        -Headers $headers `
        -UseBasicParsing

    Write-Host "Status: $($listResp.StatusCode)" -ForegroundColor Green
    $listResp.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "List Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $sr = New-Object System.IO.StreamReader($stream)
        $bodyResp = $sr.ReadToEnd()
        $sr.Dispose()
        Write-Host "Response: $bodyResp" -ForegroundColor Yellow
    } catch {}
}
