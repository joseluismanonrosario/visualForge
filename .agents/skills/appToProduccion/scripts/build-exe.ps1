# ==============================================================================
# VisualForge Studio - Script de Conversion a .EXE para Windows (appToProduccion)
# ==============================================================================
param(
    [switch]$PortableOnly = $false,
    [switch]$SkipBuild = $false,
    [switch]$SkipGitHubRelease = $false,
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

# 8. Publicar Release en GitHub si hubo cambio de version o el tag no existe
if (-not $SkipGitHubRelease) {
    $VersionTag = "v$($PkgContent.version)"
    Write-Host ""
    Write-Host "Verificando estado de Release en GitHub para $VersionTag..." -ForegroundColor Cyan

    $ExistingLocalTag = git tag -l $VersionTag
    $ExistingRemoteTag = git ls-remote --tags origin $VersionTag

    if (-not $ExistingLocalTag -or -not $ExistingRemoteTag) {
        Write-Host "Detectado cambio de version ($VersionTag). Procediendo a publicar Release en GitHub..." -ForegroundColor Yellow

        # Extraer notas de la version desde CHANGELOG.md si existe
        $ReleaseNotes = ""
        $ChangelogPath = "$WorkspaceRoot\CHANGELOG.md"
        if (Test-Path $ChangelogPath) {
            $ChangelogContent = Get-Content -Raw -Path $ChangelogPath
            $Pattern = "(?s)##\s+\[$([regex]::Escape($PkgContent.version))\][^\r\n]*\r?\n(.*?)(?=\r?\n##\s+\[|\Z)"
            if ($ChangelogContent -match $Pattern) {
                $ReleaseNotes = $Matches[1].Trim()
            }
        }

        $NotesFilePath = "$WorkspaceRoot\release_notes_tmp.md"
        if ($ReleaseNotes) {
            Set-Content -Path $NotesFilePath -Value $ReleaseNotes -Encoding UTF8
        }

        # 1. Crear el tag en git si no existe
        if (-not $ExistingLocalTag) {
            git tag -a $VersionTag -m "VisualForge Studio $VersionTag"
            Write-Host "[OK] Tag local $VersionTag creado." -ForegroundColor Green
        }

        # 2. Subir el tag al repositorio remoto en GitHub
        Write-Host "Enviando tag $VersionTag a GitHub origin..." -ForegroundColor Yellow
        git push origin $VersionTag
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Tag $VersionTag enviado exitosamente a GitHub." -ForegroundColor Green
        }

        # 3. Publicar GitHub Release y adjuntar ejecutables .exe obligatoriamente via GitHub CLI (gh)
        $GhCmd = Get-Command gh -ErrorAction SilentlyContinue
        $GhExe = if ($GhCmd) { $GhCmd.Source } elseif (Test-Path "C:\Program Files\GitHub CLI\gh.exe") { "C:\Program Files\GitHub CLI\gh.exe" } elseif (Test-Path "$env:LOCALAPPDATA\Programs\GitHub CLI\gh.exe") { "$env:LOCALAPPDATA\Programs\GitHub CLI\gh.exe" } else { $null }

        if ($GhExe) {
            Write-Host "Creando GitHub Release y adjuntando ejecutables .exe con GitHub CLI ($GhExe)..." -ForegroundColor Yellow
            $ExePatternFiles = Get-ChildItem -Path $ReleaseDir -Filter "*$($PkgContent.version)*.exe"
            
            $GhArgs = @("release", "create", $VersionTag)
            foreach ($f in $ExePatternFiles) {
                $GhArgs += $f.FullName
            }
            $GhArgs += @("--title", "VisualForge Studio $VersionTag")
            if (Test-Path $NotesFilePath) {
                $GhArgs += @("--notes-file", $NotesFilePath)
            } else {
                $GhArgs += @("--notes", "Release $VersionTag de VisualForge Studio.")
            }

            & $GhExe @GhArgs
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[OK] Release de GitHub publicado exitosamente con ejecutables adjuntos!" -ForegroundColor Green
            } else {
                # Fallback: Si el release ya existia, adjuntar directamente con 'release upload'
                Write-Host "El release ya existe. Adjuntando ejecutables .exe directamente con release upload..." -ForegroundColor Yellow
                $UploadArgs = @("release", "upload", $VersionTag)
                foreach ($f in $ExePatternFiles) {
                    $UploadArgs += $f.FullName
                }
                $UploadArgs += "--clobber"
                & $GhExe @UploadArgs
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "[OK] Ejecutables .exe adjuntados exitosamente al Release de GitHub!" -ForegroundColor Green
                }
            }
        } else {
            Write-Host "[INFO] Tag y Release disponibles en GitHub: https://github.com/joseluismanonrosario/visualForge/releases/tag/$VersionTag" -ForegroundColor Cyan
        }

        if (Test-Path $NotesFilePath) {
            Remove-Item -Path $NotesFilePath -Force -ErrorAction SilentlyContinue
        }
    } else {
        Write-Host "[INFO] La version $VersionTag ya cuenta con Release publicado en GitHub. No se requiere nuevo release." -ForegroundColor DarkGray
    }
}
