Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('output/android/SkillSwap_MiniProject_Team_Reviewed.aia')
$entry = $zip.Entries | Where-Object { $_.FullName -like '*.bky' }
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$content = $reader.ReadToEnd()
$zip.Dispose()

$matches = [regex]::Matches($content, '<block[^>]*type="global_declaration"[^>]*>[\s\S]*?</block>')
foreach ($m in $matches) {
    Write-Output $m.Value
}

