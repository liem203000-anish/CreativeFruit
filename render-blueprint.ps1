$apiKey = "rnd_afBrudTEM3ytDmAdGHH3u6kxkywT"
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Accept" = "application/json"
    "Content-Type" = "application/json"
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

$yamlBytes = [System.Text.Encoding]::UTF8.GetBytes($yamlContent)

# Create blueprint
$boundary = [System.Guid]::NewGuid().ToString()
$bodyParts = @()

$bodyParts += "--$boundary`r`n"
$bodyParts += "Content-Disposition: form-data; name=`"file`"; filename=`"render.yaml`"`r`n"
$bodyParts += "Content-Type: text/yaml`r`n`r`n"
$bodyParts += $yamlContent + "`r`n"

$bodyParts += "--$boundary`r`n"
$bodyParts += "Content-Disposition: form-data; name=`"ownerId`"`r`n`r`n"
$bodyParts += "tea-d7th8r4m0tmc73coi0hg`r`n"

$bodyParts += "--$boundary--`r`n"
$bodyBody = $bodyParts -join ""

Write-Host "=== Creating Blueprint ===" -ForegroundColor Cyan
try {
    $resp = Invoke-WebRequest -Uri "https://api.render.com/v1/blueprints" `
        -Method POST `
        -Headers $headers `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body ([System.Text.Encoding]::UTF8.GetBytes($bodyBody)) `
        -UseBasicParsing

    Write-Host "Status: $($resp.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($resp.Content)" -ForegroundColor Gray
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    try {
        $errorBody = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream()).ReadToEnd()
        Write-Host "Response body: $errorBody" -ForegroundColor Yellow
    } catch {}
}

# Also try the old endpoint
Write-Host "`n=== Trying old blueprint endpoint ===" -ForegroundColor Cyan
try {
    $resp2 = Invoke-WebRequest -Uri "https://api.render.com/v1/blueprints/validate" `
        -Method POST `
        -Headers $headers `
        -ContentType "application/json" `
        -Body ($body | ConvertTo-Json -Compress) `
        -UseBasicParsing

    Write-Host "Status: $($resp2.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}
