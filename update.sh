#!/bin/bash
cd "$(dirname "$0")"
git add .
git commit -m "Update website"
git push
echo "Website updated."
