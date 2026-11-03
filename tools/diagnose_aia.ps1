Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Inspect-Zip($path) {
    Write-Output "========================================"
    Write-Output "File: $path"
    $zip = [System.IO.Compression.ZipFile]::OpenRead($path)
    foreach ($e in $zip.Entries) {
        Write-Output "Entry: $($e.FullName) ($($e.Length) bytes)"
    }
    
    # Check project.properties
    $prop = $zip.GetEntry('youngandroidproject/project.properties')
    if ($prop) {
        $s = $prop.Open()
        $r = New-Object System.IO.StreamReader($s)
        Write-Output "--- project.properties ---"
        Write-Output $r.ReadToEnd()
    }
    
    # Check .scm
    $scm = $zip.Entries | Where-Object { $_.FullName -like '*.scm' }
    if ($scm) {
        Write-Output "--- SCM entry: $($scm.FullName) ---"
        $s = $scm.Open()
        $r = New-Object System.IO.StreamReader($s)
        $txt = $r.ReadToEnd()
        $jsonStr = $txt.Substring($txt.IndexOf('$JSON') + 6)
        $jsonStr = $jsonStr.Substring(0, $jsonStr.LastIndexOf('|#'))
        [xml]$dummy = $null
        try {
            $scmObj = $jsonStr | ConvertFrom-Json
            Write-Output "SCM JSON Parse: OK"
            Write-Output "SCM Name: $($scmObj.Properties.'$Name'), Type: $($scmObj.Properties.'$Type')"
            Write-Output "Components count: $($scmObj.Properties.'$Components'.Count)"
        } catch {
            Write-Output "SCM JSON Parse ERROR: $_"
        }
    }
    
    # Check .bky
    $bky = $zip.Entries | Where-Object { $_.FullName -like '*.bky' }
    if ($bky) {
        Write-Output "--- BKY entry: $($bky.FullName) ---"
        $s = $bky.Open()
        $r = New-Object System.IO.StreamReader($s)
        $txt = $r.ReadToEnd()
        try {
            [xml]$xml = $txt
            Write-Output "BKY XML Parse: OK"
            $blocks = $xml.SelectNodes('//*[local-name()="block"]')
            Write-Output "Total blocks: $($blocks.Count)"
        } catch {
            Write-Output "BKY XML Parse ERROR: $_"
        }
    }
    
    $zip.Dispose()
}

Inspect-Zip('SkillSwap_MiniProject_Team.aia')
Inspect-Zip('output/android/SkillSwap_MiniProject_Team_Reviewed.backup.aia')
Inspect-Zip('output/android/SkillSwap_MiniProject_Team_Reviewed.aia')

