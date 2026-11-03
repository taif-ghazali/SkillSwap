$origBky = Get-Content "D:\Skill_dev\Project\work\extracted_orig\src\appinventor\ai_25mcce36\SkillSwap_MiniProject_Team\Screen1.bky" -Raw

[xml]$xml = $origBky
$nsmgr = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$nsmgr.AddNamespace("b", "https://developers.google.com/blockly/xml")
$nsmgr.AddNamespace("h", "http://www.w3.org/1999/xhtml")

$events = $xml.SelectNodes("//b:block[@type='component_event']", $nsmgr)
Write-Output "Total component_events found: $($events.Count)"
foreach ($ev in $events) {
    $c = $ev.SelectSingleNode("h:mutation", $nsmgr)
    if ($c) {
        Write-Output "Event: $($c.Attributes['instance_name'].Value).$($c.Attributes['event_name'].Value)"
    } else {
        Write-Output "Event without h:mutation: $($ev.OuterXml.Substring(0, [Math]::Min(100, $ev.OuterXml.Length)))"
    }
}

