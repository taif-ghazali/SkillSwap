Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead('output/android/SkillSwap_MiniProject_Team_Reviewed.aia')
$bkyEntry = $zip.Entries | Where-Object { $_.FullName -like '*.bky' }
$stream = $bkyEntry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$content = $reader.ReadToEnd()
$zip.Dispose()

[xml]$xml = $content
$apiUrlBlock = $xml.SelectSingleNode("//*[local-name()='block' and @type='global_declaration' and *[local-name()='field' and text()='apiUrl']]")
Write-Output $apiUrlBlock.OuterXml

