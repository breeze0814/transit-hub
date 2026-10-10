[CmdletBinding()]
param(
    [string]$Version,
    [string]$ImageName = $env:DOCKER_IMAGE,
    [string]$Remote = 'origin',
    [string]$Branch,
    [string]$CommitMessage,
    [switch]$SkipLatest,
    [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'

function Invoke-External {
    param(
        [Parameter(Mandatory)]
        [string]$FilePath,
        [Parameter(Mandatory)]
        [string[]]$ArgumentList
    )

    $display = "$FilePath $($ArgumentList -join ' ')"
    if ($WhatIf) {
        Write-Host "[what-if] $display"
        return
    }

    & $FilePath @ArgumentList
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed with exit code $LASTEXITCODE`: $display"
    }
}

function Get-CommandPath {
    param([Parameter(Mandatory)][string]$Name)

    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if (-not $command) {
        throw "Required command '$Name' was not found in PATH."
    }

    return $command.Source
}

function Get-ProjectVersion {
    $packageJsonPath = Join-Path (Join-Path (Join-Path $PSScriptRoot '..') 'frontend') 'package.json'
    if (-not (Test-Path -LiteralPath $packageJsonPath)) {
        throw "Cannot find frontend/package.json to determine the release version."
    }

    try {
        $package = Get-Content -LiteralPath $packageJsonPath -Raw | ConvertFrom-Json
    } catch {
        throw "Could not parse frontend/package.json: $($_.Exception.Message)"
    }

    if ([string]::IsNullOrWhiteSpace([string]$package.version)) {
        throw "frontend/package.json does not contain a version. Pass -Version explicitly."
    }

    return [string]$package.version
}

function Normalize-Version {
    param([Parameter(Mandatory)][string]$Value)

    $normalized = $Value.Trim()
    if ($normalized.StartsWith('v', [System.StringComparison]::OrdinalIgnoreCase)) {
        $normalized = $normalized.Substring(1)
    }

    if ($normalized -notmatch '^[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$') {
        throw "Version '$Value' is not a valid semantic version (for example, 0.1.16 or 0.1.16-rc.1)."
    }

    return "v$normalized"
}

function Get-GitOutput {
    param([Parameter(Mandatory)][string[]]$ArgumentList)

    $output = & $git @ArgumentList
    if ($LASTEXITCODE -ne 0) {
        throw "git $($ArgumentList -join ' ') failed with exit code $LASTEXITCODE."
    }

    return ($output -join "`n").Trim()
}

$git = Get-CommandPath 'git'
$docker = Get-CommandPath 'docker'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Push-Location $repoRoot
try {
    if ([string]::IsNullOrWhiteSpace($Version)) {
        $Version = Get-ProjectVersion
    }
    $Version = Normalize-Version $Version

    if ([string]::IsNullOrWhiteSpace($ImageName)) {
        throw "Specify your Docker repository with -ImageName (for example, your-dockerhub-name/transithub) or set the DOCKER_IMAGE environment variable."
    }
    if ($ImageName -notmatch '^[a-z0-9]+(?:[._-]?[a-z0-9]+)*(?:/[a-z0-9]+(?:[._-]?[a-z0-9]+)*)*$') {
        throw "ImageName '$ImageName' must be a Docker repository name without a tag."
    }
    if ([string]::IsNullOrWhiteSpace($Branch)) {
        $Branch = Get-GitOutput @('branch', '--show-current')
        if ([string]::IsNullOrWhiteSpace($Branch)) {
            throw 'Could not determine the current Git branch. Pass -Branch explicitly when using a detached HEAD.'
        }
    }
    if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
        $CommitMessage = "chore(release): publish $Version"
    }
    if (-not $WhatIf) {
        $null = Get-GitOutput @('remote', 'get-url', $Remote)
    }

    if (-not $WhatIf) {
        $status = Get-GitOutput @('status', '--porcelain')
        if ([string]::IsNullOrWhiteSpace($status)) {
            Write-Host 'Working tree is clean; no new commit will be created.'
        } else {
            Invoke-External $git @('add', '--all')
            Invoke-External $git @('commit', '-m', $CommitMessage)
        }
    } else {
        Invoke-External $git @('add', '--all')
        Invoke-External $git @('commit', '-m', $CommitMessage)
    }

    Invoke-External $git @('push', $Remote, $Branch)

    $versionTag = "${ImageName}:${Version}"
    $latestTag = "${ImageName}:latest"
    Invoke-External $docker @('build', '--file', 'deploy/Dockerfile', '--tag', $versionTag, '.')
    Invoke-External $docker @('push', $versionTag)

    if (-not $SkipLatest) {
        Invoke-External $docker @('tag', $versionTag, $latestTag)
        Invoke-External $docker @('push', $latestTag)
    }

    if ($WhatIf) {
        Write-Host "What-if validation completed for Git branch '$Branch', Docker image '$versionTag'."
    } else {
        Write-Host "Published Git branch '$Branch' and Docker image '$versionTag'."
        if (-not $SkipLatest) {
            Write-Host "Published Docker image '$latestTag'."
        }
    }
} finally {
    Pop-Location
}
