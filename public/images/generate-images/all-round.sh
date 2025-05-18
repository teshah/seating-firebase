#!/bin/bash

INPUT_IMAGE="input\j-logo.png" # Your source image
OUTPUT_DIR="circular_icons"
mkdir -p "$OUTPUT_DIR" # Create output directory if it doesn't exist

SIZES=("32x32" "48x48" "72x72" "96x96" "128x128" "144x144" "152x152" "192x192" "384x384" "512x512")

if [ ! -f "$INPUT_IMAGE" ]; then
    echo "Error: Input image '$INPUT_IMAGE' not found."
    exit 1
fi

for TARGET_SIZE in "${SIZES[@]}"; do
    OUTPUT_FILENAME="${OUTPUT_DIR}/icon-${TARGET_SIZE}.png"
    echo "Creating circular icon: $OUTPUT_FILENAME"

    magick "$INPUT_IMAGE" \
      \( +clone \
         -alpha transparent \
         -fill white \
         -gravity center \
         -draw "circle %[fx:min(w,h)/2],%[fx:min(w,h)/2] %[fx:min(w,h)/2],%[fx:min(w,h)/20]" \
      \) \
      -compose CopyOpacity  -composite \
      -resize "${TARGET_SIZE}" \
      "$OUTPUT_FILENAME"
done

echo "All circular icons created in '$OUTPUT_DIR'."