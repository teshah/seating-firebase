#!/bin/bash

# Loop from 1 to 12
for i in {1..12}
do
  # Check if the number is even or odd
  if [ $(($i % 2)) -eq 0 ]; then
    # Even number - use pink
    source_file="light-pink.png"
  else
    # Odd number - use green
    source_file="light-green.png"
  fi

  destination_file="table-bg-$i.png"

  # Copy the file
  cp "$source_file" "$destination_file"
  echo "Copied $source_file to $destination_file"
done

echo "File copying complete."