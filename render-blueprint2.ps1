$apiKey = "rnd_afBrudTEM3ytDmAdGHH3u6kxkywT"

# Create multipart body manually
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

$boundary = "----RenderBlueprintBoundary" + [System.Guid]::NewGuid().ToString("N")

# Build multipart body
$body = @"

--$boundary
Content-Disposition: form-data; name="file"; filename="render.yaml"
Content-Type: text/yaml

$yamlContent
--$boundary
Content-Disposition: form-data; name="ownerId"

tea-d7th8r4m0tmc73coi0hg
--$boundary--

"@

$headers = @{
    "Authorization" = "Bearer $apiKey"
}

try {
    $resp = Invoke-WebRequest -Uri "https://api.render.com/v1/blueprints" `
        -Method POST `
        -Headers $headers `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $body `
        -UseBasicParsing

    Write-Host "SUCCESS! Status: $($resp.StatusCode)" -ForegroundColor Green
    Write-Host $resp.Content -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $bodyStream = $reader.ReadToEnd()
        Write-Host "Body: $bodyStream" -ForegroundColor Yellow
    } catch {}
}
