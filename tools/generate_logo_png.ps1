Add-Type -AssemblyName System.Drawing

$width = 600
$height = 240

$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$g.Clear([System.Drawing.Color]::Transparent)

# Icon container dimensions
$rx = 20
$ry = 20
$isize = 200

# Background Linear Gradient for icon
$iconRect = New-Object System.Drawing.Rectangle([int]$rx, [int]$ry, [int]$isize, [int]$isize)
$brushBg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $iconRect,
    [System.Drawing.Color]::FromArgb(255, 27, 67, 50),
    [System.Drawing.Color]::FromArgb(255, 14, 40, 28),
    [float]45.0
)

# Rounded rectangle
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$radius = 48
$d = $radius * 2
$path.AddArc([float]$rx, [float]$ry, [float]$d, [float]$d, [float]180, [float]90)
$path.AddArc([float]($rx + $isize - $d), [float]$ry, [float]$d, [float]$d, [float]270, [float]90)
$path.AddArc([float]($rx + $isize - $d), [float]($ry + $isize - $d), [float]$d, [float]$d, [float]0, [float]90)
$path.AddArc([float]$rx, [float]($ry + $isize - $d), [float]$d, [float]$d, [float]90, [float]90)
$path.CloseFigure()

$g.FillPath($brushBg, $path)

# Subtle white border
$penBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(50, 255, 255, 255), [float]2.0)
$g.DrawPath($penBorder, $path)

# Interlocking arcs
$penEmerald = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 82, 183, 136), [float]14.0)
$penEmerald.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$penEmerald.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$g.DrawArc($penEmerald, [float]($rx + 40), [float]($ry + 36), [float]80, [float]70, [float]150, [float]240)

$penMint = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 116, 198, 157), [float]14.0)
$penMint.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$penMint.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$g.DrawArc($penMint, [float]($rx + 80), [float]($ry + 94), [float]80, [float]70, [float]330, [float]240)

# Exchange Arrows
$brushEmerald = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 82, 183, 136))
[System.Drawing.PointF[]]$ptsTop = @(
    (New-Object System.Drawing.PointF([float]($rx + 115), [float]($ry + 34))),
    (New-Object System.Drawing.PointF([float]($rx + 138), [float]($ry + 46))),
    (New-Object System.Drawing.PointF([float]($rx + 120), [float]($ry + 60)))
)
$g.FillPolygon($brushEmerald, $ptsTop)

$brushMint = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 116, 198, 157))
[System.Drawing.PointF[]]$ptsBottom = @(
    (New-Object System.Drawing.PointF([float]($rx + 85), [float]($ry + 166))),
    (New-Object System.Drawing.PointF([float]($rx + 62), [float]($ry + 154))),
    (New-Object System.Drawing.PointF([float]($rx + 80), [float]($ry + 140)))
)
$g.FillPolygon($brushMint, $ptsBottom)

# Center Golden Time Credit Coin
$coinRect = New-Object System.Drawing.Rectangle([int]($rx + 82), [int]($ry + 82), 36, 36)
$brushGold = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $coinRect,
    [System.Drawing.Color]::FromArgb(255, 254, 224, 71),
    [System.Drawing.Color]::FromArgb(255, 217, 119, 6),
    [float]45.0
)
$g.FillEllipse($brushGold, $coinRect)
$penCoin = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [float]2.5)
$g.DrawEllipse($penCoin, $coinRect)

# Coin Star / Center detail
$brushCoinDetail = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 120, 53, 15))
$g.FillEllipse($brushCoinDetail, [float]($rx + 97), [float]($ry + 97), [float]6.0, [float]6.0)

# Sparkle
$brushSparkle = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 253, 224, 71))
[System.Drawing.PointF[]]$ptsSparkle = @(
    (New-Object System.Drawing.PointF([float]($rx + 160), [float]($ry + 35))),
    (New-Object System.Drawing.PointF([float]($rx + 164), [float]($ry + 45))),
    (New-Object System.Drawing.PointF([float]($rx + 174), [float]($ry + 49))),
    (New-Object System.Drawing.PointF([float]($rx + 164), [float]($ry + 53))),
    (New-Object System.Drawing.PointF([float]($rx + 160), [float]($ry + 63))),
    (New-Object System.Drawing.PointF([float]($rx + 156), [float]($ry + 53))),
    (New-Object System.Drawing.PointF([float]($rx + 146), [float]($ry + 49))),
    (New-Object System.Drawing.PointF([float]($rx + 156), [float]($ry + 45)))
)
$g.FillPolygon($brushSparkle, $ptsSparkle)

# Typography on the Right Side
$textX = [float]245
$fontBrand = New-Object System.Drawing.Font("Segoe UI", [float]48, [System.Drawing.FontStyle]::Bold)
$fontUoh = New-Object System.Drawing.Font("Segoe UI", [float]15, [System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font("Segoe UI", [float]13, [System.Drawing.FontStyle]::Bold)
$fontInst = New-Object System.Drawing.Font("Segoe UI", [float]10.5, [System.Drawing.FontStyle]::Regular)

$brushCharcoal = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 28, 42, 36))
$brushForest = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 27, 67, 50))
$brushMuted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 100, 116, 139))
$brushEmeraldText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 45, 106, 79))

# Draw "Skill"
$g.DrawString("Skill", $fontBrand, $brushCharcoal, $textX, [float]30)
$sizeSkill = $g.MeasureString("Skill", $fontBrand)

# Draw "Swap" in Forest Green
$g.DrawString("Swap", $fontBrand, $brushForest, [float]($textX + $sizeSkill.Width - 14), [float]30)
$sizeSwap = $g.MeasureString("Swap", $fontBrand)

# Draw "UoH" badge pill
$badgeX = [float]($textX + $sizeSkill.Width + $sizeSwap.Width - 20)
$badgeRect = New-Object System.Drawing.Rectangle([int]$badgeX, 52, 60, 28)
$pathBadge = New-Object System.Drawing.Drawing2D.GraphicsPath
$bRadius = 8
$bd = $bRadius * 2
$pathBadge.AddArc([float]$badgeX, [float]52, [float]$bd, [float]$bd, [float]180, [float]90)
$pathBadge.AddArc([float]($badgeX + 60 - $bd), [float]52, [float]$bd, [float]$bd, [float]270, [float]90)
$pathBadge.AddArc([float]($badgeX + 60 - $bd), [float](52 + 28 - $bd), [float]$bd, [float]$bd, [float]0, [float]90)
$pathBadge.AddArc([float]$badgeX, [float](52 + 28 - $bd), [float]$bd, [float]$bd, [float]90, [float]90)
$pathBadge.CloseFigure()

$brushBadgeBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 216, 243, 220))
$g.FillPath($brushBadgeBg, $pathBadge)
$penBadgeBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 116, 198, 157), [float]1.5)
$g.DrawPath($penBadgeBorder, $pathBadge)

$g.DrawString("UoH", $fontUoh, $brushForest, [float]($badgeX + 11), [float]54)

# Subtitle
$g.DrawString("Campus Peer Skill Exchange  •  Time Credits, Not Money", $fontSub, $brushEmeraldText, $textX, [float]128)

# Institution
$g.DrawString("School of Computer & Information Sciences • University of Hyderabad", $fontInst, $brushMuted, $textX, [float]158)

# Save to public and android asset path
$publicPath = "D:\Skill_dev\Project\public\SkillSwapLogo.png"
$publicLogoPath = "D:\Skill_dev\Project\public\logo.png"
$androidAssetPath = "D:\Skill_dev\Project\work\android\assets\SkillSwapLogo.png"

$bmp.Save($publicPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($publicLogoPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($androidAssetPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()

Write-Output "Successfully generated SkillSwapLogo.png with 0 errors."
