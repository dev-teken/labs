param(
    [Parameter(Mandatory=$true)]
    [string]$Projeto
)

$versoespath = "$Projeto\versoes"
$jsonpath    = "$versoespath\index.json"

if (-not (Test-Path $versoespath)) {
    Write-Host "Pasta nao encontrada: $versoespath" -ForegroundColor Red
    exit 1
}

$files = Get-ChildItem -Path $versoespath -Filter "*.html" |
         Sort-Object LastWriteTime -Descending

if ($files.Count -eq 0) {
    Write-Host "Nenhum .html encontrado" -ForegroundColor Yellow
    exit 0
}

$versions = @()
$count = 1

foreach ($f in $files) {
    $name  = $f.BaseName
    $badge = "v$count - $name"
    $obj   = '{"version":"v' + $count + '","badge":"' + $badge + '","name":"' + $name + '","desc":"","file":"' + $f.Name + '"}'
    $versions += $obj
    $count++
}

$versionsStr = $versions -join (",`n    ")
$json = "{`n  `"project`": `"$Projeto`",`n  `"versions`": [`n    $versionsStr`n  ]`n}"

[System.IO.File]::WriteAllText($jsonpath, $json, [System.Text.Encoding]::UTF8)

Write-Host "OK: $jsonpath ($($files.Count) versoes)" -ForegroundColor Green
Write-Host "git add $versoespath\index.json" -ForegroundColor Cyan
Write-Host "git commit -m chore-regenera-index" -ForegroundColor Cyan
Write-Host "git push" -ForegroundColor Cyan
