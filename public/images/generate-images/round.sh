magick icon-192x192.png \
\( -size 192x192 xc:none -fill white -draw "circle 100,100,100,12" \) \
-compose CopyOpacity -composite round-icon-192.png

magick icon-512x512.png \
\( -size 512x512 xc:none -fill white -draw "circle 256,256,256,24" \) \
-compose CopyOpacity -composite round-icon-512.png
