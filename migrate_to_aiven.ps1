# migrate_to_aiven.ps1
# Script to securely migrate the local MySQL dump to an Aiven cloud instance via Docker

$envFile = ".env"
if (Test-Path $envFile) {
    Write-Host "Loading credentials from .env file..." -ForegroundColor Cyan
    Get-Content $envFile | Where-Object { $_ -match "^\s*[^#]" } | ForEach-Object {
        $name, $value = $_.Split('=', 2)
        [Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim())
    }
} else {
    Write-Host "Error: .env file not found." -ForegroundColor Red
    exit
}

$dbHost = [Environment]::GetEnvironmentVariable("DB_HOST")
$dbUser = [Environment]::GetEnvironmentVariable("DB_USER")
$dbPassword = [Environment]::GetEnvironmentVariable("DB_PASSWORD")
$dbName = [Environment]::GetEnvironmentVariable("DB_NAME")
$dbPort = [Environment]::GetEnvironmentVariable("DB_PORT")

if (-not $dbPort) {
    $dbPort = "3306" # Default but Aiven usually requires a custom one
}

Write-Host "Connecting to Aiven Database: $($dbHost):$($dbPort) | Target DB: $($dbName)" -ForegroundColor Cyan

$sslCommand = ""
if (Test-Path "ca.pem") {
    # Copy the SSL cert from Windows host into the Docker container
    Write-Host "Injecting ca.pem SSL certificate securely into the Docker engine..." -ForegroundColor Yellow
    docker cp ca.pem AiHdfcLoanApproval:/ca.pem
    $sslCommand = "--ssl-mode=REQUIRED --ssl-ca=/ca.pem"
    Write-Host "SSL execution verified." -ForegroundColor Green
}

$dumpFile = "AiHdfcLoanApproval_dump.sql"
if (-Not (Test-Path $dumpFile)) {
    Write-Host "Error: Backup file $dumpFile not found!" -ForegroundColor Red
    exit
}

Write-Host "Executing SQL Dump Migration into Aiven via Docker... This may take a few minutes." -ForegroundColor Yellow

# Use Docker's internal MySQL client because Windows host doesn't have it installed natively
cmd.exe /c "docker exec -i AiHdfcLoanApproval mysql -h $($dbHost) -P $($dbPort) -u $($dbUser) -p$($dbPassword) $($sslCommand) $($dbName) < $($dumpFile)"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Migration to Aiven completed successfully! All tables and data are now in the cloud." -ForegroundColor Green
} else {
    Write-Host "Migration failed. Please verify the following:" -ForegroundColor Red
    Write-Host "1. Check if DB_PORT was specified in .env (Aiven uses custom ports, e.g., 10511)."
    Write-Host "2. Ensure DB_PASSWORD is the actual password (typically starts with AVNS_...)."
}
