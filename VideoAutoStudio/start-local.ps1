# Start VideoAutoStudio locally (Windows PowerShell)

Write-Host "Starting VideoAutoStudio..." -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
}

# Start PostgreSQL if not running
$pgService = Get-Service postgresql* | Where-Object { $_.Status -eq 'Running' }
if (-not $pgService) {
    Write-Host "Starting PostgreSQL..." -ForegroundColor Yellow
    Start-Service postgresql-x64-18
}

# Start Backend
Write-Host "Starting Backend API..." -ForegroundColor Cyan
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$((Resolve-Path backend).Path)'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend  
Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$((Resolve-Path frontend).Path)'; npm run dev" -WindowStyle Normal

Write-Host "Done! Opening browser..." -ForegroundColor Green
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"

Write-Host "Login credentials:" -ForegroundColor Yellow
Write-Host "  Email: admin@videoautostudio.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
