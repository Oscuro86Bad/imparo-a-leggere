# Genera le icone PNG dell'app "Imparo a Leggere" (nessuna dipendenza esterna).
# Uso:  powershell -ExecutionPolicy Bypass -File scripts/make-icon.ps1
Add-Type -AssemblyName System.Drawing

function New-Star([float]$cx, [float]$cy, [float]$r, [System.Drawing.Color]$color, [System.Drawing.Graphics]$g) {
  $pts = New-Object 'System.Drawing.PointF[]' 10
  for ($i = 0; $i -lt 10; $i++) {
    $ang = [Math]::PI / 5 * $i - [Math]::PI / 2
    $rad = if ($i % 2 -eq 0) { $r } else { $r * 0.45 }
    $pts[$i] = New-Object System.Drawing.PointF ([float]($cx + $rad * [Math]::Cos($ang))), ([float]($cy + $rad * [Math]::Sin($ang)))
  }
  $b = New-Object System.Drawing.SolidBrush $color
  $g.FillPolygon($b, $pts)
  $b.Dispose()
}

function Draw-Icon([int]$size, [string]$outPath) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
  $s = $size / 512.0  # fattore di scala

  # Sfondo sfumato azzurro ( pieno, adatto anche come icona "maskable" )
  $rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
  $grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush -ArgumentList $rect, ([System.Drawing.Color]::FromArgb(255,142,205,245)), ([System.Drawing.Color]::FromArgb(255,74,144,217)), ([float]90.0)
  $g.FillRectangle($grad, $rect)
  $grad.Dispose()

  $font = New-Object System.Drawing.Font ("Comic Sans MS", [float](64 * $s), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $letters = @(
    @{ t = 'A'; x =  46; y =  60; c = [System.Drawing.Color]::FromArgb(255,255,120,120) },
    @{ t = 'E'; x = 396; y =  52; c = [System.Drawing.Color]::FromArgb(255,126,217,87)   },
    @{ t = 'P'; x =  66; y = 320; c = [System.Drawing.Color]::FromArgb(255,255,201,60)   },
    @{ t = 'M'; x = 392; y = 300; c = [System.Drawing.Color]::FromArgb(255,255,150,220)  }
  )
  foreach ($l in $letters) {
    $b = New-Object System.Drawing.SolidBrush $l.c
    $g.DrawString($l.t, $font, $b, [float]($l.x * $s), [float]($l.y * $s))
    $b.Dispose()
  }
  $font.Dispose()

  # Stelline
  New-Star (250*$s) (36*$s) (22*$s) ([System.Drawing.Color]::FromArgb(255,255,215,64)) $g
  New-Star (440*$s) (160*$s) (16*$s) ([System.Drawing.Color]::FromArgb(255,255,235,120)) $g
  New-Star (70*$s) (180*$s) (14*$s) ([System.Drawing.Color]::FromArgb(255,255,235,120)) $g

  # --- Gufo disegnato con primitive ---
  $bodyC = [System.Drawing.Color]::FromArgb(255,255,159,67)      # arancione
  $darkC = [System.Drawing.Color]::FromArgb(255,230,126,34)      # arancione scuro
  $white = [System.Drawing.Color]::White
  $ink   = [System.Drawing.Color]::FromArgb(255,62,50,60)

  # orecchie
  $tri = @( (New-Object System.Drawing.PointF ([float](168*$s)),([float](150*$s))),
            (New-Object System.Drawing.PointF ([float](214*$s)),([float](96*$s))),
            (New-Object System.Drawing.PointF ([float](226*$s)),([float](170*$s))) )
  $tri2 = @( (New-Object System.Drawing.PointF ([float](344*$s)),([float](150*$s))),
             (New-Object System.Drawing.PointF ([float](298*$s)),([float](96*$s))),
             (New-Object System.Drawing.PointF ([float](286*$s)),([float](170*$s))) )
  $b1 = New-Object System.Drawing.SolidBrush $darkC
  $g.FillPolygon($b1, $tri);  $g.FillPolygon($b1, $tri2)

  # corpo
  $bodyBrush = New-Object System.Drawing.SolidBrush $bodyC
  $g.FillEllipse($bodyBrush, [float](150*$s), [float](120*$s), [float](212*$s), [float](300*$s))

  # pancia
  $g.FillEllipse((New-Object System.Drawing.SolidBrush $white), [float](184*$s), [float](220*$s), [float](144*$s), [float](180*$s))

  # ali
  $wing = New-Object System.Drawing.SolidBrush $darkC
  $g.FillEllipse($wing, [float](128*$s), [float](190*$s), [float](52*$s), [float](150*$s))
  $g.FillEllipse($wing, [float](332*$s), [float](190*$s), [float](52*$s), [float](150*$s))

  # occhi
  $g.FillEllipse((New-Object System.Drawing.SolidBrush $white), [float](172*$s), [float](160*$s), [float](76*$s), [float](76*$s))
  $g.FillEllipse((New-Object System.Drawing.SolidBrush $white), [float](264*$s), [float](160*$s), [float](76*$s), [float](76*$s))
  $g.FillEllipse((New-Object System.Drawing.SolidBrush $ink),   [float](196*$s), [float](184*$s), [float](30*$s), [float](30*$s))
  $g.FillEllipse((New-Object System.Drawing.SolidBrush $ink),   [float](288*$s), [float](184*$s), [float](30*$s), [float](30*$s))
  $glint = New-Object System.Drawing.SolidBrush $white
  $g.FillEllipse($glint, [float](202*$s), [float](188*$s), [float](10*$s), [float](10*$s))
  $g.FillEllipse($glint, [float](294*$s), [float](188*$s), [float](10*$s), [float](10*$s))

  # becco
  $beak = @( (New-Object System.Drawing.PointF ([float](234*$s)),([float](224*$s))),
             (New-Object System.Drawing.PointF ([float](278*$s)),([float](224*$s))),
             (New-Object System.Drawing.PointF ([float](256*$s)),([float](262*$s))) )
  $g.FillPolygon((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,255,201,60))), $beak)

  # libro aperto davanti alla pancia
  $bookW = [System.Drawing.Color]::White
  $line  = New-Object System.Drawing.Pen -ArgumentList ([System.Drawing.Color]::FromArgb(255,74,144,217)), ([float](3*$s))
  $pg1 = @( (New-Object System.Drawing.PointF ([float](186*$s)),([float](300*$s))),
            (New-Object System.Drawing.PointF ([float](254*$s)),([float](316*$s))),
            (New-Object System.Drawing.PointF ([float](254*$s)),([float](384*$s))),
            (New-Object System.Drawing.PointF ([float](186*$s)),([float](368*$s))) )
  $pg2 = @( (New-Object System.Drawing.PointF ([float](254*$s)),([float](316*$s))),
            (New-Object System.Drawing.PointF ([float](322*$s)),([float](300*$s))),
            (New-Object System.Drawing.PointF ([float](322*$s)),([float](368*$s))),
            (New-Object System.Drawing.PointF ([float](254*$s)),([float](384*$s))) )
  $bb = New-Object System.Drawing.SolidBrush $bookW
  $g.FillPolygon($bb, $pg1); $g.FillPolygon($bb, $pg2)
  $g.DrawLine($line, [float](254*$s), [float](316*$s), [float](254*$s), [float](384*$s))
  $g.DrawPolygon($line, $pg1); $g.DrawPolygon($line, $pg2)

  # zampe
  $feet = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,255,201,60))
  $g.FillEllipse($feet, [float](204*$s), [float](404*$s), [float](36*$s), [float](20*$s))
  $g.FillEllipse($feet, [float](272*$s), [float](404*$s), [float](36*$s), [float](20*$s))

  $g.Dispose()
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "Creata icona: $outPath"
}

$root = Join-Path $PSScriptRoot ".."
New-Item -ItemType Directory -Force -Path (Join-Path $root "icons") | Out-Null
Draw-Icon 512 (Join-Path $root "icons\icon-512.png")
Draw-Icon 192 (Join-Path $root "icons\icon-192.png")
