# Fix pg_hba.conf and restart PostgreSQL
# Chạy file này với quyền Administrator

Write-Host "Dang sua pg_hba.conf..." -ForegroundColor Yellow

$lines = @(
    "# PostgreSQL Client Authentication Configuration File",
    "local   all             all                                     trust",
    "host    all             all             127.0.0.1/32            trust",
    "host    all             all             ::1/128                 trust",
    "local   replication     all                                     scram-sha-256",
    "host    replication     all             127.0.0.1/32            scram-sha-256",
    "host    replication     all             ::1/128                 scram-sha-256"
)

$lines | Set-Content -Path "C:\Program Files\PostgreSQL\18\data\pg_hba.conf" -Encoding ASCII

Write-Host "Da sua pg_hba.conf" -ForegroundColor Green
Write-Host "Dang restart PostgreSQL..." -ForegroundColor Yellow

Restart-Service postgresql-x64-18

Write-Host "Da restart PostgreSQL" -ForegroundColor Green
Write-Host "Hoan tat!" -ForegroundColor Cyan
