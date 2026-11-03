$origBky = Get-Content "D:\Skill_dev\Project\work\extracted_orig\src\appinventor\ai_25mcce36\SkillSwap_MiniProject_Team\Screen1.bky" -Raw

[xml]$xml = $origBky
$nsmgr = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$nsmgr.AddNamespace("b", "https://developers.google.com/blockly/xml")

Write-Output "--- Procedures in ORIG ---"
$procs = $xml.SelectNodes("//b:block[@type='procedures_defnoreturn' or @type='procedures_defreturn']", $nsmgr)
foreach ($p in $procs) {
    $name = $p.SelectSingleNode("b:field[@name='NAME']", $nsmgr).InnerText
    Write-Output "Proc: $name ($($p.Attributes['type'].Value))"
}

Write-Output "`n--- Globals in ORIG ---"
$globals = $xml.SelectNodes("//b:block[@type='global_declaration']", $nsmgr)
foreach ($g in $globals) {
    $name = $g.SelectSingleNode("b:field[@name='NAME']", $nsmgr).InnerText
    Write-Output "Global: $name"
}

Write-Output "`n--- Events in ORIG ---"
$events = $xml.SelectNodes("//b:block[@type='component_event']", $nsmgr)
foreach ($ev in $events) {
    $c = $ev.SelectSingleNode("b:mutation", $nsmgr)
    if ($c) {
        Write-Output "Event: $($c.Attributes['instance_name'].Value).$($c.Attributes['event_name'].Value)"
    }
}

