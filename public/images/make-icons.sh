#!/bin/bash

# Source image file
SOURCE_IMAGE="app-logo.png"

# Ensure ImageMagick is installed
if ! command -v magick &> /dev/null
then
    echo "Error: ImageMagick is not installed. Please install it."
    exit 1
fi

# Array of icon sizes from your JSON
declare -a SIZES=("72x72" "96x96" "128x128" "144x144" "152x152" "192x192" "384x384" "512x512")

# Create the icons directory if it doesn't exist
mkdir -p icons

# Loop through the sizes and generate the icons
for size in "${SIZES[@]}"
do
    OUTPUT_FILE="icons/icon-${size}.png"
    magick "$SOURCE_IMAGE" -resize "$size" "$OUTPUT_FILE"
    echo "Generated: $OUTPUT_FILE"
done

echo "Icon generation complete."