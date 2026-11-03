Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-AiaInfo($path) {
    $zip = [System.IO.Compression.ZipFile]::OpenRead($path)
    Write-Output "=== $path ==="
    foreach ($entry in $zip.Entries) {
        Write-Output "$($entry.FullName) ($($entry.Length) bytes)"
    }
    $bkyEntry = $zip.Entries | Where-Object { $_.FullName -like '*.bky' }
    $stream = $bkyEntry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $content = $reader.ReadToEnd()
    $zip.Dispose()
    
    [xml]$xml = $content
    $apiUrl = $xml.SelectSingleNode("//*[local-name()='block' and @type='global_declaration' and *[local-name()='field' and text()='apiUrl']]//*[local-name()='field' and @name='TEXT']")
    $apiKey = $xml.SelectSingleNode("//*[local-name()='block' and @type='global_declaration' and *[local-name()='field' and text()='apiKey']]//*[local-name()='field' and @name='TEXT']")
    Write-Output "apiUrl: '$($apiUrl.InnerText)'"
    Write-Output "apiKey: '$($apiKey.InnerText)'"
}

Get-AiaInfo('SkillSwap_MiniProject_Team.aia')
Get-AiaInfo('output/android/SkillSwap_MiniProject_Team_Reviewed.aia')

