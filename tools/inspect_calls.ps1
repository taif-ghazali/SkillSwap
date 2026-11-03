Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('output/android/SkillSwap_MiniProject_Team_Reviewed.aia')
$entry = $zip.Entries | Where-Object { $_.FullName -like '*.bky' }
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$content = $reader.ReadToEnd()
$zip.Dispose()

[xml]$xml = $content
$callBlocks = $xml.SelectNodes("//*[local-name()='block' and @type='procedures_callnoreturn']/*[local-name()='mutation' and @name='callApi']/..")

foreach ($b in $callBlocks) {
    $parent = $b.ParentNode
    while ($parent -ne $null -and $parent.Name -ne 'block') {
        $parent = $parent.ParentNode
    }
    $parentType = if ($parent -ne $null) { $parent.Attributes['type'].Value } else { 'none' }
    $arg0 = $b.SelectSingleNode("*[local-name()='value' and @name='ARG0']//*[local-name()='field']")
    $arg1 = $b.SelectSingleNode("*[local-name()='value' and @name='ARG1']")
    Write-Output "CALL: action=$($arg0.InnerText) parentType=$parentType"
    Write-Output "   ARG1 XML: $($arg1.OuterXml)"
}

