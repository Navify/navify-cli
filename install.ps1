$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$navifyFolderPath = "$env:LOCALAPPDATA\navify"
$navifyDataPath = "$env:APPDATA\navify"
$navifyOldFolderPath = "$HOME\navify-cli"
$repoFolderPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$marketplaceSourcePath = Join-Path (Split-Path -Parent $repoFolderPath) 'marketplace\dist'

function Write-Success {
  [CmdletBinding()]
  param ()
  process {
    Write-Host -Object ' > OK' -ForegroundColor 'Green'
  }
}

function Write-Unsuccess {
  [CmdletBinding()]
  param ()
  process {
    Write-Host -Object ' > ERROR' -ForegroundColor 'Red'
  }
}

function Test-Admin {
  [CmdletBinding()]
  param ()
  begin {
    Write-Host -Object "Checking if the script is not being run as administrator..." -NoNewline
  }
  process {
    $currentUser = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    -not $currentUser.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
  }
}

function Test-PowerShellVersion {
  [CmdletBinding()]
  param ()
  begin {
    $PSMinVersion = [version]'5.1'
  }
  process {
    Write-Host -Object 'Checking if your PowerShell version is compatible...' -NoNewline
    $PSVersionTable.PSVersion -ge $PSMinVersion
  }
}

function Move-OldNavifyFolder {
  [CmdletBinding()]
  param ()
  process {
    if (Test-Path -Path $navifyOldFolderPath) {
      Write-Host -Object 'Moving the old navify folder...' -NoNewline
      Copy-Item -Path "$navifyOldFolderPath\*" -Destination $navifyFolderPath -Recurse -Force
      Remove-Item -Path $navifyOldFolderPath -Recurse -Force
      Write-Success
    }
  }
}

function Test-Go {
  [CmdletBinding()]
  param ()
  process {
    Write-Host -Object 'Checking if Go is installed...' -NoNewline
    $goCommand = Get-Command go -ErrorAction SilentlyContinue
    if ($goCommand) {
      Write-Success
      return $true
    }
    Write-Unsuccess
    Write-Warning -Message 'Go is required to build Navify from this local folder.'
    Write-Host -Object 'Install Go from https://go.dev/dl/, open a new terminal, then run install.bat again.'
    Pause
    return $false
  }
}

function Add-NavifyToPath {
  [CmdletBinding()]
  param ()
  begin {
    Write-Host -Object 'Making navify available in the PATH...' -NoNewline
    $user = [EnvironmentVariableTarget]::User
    $path = [Environment]::GetEnvironmentVariable('PATH', $user)
  }
  process {
    $path = $path -replace "$([regex]::Escape($navifyOldFolderPath))\*;*", ''
    if ($path -notlike "*$navifyFolderPath*") {
      $path = "$path;$navifyFolderPath"
    }
  }
  end {
    [Environment]::SetEnvironmentVariable('PATH', $path, $user)
    if (($env:PATH -split ';') -notcontains $navifyFolderPath) {
      $env:PATH = "$env:PATH;$navifyFolderPath"
    }
    Write-Success
  }
}

function Install-Navify {
  [CmdletBinding()]
  param ()
  begin {
    Write-Host -Object 'Installing navify...'
  }
  process {
    $exePath = Join-Path -Path $repoFolderPath -ChildPath 'navify.exe'

    if (-not (Test-Path -LiteralPath $exePath)) {
      if (-not (Test-Go)) {
        exit 1
      }
      Write-Host -Object 'Building navify from local source...' -NoNewline
      Push-Location -LiteralPath $repoFolderPath
      try {
        & go build -o navify.exe
        if ($LASTEXITCODE -ne 0) {
          throw "go build failed with exit code $LASTEXITCODE"
        }
      }
      finally {
        Pop-Location
      }
      Write-Success
    }

    Write-Host -Object 'Copying navify files...' -NoNewline
    if (-not (Test-Path -Path $navifyFolderPath)) {
      New-Item -Path $navifyFolderPath -ItemType Directory -Force | Out-Null
    }
    Copy-Item -LiteralPath $exePath -Destination (Join-Path -Path $navifyFolderPath -ChildPath 'navify.exe') -Force
    Copy-Item -LiteralPath (Join-Path -Path $repoFolderPath -ChildPath 'css-map.json') -Destination (Join-Path -Path $navifyFolderPath -ChildPath 'css-map.json') -Force
    if (-not (Test-Path -Path $navifyDataPath)) {
      New-Item -Path $navifyDataPath -ItemType Directory -Force | Out-Null
    }
    if (-not (Test-Path -Path $navifyDataPath)) {
      New-Item -Path $navifyDataPath -ItemType Directory -Force | Out-Null
    }
    foreach ($folder in @('Themes', 'Extensions', 'CustomApps', 'jsHelper')) {
      $source = Join-Path -Path $repoFolderPath -ChildPath $folder
      if (Test-Path -LiteralPath $source) {
        Copy-Item -LiteralPath $source -Destination $navifyDataPath -Recurse -Force
      }
    }
    Copy-Item -LiteralPath (Join-Path -Path $repoFolderPath -ChildPath 'css-map.json') -Destination (Join-Path -Path $navifyDataPath -ChildPath 'css-map.json') -Force
    Copy-Item -LiteralPath (Join-Path -Path $repoFolderPath -ChildPath 'jsHelper') -Destination $navifyFolderPath -Recurse -Force
    Copy-Item -LiteralPath (Join-Path -Path $repoFolderPath -ChildPath 'css-map.json') -Destination (Join-Path -Path $navifyDataPath -ChildPath 'css-map.json') -Force
    Copy-Item -LiteralPath (Join-Path -Path $repoFolderPath -ChildPath 'jsHelper') -Destination $navifyFolderPath -Recurse -Force
    Write-Success

    Add-NavifyToPath
  }
  end {
    Write-Host -Object 'Navify and Marketplace were successfully installed.' -ForegroundColor 'Green'
  }
}

function Install-Marketplace {
  [CmdletBinding()]
  param ()
  process {
    Write-Host -Object 'Installing Marketplace...' -NoNewline
    $manifestPath = Join-Path -Path $marketplaceSourcePath -ChildPath 'manifest.json'
    if (-not (Test-Path -LiteralPath $manifestPath)) {
      Write-Unsuccess
      throw 'Marketplace build is missing. Run pnpm build:prod in the marketplace folder.'
    }

    $marketplaceDestinationPath = Join-Path -Path $navifyDataPath -ChildPath 'CustomApps\marketplace'
    New-Item -Path $marketplaceDestinationPath -ItemType Directory -Force | Out-Null
    Copy-Item -Path (Join-Path -Path $marketplaceSourcePath -ChildPath '*') -Destination $marketplaceDestinationPath -Recurse -Force
    Write-Success

  }
}

if (-not (Test-PowerShellVersion)) {
  Write-Unsuccess
  Write-Warning -Message 'PowerShell 5.1 or higher is required to run this script'
  Write-Warning -Message "You are running PowerShell $($PSVersionTable.PSVersion)"
  Pause
  exit 1
}
else {
  Write-Success
}

if (-not (Test-Admin)) {
  Write-Unsuccess
  Write-Warning -Message 'The script was run as administrator. This can result in problems with the installation process or unexpected behavior. Do not continue if you do not know what you are doing.'
  $Host.UI.RawUI.Flushinputbuffer()
  $choices = [System.Management.Automation.Host.ChoiceDescription[]] @(
    (New-Object System.Management.Automation.Host.ChoiceDescription '&Yes', 'Abort installation.'),
    (New-Object System.Management.Automation.Host.ChoiceDescription '&No', 'Resume installation.')
  )
  $choice = $Host.UI.PromptForChoice('', 'Do you want to abort the installation process?', $choices, 0)
  if ($choice -eq 0) {
    Write-Host -Object 'navify installation aborted' -ForegroundColor 'Yellow'
    Pause
    exit 1
  }
}
else {
  Write-Success
}

Move-OldNavifyFolder
Install-Navify
Install-Marketplace
Write-Host -Object "`nRun" -NoNewline
Write-Host -Object ' navify -h ' -NoNewline -ForegroundColor 'Cyan'
Write-Host -Object 'to get started'
