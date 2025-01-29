#!/bin/bash

# Define the directories to clean
dirs=(
    "./examples/**/.gen"
    "./examples/**/node_modules"
    "./examples/**/cdktf.out"
)

# Loop through and remove each directory
for dir in "${dirs[@]}"; do
    echo "Cleaning: $dir"
    rm -rf $dir
done

echo "Cleanup complete."
