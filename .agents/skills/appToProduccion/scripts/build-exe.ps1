# ==============================================================================
# VisualForge Studio - Script de Conversion a .EXE para Windows (appToProduccion)
# ==============================================================================
param(
    [switch]$PortableOnly = $false,
    [switch]$SkipBuild = $false,
    [string]$TargetVersion = ""
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkspaceRoot = (Resolve-Path "$ScriptDir\..\..\..\..").Path
$SkillDir = "$WorkspaceRoot\.agents\skills\appToProduccion"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [appToProduccion] Iniciando conversion a ejecutable .exe" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Directorio del proyecto: $WorkspaceRoot" -ForegroundColor Gray

Set-Location $WorkspaceRoot

# 1. Preparar directorio electron/, main.cjs y preload.cjs
$ElectronDir = "$WorkspaceRoot\electron"
if (-not (Test-Path $ElectronDir)) {
    New-Item -ItemType Directory -Path $ElectronDir -Force | Out-Null
}

$MainTarget = "$ElectronDir\main.cjs"
$MainSource = "$SkillDir\resources\main.cjs"
Copy-Item -Path $MainSource -Destination $MainTarget -Force
Write-Host "[OK] electron/main.cjs sincronizado con exito." -ForegroundColor Green

$PreloadTarget = "$ElectronDir\preload.cjs"
$PreloadSource = "$SkillDir\resources\preload.cjs"
Copy-Item -Path $PreloadSource -Destination $PreloadTarget -Force
Write-Host "[OK] electron/preload.cjs sincronizado con exito." -ForegroundColor Green

# 2. Preparar electron-builder.json
$BuilderTarget = "$WorkspaceRoot\electron-builder.json"
$BuilderSource = "$SkillDir\resources\electron-builder.json"
if (-not (Test-Path $BuilderTarget)) {
    Copy-Item -Path $BuilderSource -Destination $BuilderTarget -Force
    Write-Host "[OK] electron-builder.json configurado con exito." -ForegroundColor Green
}

# 3. Validar / Configurar version y campos de Electron en package.json
$PkgPath = "$WorkspaceRoot\package.json"
$PkgContent = Get-Content -Raw -Path $PkgPath | ConvertFrom-Json

$NeedsPkgUpdate = $false

# Sincronización de Versión si se especifica o si CHANGELOG.md tiene versión más reciente
if ($TargetVersion -and $PkgContent.version -ne $TargetVersion) {
    Write-Host "[appToProduccion] Actualizando version de $($PkgContent.version) a $TargetVersion segun parametro..." -ForegroundColor Yellow
    $PkgContent.version = $TargetVersion
    $NeedsPkgUpdate = $true
} else {
    $ChangelogPath = "$WorkspaceRoot\CHANGELOG.md"
    if (Test-Path $ChangelogPath) {
        $ChangelogContent = Get-Content -Raw -Path $ChangelogPath
        if ($ChangelogContent -match '##\s+\[([0-9]+\.[0-9]+\.[0-9]+)\]') {
            $LatestChangelogVersion = $Matches[1]
            if ($PkgContent.version -ne $LatestChangelogVersion) {
                Write-Host "[appToProduccion] Sincronizando version de package.json ($($PkgContent.version) -> $LatestChangelogVersion) detectada en CHANGELOG.md..." -ForegroundColor Yellow
                $PkgContent.version = $LatestChangelogVersion
                $NeedsPkgUpdate = $true
            }
        }
    }
}
Write-Host "Version activa de la aplicacion: v$($PkgContent.version)" -ForegroundColor Cyan

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
    Write-Host "[OK] package.json sincronizado con exito." -ForegroundColor Green
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
    Write-Host ""
    Write-Host "Instalando electron y electron-builder como dependencias de desarrollo..." -ForegroundColor Yellow
    npm install --save-dev electron electron-builder
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Error al instalar dependencias de Electron."
    }
}

# 5. Compilar Frontend (dist)
if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "Compilando frontend de produccion (Vite + React 19)..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Fallo en la compilacion del frontend con npm run build."
    }
    Write-Host "[OK] Build de Vite completado en dist/." -ForegroundColor Green
}

# 6. Ejecutar Electron Builder
Write-Host ""
Write-Host "Empaquetando ejecutable .exe con Electron Builder..." -ForegroundColor Yellow

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
Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " Conversion completada con exito!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

if (Test-Path $ReleaseDir) {
    $ExeFiles = Get-ChildItem -Path $ReleaseDir -Filter "*.exe"
    Write-Host "Ejecutables generados en ${ReleaseDir}:" -ForegroundColor Cyan
    foreach ($file in $ExeFiles) {
        $sizeMB = [math]::Round($file.Length / 1MB, 2)
        Write-Host " - $($file.Name) ($sizeMB MB)" -ForegroundColor White
    }
}
