Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Users\ZS LAPTOP MART\house-rent-management\public\icon.jpg")

$bmp192 = New-Object System.Drawing.Bitmap 192, 192
$g192 = [System.Drawing.Graphics]::FromImage($bmp192)
$g192.DrawImage($img, 0, 0, 192, 192)
$bmp192.Save("C:\Users\ZS LAPTOP MART\house-rent-management\public\icon-192x192.png", [System.Drawing.Imaging.ImageFormat]::Png)

$bmp512 = New-Object System.Drawing.Bitmap 512, 512
$g512 = [System.Drawing.Graphics]::FromImage($bmp512)
$g512.DrawImage($img, 0, 0, 512, 512)
$bmp512.Save("C:\Users\ZS LAPTOP MART\house-rent-management\public\icon-512x512.png", [System.Drawing.Imaging.ImageFormat]::Png)

$g192.Dispose()
$bmp192.Dispose()
$g512.Dispose()
$bmp512.Dispose()
$img.Dispose()
