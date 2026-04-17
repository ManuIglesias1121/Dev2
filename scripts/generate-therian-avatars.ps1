Add-Type -AssemblyName System.Drawing

$outputDir = Join-Path $PSScriptRoot "..\assets\generated-avatars"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

function New-Brush([string]$hex) {
    return [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($hex))
}

function New-Pen([string]$hex, [float]$width = 1) {
    return [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml($hex), $width)
}

function Fill-Circle {
    param($Graphics, $Brush, [float]$x, [float]$y, [float]$size)
    $Graphics.FillEllipse($Brush, $x, $y, $size, $size)
}

function Draw-Avatar {
    param(
        [string]$Name,
        [string]$FileName,
        [string]$BgTop,
        [string]$BgBottom,
        [string]$JacketColor,
        [string]$SkinColor,
        [string]$MaskBase,
        [string]$MaskAccent,
        [string]$EyeGlow,
        [ValidateSet('wolf','fox','raven','deer')]
        [string]$Animal
    )

    $width = 1024
    $height = 1024
    $bitmap = [System.Drawing.Bitmap]::new($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $bgRect = [System.Drawing.Rectangle]::new(0, 0, $width, $height)
    $bgBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
        $bgRect,
        [System.Drawing.ColorTranslator]::FromHtml($BgTop),
        [System.Drawing.ColorTranslator]::FromHtml($BgBottom),
        90
    )
    $graphics.FillRectangle($bgBrush, $bgRect)

    $mist1 = New-Brush "#18FFFFFF"
    $mist2 = New-Brush "#10FFFFFF"
    Fill-Circle $graphics $mist1 -120 120 420
    Fill-Circle $graphics $mist2 760 90 320
    Fill-Circle $graphics $mist2 120 760 250

    $shadow = New-Brush "#22000000"
    $graphics.FillEllipse($shadow, 242, 830, 540, 90)

    $jacket = New-Brush $JacketColor
    $graphics.FillEllipse($jacket, 220, 560, 580, 360)
    $graphics.FillEllipse($jacket, 110, 680, 260, 220)
    $graphics.FillEllipse($jacket, 650, 680, 260, 220)

    $shirt = New-Brush "#E7E2DA"
    $graphics.FillEllipse($shirt, 400, 690, 220, 180)

    $skin = New-Brush $SkinColor
    $graphics.FillRectangle($skin, 458, 470, 108, 118)
    $graphics.FillEllipse($skin, 352, 235, 320, 360)

    $hair = New-Brush "#2A211C"
    $graphics.FillPie($hair, 330, 205, 360, 250, 180, 180)
    $graphics.FillEllipse($hair, 320, 250, 70, 170)
    $graphics.FillEllipse($hair, 634, 250, 70, 160)

    $maskPath = [System.Drawing.Drawing2D.GraphicsPath]::new()
    switch ($Animal) {
        'wolf' {
            $maskPath.AddPolygon(@(
                [System.Drawing.PointF]::new(415, 310),
                [System.Drawing.PointF]::new(468, 245),
                [System.Drawing.PointF]::new(512, 286),
                [System.Drawing.PointF]::new(558, 245),
                [System.Drawing.PointF]::new(612, 312),
                [System.Drawing.PointF]::new(642, 450),
                [System.Drawing.PointF]::new(518, 552),
                [System.Drawing.PointF]::new(390, 450)
            ))
        }
        'fox' {
            $maskPath.AddPolygon(@(
                [System.Drawing.PointF]::new(420, 300),
                [System.Drawing.PointF]::new(472, 220),
                [System.Drawing.PointF]::new(508, 280),
                [System.Drawing.PointF]::new(550, 220),
                [System.Drawing.PointF]::new(604, 298),
                [System.Drawing.PointF]::new(628, 428),
                [System.Drawing.PointF]::new(516, 570),
                [System.Drawing.PointF]::new(404, 428)
            ))
        }
        'raven' {
            $maskPath.AddPolygon(@(
                [System.Drawing.PointF]::new(430, 294),
                [System.Drawing.PointF]::new(474, 242),
                [System.Drawing.PointF]::new(520, 286),
                [System.Drawing.PointF]::new(560, 242),
                [System.Drawing.PointF]::new(604, 296),
                [System.Drawing.PointF]::new(650, 388),
                [System.Drawing.PointF]::new(560, 430),
                [System.Drawing.PointF]::new(522, 574),
                [System.Drawing.PointF]::new(480, 430),
                [System.Drawing.PointF]::new(384, 388)
            ))
        }
        'deer' {
            $maskPath.AddPolygon(@(
                [System.Drawing.PointF]::new(426, 308),
                [System.Drawing.PointF]::new(474, 252),
                [System.Drawing.PointF]::new(514, 288),
                [System.Drawing.PointF]::new(558, 252),
                [System.Drawing.PointF]::new(604, 308),
                [System.Drawing.PointF]::new(622, 438),
                [System.Drawing.PointF]::new(516, 560),
                [System.Drawing.PointF]::new(410, 438)
            ))
        }
    }

    $maskBrush = New-Brush $MaskBase
    $maskOutline = New-Pen "#EDE7E0" 6
    $graphics.FillPath($maskBrush, $maskPath)
    $graphics.DrawPath($maskOutline, $maskPath)

    if ($Animal -eq 'wolf' -or $Animal -eq 'fox') {
        $accent = New-Brush $MaskAccent
        $graphics.FillPolygon($accent, @(
            [System.Drawing.PointF]::new(485, 395),
            [System.Drawing.PointF]::new(548, 395),
            [System.Drawing.PointF]::new(516, 510)
        ))
        $graphics.FillPolygon($accent, @(
            [System.Drawing.PointF]::new(445, 336),
            [System.Drawing.PointF]::new(485, 390),
            [System.Drawing.PointF]::new(414, 408)
        ))
        $graphics.FillPolygon($accent, @(
            [System.Drawing.PointF]::new(587, 336),
            [System.Drawing.PointF]::new(548, 390),
            [System.Drawing.PointF]::new(618, 408)
        ))
    }

    if ($Animal -eq 'raven') {
        $beak = New-Brush $MaskAccent
        $graphics.FillPolygon($beak, @(
            [System.Drawing.PointF]::new(468, 386),
            [System.Drawing.PointF]::new(564, 386),
            [System.Drawing.PointF]::new(516, 485)
        ))
    }

    if ($Animal -eq 'deer') {
        $antlerPen = New-Pen $MaskAccent 8
        $graphics.DrawLine($antlerPen, 458, 270, 410, 190)
        $graphics.DrawLine($antlerPen, 410, 190, 375, 158)
        $graphics.DrawLine($antlerPen, 412, 195, 420, 145)
        $graphics.DrawLine($antlerPen, 574, 270, 622, 190)
        $graphics.DrawLine($antlerPen, 622, 190, 658, 158)
        $graphics.DrawLine($antlerPen, 620, 195, 610, 145)
    }

    $eyeWhite = New-Brush "#F5F7FA"
    $iris = New-Brush $EyeGlow
    $pupil = New-Brush "#0B0B0B"
    $graphics.FillEllipse($eyeWhite, 446, 358, 56, 36)
    $graphics.FillEllipse($eyeWhite, 530, 358, 56, 36)
    $graphics.FillEllipse($iris, 464, 364, 20, 20)
    $graphics.FillEllipse($iris, 548, 364, 20, 20)
    $graphics.FillEllipse($pupil, 470, 370, 8, 8)
    $graphics.FillEllipse($pupil, 554, 370, 8, 8)

    $labelBrush = New-Brush "#EDE7E0"
    $smallBrush = New-Brush "#B6B0A8"
    $fontFamily = [System.Drawing.FontFamily]::GenericSansSerif
    $nameFont = [System.Drawing.Font]::new($fontFamily, 36, [System.Drawing.FontStyle]::Bold)
    $roleFont = [System.Drawing.Font]::new($fontFamily, 18, [System.Drawing.FontStyle]::Regular)
    $format = [System.Drawing.StringFormat]::new()
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $graphics.DrawString($Name, $nameFont, $labelBrush, [System.Drawing.RectangleF]::new(180, 895, 664, 50), $format)
    $graphics.DrawString("Avatar original generado para demo", $roleFont, $smallBrush, [System.Drawing.RectangleF]::new(190, 940, 644, 30), $format)

    $filePath = Join-Path $outputDir $FileName
    $bitmap.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Png)

    $nameFont.Dispose()
    $roleFont.Dispose()
    $labelBrush.Dispose()
    $smallBrush.Dispose()
    $eyeWhite.Dispose()
    $iris.Dispose()
    $pupil.Dispose()
    $maskBrush.Dispose()
    $maskOutline.Dispose()
    $skin.Dispose()
    $hair.Dispose()
    $jacket.Dispose()
    $shirt.Dispose()
    $shadow.Dispose()
    $mist1.Dispose()
    $mist2.Dispose()
    $bgBrush.Dispose()
    $maskPath.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
}

$avatars = @(
    @{ Name = "Ari Wolf"; FileName = "ari-wolf.png"; BgTop = "#243B2E"; BgBottom = "#0C1612"; JacketColor = "#2D343C"; SkinColor = "#D6B39B"; MaskBase = "#6B7280"; MaskAccent = "#E5E7EB"; EyeGlow = "#93C5FD"; Animal = "wolf" },
    @{ Name = "Noa Fox"; FileName = "noa-fox.png"; BgTop = "#4B2B1E"; BgBottom = "#140C08"; JacketColor = "#56382B"; SkinColor = "#E0B498"; MaskBase = "#C2410C"; MaskAccent = "#FFF1E6"; EyeGlow = "#FDE68A"; Animal = "fox" },
    @{ Name = "Skye Raven"; FileName = "skye-raven.png"; BgTop = "#1F2937"; BgBottom = "#090B11"; JacketColor = "#10151C"; SkinColor = "#C79D84"; MaskBase = "#111827"; MaskAccent = "#374151"; EyeGlow = "#67E8F9"; Animal = "raven" },
    @{ Name = "Eden Deer"; FileName = "eden-deer.png"; BgTop = "#5A3C2B"; BgBottom = "#16100C"; JacketColor = "#6B4F3A"; SkinColor = "#D9B79F"; MaskBase = "#8B5E3C"; MaskAccent = "#D6C2A5"; EyeGlow = "#C4B5FD"; Animal = "deer" },
    @{ Name = "Kael Wolf"; FileName = "kael-wolf.png"; BgTop = "#27404A"; BgBottom = "#0B161A"; JacketColor = "#22303A"; SkinColor = "#CFA38A"; MaskBase = "#4B5563"; MaskAccent = "#D1D5DB"; EyeGlow = "#86EFAC"; Animal = "wolf" },
    @{ Name = "Mira Fox"; FileName = "mira-fox.png"; BgTop = "#6A2E1D"; BgBottom = "#1C0E08"; JacketColor = "#7C4A36"; SkinColor = "#E5B89A"; MaskBase = "#EA580C"; MaskAccent = "#FFF7ED"; EyeGlow = "#F9A8D4"; Animal = "fox" },
    @{ Name = "Orin Raven"; FileName = "orin-raven.png"; BgTop = "#283445"; BgBottom = "#0A0F16"; JacketColor = "#131A22"; SkinColor = "#B88F76"; MaskBase = "#0F172A"; MaskAccent = "#475569"; EyeGlow = "#A5F3FC"; Animal = "raven" },
    @{ Name = "Lena Deer"; FileName = "lena-deer.png"; BgTop = "#75503C"; BgBottom = "#1E1712"; JacketColor = "#8A654A"; SkinColor = "#E8C0A4"; MaskBase = "#A47148"; MaskAccent = "#E7D3B5"; EyeGlow = "#DDD6FE"; Animal = "deer" },
    @{ Name = "Taro Wolf"; FileName = "taro-wolf.png"; BgTop = "#1D3B34"; BgBottom = "#091310"; JacketColor = "#2B3541"; SkinColor = "#C69578"; MaskBase = "#9CA3AF"; MaskAccent = "#F3F4F6"; EyeGlow = "#BFDBFE"; Animal = "wolf" },
    @{ Name = "Suri Fox"; FileName = "suri-fox.png"; BgTop = "#533326"; BgBottom = "#140C09"; JacketColor = "#6B4635"; SkinColor = "#D4A487"; MaskBase = "#C2410C"; MaskAccent = "#FDEDDC"; EyeGlow = "#FDE68A"; Animal = "fox" },
    @{ Name = "Nyx Raven"; FileName = "nyx-raven.png"; BgTop = "#202B3B"; BgBottom = "#090C13"; JacketColor = "#0F1720"; SkinColor = "#D2A388"; MaskBase = "#1E293B"; MaskAccent = "#64748B"; EyeGlow = "#7DD3FC"; Animal = "raven" },
    @{ Name = "Bruna Deer"; FileName = "bruna-deer.png"; BgTop = "#694531"; BgBottom = "#17100C"; JacketColor = "#7A5A44"; SkinColor = "#D9AC90"; MaskBase = "#8B5E3C"; MaskAccent = "#E8D7BF"; EyeGlow = "#C4B5FD"; Animal = "deer" }
)

foreach ($avatar in $avatars) {
    Draw-Avatar @avatar
}

$columns = 3
$cardSize = 600
$gap = 60
$marginX = 80
$titleHeight = 170
$rows = [Math]::Ceiling($avatars.Count / $columns)
$sheetWidth = ($marginX * 2) + ($columns * $cardSize) + (($columns - 1) * $gap)
$sheetHeight = $titleHeight + ($rows * $cardSize) + (($rows - 1) * $gap) + 80

$sheet = [System.Drawing.Bitmap]::new($sheetWidth, $sheetHeight)
$g = [System.Drawing.Graphics]::FromImage($sheet)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.ColorTranslator]::FromHtml("#0A0A0A"))

$sheetTitleFont = [System.Drawing.Font]::new([System.Drawing.FontFamily]::GenericSansSerif, 42, [System.Drawing.FontStyle]::Bold)
$sheetSubFont = [System.Drawing.Font]::new([System.Drawing.FontFamily]::GenericSansSerif, 18, [System.Drawing.FontStyle]::Regular)
$titleBrush = New-Brush "#F3F4F6"
$subBrush = New-Brush "#9CA3AF"
$fmt = [System.Drawing.StringFormat]::new()
$fmt.Alignment = [System.Drawing.StringAlignment]::Center
$g.DrawString("Therian Avatars Demo", $sheetTitleFont, $titleBrush, [System.Drawing.RectangleF]::new(0, 30, $sheetWidth, 60), $fmt)
$g.DrawString("PNG originales y ficticios para usar como perfiles demo", $sheetSubFont, $subBrush, [System.Drawing.RectangleF]::new(0, 96, $sheetWidth, 30), $fmt)

for ($index = 0; $index -lt $avatars.Count; $index++) {
    $avatar = $avatars[$index]
    $column = $index % $columns
    $row = [Math]::Floor($index / $columns)
    $x = $marginX + ($column * ($cardSize + $gap))
    $y = $titleHeight + ($row * ($cardSize + $gap))
    $imgPath = Join-Path $outputDir $avatar.FileName
    $img = [System.Drawing.Image]::FromFile($imgPath)
    $g.DrawImage($img, $x, $y, $cardSize, $cardSize)
    $img.Dispose()
}

$sheetPath = Join-Path $outputDir "preview-sheet.png"
$sheet.Save($sheetPath, [System.Drawing.Imaging.ImageFormat]::Png)

$fmt.Dispose()
$titleBrush.Dispose()
$subBrush.Dispose()
$sheetTitleFont.Dispose()
$sheetSubFont.Dispose()
$g.Dispose()
$sheet.Dispose()

Write-Output "Generated avatars in $outputDir"