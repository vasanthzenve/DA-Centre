# ==============================================================================
# DA Centre: Launch 3 Load-Balanced Spring Boot Backend Instances on Windows
# Instance 1: Port 8080 (backend-1)
# Instance 2: Port 8081 (backend-2)
# Instance 3: Port 8082 (backend-3)
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Building DA Centre Backend Jar (Java 21)..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\backend"
.\mvnw.cmd clean package -DskipTests

if ($LASTEXITCODE -ne 0) {
    Write-Host "Maven build failed! Please check errors above." -ForegroundColor Red
    exit 1
}

$jarPath = Get-ChildItem -Path "target\*.jar" | Select-Object -First 1 -ExpandProperty FullName
Write-Host "Built: $jarPath" -ForegroundColor Green

Write-Host "Spawning Spring Boot Instance 1 on Port 8080..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:SERVER_PORT='8080'; `$env:INSTANCE_ID='backend-1'; java -jar '$jarPath'"

Write-Host "Spawning Spring Boot Instance 2 on Port 8081..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:SERVER_PORT='8081'; `$env:INSTANCE_ID='backend-2'; java -jar '$jarPath'"

Write-Host "Spawning Spring Boot Instance 3 on Port 8082..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:SERVER_PORT='8082'; `$env:INSTANCE_ID='backend-3'; java -jar '$jarPath'"

Write-Host "All 3 backend instances launched successfully!" -ForegroundColor Green
Write-Host "Nginx can now load balance traffic across ports 8080, 8081, 8082." -ForegroundColor Cyan
Set-Location -Path $PSScriptRoot
