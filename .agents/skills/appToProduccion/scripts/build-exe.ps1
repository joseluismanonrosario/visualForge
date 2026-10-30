# ==============================================================================
# VisualForge Studio - Script de Conversión a .EXE para Windows (appToProduccion)
# ==============================================================================
param(
    [switch]$PortableOnly = $false,
    [switch]$SkipBuild = $false
)

$ErrorActionPreference = "Stop"
$WorkspaceRoot = (Get-Item -Path "$PSScriptRoot\..\..\..").FullName
$SkillDir = "$WorkspaceRoot\.agents\skills\appToProduccion"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [appToProduccion] Iniciando conversión a ejecutable .exe" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Directorio del proyecto: $WorkspaceRoot" -ForegroundColor Gray

Set-Location $WorkspaceRoot

# 1. Preparar directorio electron/ y main.cjs
$ElectronDir = "$WorkspaceRoot\electron"
if (-not (Test-Path $ElectronDir)) {
    New-Item -ItemType Directory -Path $ElectronDir -Force | Out-Null
}

$MainTarget = "$ElectronDir\main.cjs"
$MainSource = "$SkillDir\resources\main.cjs"
if (-not (Test-Path $MainTarget)) {
    Copy-Item -Path $MainSource -Destination $MainTarget -Force
    Write-Host "✓ electron/main.cjs generado con éxito." -ForegroundColor Green
}

# 2. Preparar electron-builder.json
$BuilderTarget = "$WorkspaceRoot\electron-builder.json"
$BuilderSource = "$SkillDir\resources\electron-builder.json"
if (-not (Test-Path $BuilderTarget)) {
    Copy-Item -Path $BuilderSource -Destination $BuilderTarget -Force
    Write-Host "✓ electron-builder.json configurado con éxito." -ForegroundColor Green
}

# 3. Validar / Configurar campo "main" en package.json
$PkgPath = "$WorkspaceRoot\package.json"
$PkgContent = Get-Content -Raw -Path $PkgPath | ConvertFrom-Json

$NeedsPkgUpdate = $false
if ($PkgContent.main -ne "electron/main.cjs") {
    $PkgContent | Add-Member -NotePropertyName "main" -NotePropertyValue "electron/main.cjs" -Force
    $NeedsPkgUpdate = $true
}

if (-not $PkgContent.scripts."electron:build") {
    $PkgContent.scripts | Add-Member -NotePropertyName "electron:build" -NotePropertyValue "tsc -b && vite build && electron-builder --win" -Force
    $NeedsPkgUpdate = $true
}

if ($NeedsPkgUpdate) {
    $PkgContent | ConvertTo-Json -Depth 10 | Set-Content -Path $PkgPath -Encoding UTF8
    Write-Host "✓ package.json actualizado con entrada main y scripts de Electron." -ForegroundColor Green
}

# 4. Verificar dependencias de Electron
$NeedInstall = $false
if (-not (Test-Path "$WorkspaceRoot\node_modules\electron")) {
    $NeedInstall = $true
}
if (-not (Test-Path "$WorkspaceRoot\node_modules\electron-builder")) {
    $NeedInstall = $true
}

if ($NeedInstall) {
    Write-Host "`nInstalando electron y electron-builder como dependencias de desarrollo..." -ForegroundColor Yellow
    npm install --save-dev electron electron-builder
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Error al instalar dependencias de Electron."
    }
}

# 5. Compilar Frontend (dist)
if (-not $SkipBuild) {
    Write-Host "`nCompilando frontend de producción (Vite + React 19)..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Fallo en la compilación del frontend con npm run build."
    }
    Write-Host "✓ Build de Vite completado en dist/." -ForegroundColor Green
}

# 6. Ejecutar Electron Builder
Write-Host "`nEmpaquetando ejecutable .exe con Electron Builder..." -ForegroundColor Yellow

$BuilderArgs = @("--win")
if ($PortableOnly) {
    $BuilderArgs += "--portable"
}

npx electron-builder @BuilderArgs
if ($LASTEXITCODE -ne 0) {
    Write-Error "Fallo en el empaquetado con electron-builder."
}

# 7. Resumen de resultados
$ReleaseDir = "$WorkspaceRoot\release"
Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " ¡Conversión completada con éxito!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

if (Test-Path $ReleaseDir) {
    $ExeFiles = Get-ChildItem -Path $ReleaseDir -Filter "*.exe"
    Write-Host "Ejecutables generados en $ReleaseDir:" -ForegroundColor Cyan
    foreach ($file in $ExeFiles) {
        $sizeMB = [math]::Round($file.Length / 1MB, 2)
        Write-Host " - $($file.Name) ($sizeMB MB)" -ForegroundColor White
    }
}
