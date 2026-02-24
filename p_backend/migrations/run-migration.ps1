# PowerShell script to run database migration
Write-Host "Running database migration..." -ForegroundColor Cyan

# Try to find psql in common locations
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe",
    "psql.exe"
)

$psql = $null
foreach ($path in $psqlPaths) {
    if (Test-Path $path) {
        $psql = $path
        break
    }
    # Try to find in PATH
    $found = Get-Command $path -ErrorAction SilentlyContinue
    if ($found) {
        $psql = $path
        break
    }
}

if (-not $psql) {
    Write-Host "ERROR: psql not found. Please:" -ForegroundColor Red
    Write-Host "1. Install PostgreSQL" -ForegroundColor Yellow
    Write-Host "2. Add PostgreSQL bin directory to PATH, or" -ForegroundColor Yellow
    Write-Host "3. Use pgAdmin to run the SQL file manually" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "The SQL file is located at: migrations\001-create-patients-table.sql" -ForegroundColor Cyan
    exit 1
}

$scriptPath = Join-Path $PSScriptRoot "001-create-patients-table.sql"
$fullPath = Resolve-Path $scriptPath -ErrorAction SilentlyContinue

if (-not $fullPath) {
    Write-Host "ERROR: Migration file not found at: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "Using psql at: $psql" -ForegroundColor Green
Write-Host "Running migration file: $fullPath" -ForegroundColor Green
Write-Host ""

# Set PGPASSWORD environment variable to avoid password prompt
$env:PGPASSWORD = "gautam@3210"

# Run the migration
& $psql -U postgres -d aoapro -f $fullPath

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Migration completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "NOTE: This migration only creates the table structure." -ForegroundColor Yellow
    Write-Host "Data will be inserted when you submit the patient form from the frontend." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Migration failed. Error code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "Please check the error message above." -ForegroundColor Red
}

# Clear password from environment
Remove-Item Env:\PGPASSWORD
