#!/bin/bash
cd "$(dirname "$0")"
git add .
git commit -m "Update website"
git push
echo "Website updated."

# Tell Bing/Yandex (IndexNow) which pages exist, once GitHub Pages has redeployed (~1-2 min).
(
  sleep 120
  URLS=$(grep -oE '<loc>[^<]+</loc>' sitemap.xml | sed -E 's#</?loc>##g' | sed 's/.*/"&"/' | paste -sd, -)
  curl -s -o /dev/null -w "IndexNow: HTTP %{http_code}\n" -X POST "https://api.indexnow.org/indexnow"     -H "Content-Type: application/json; charset=utf-8"     -d "{\"host\":\"omniaops.com\",\"key\":\"931000e19dd0a3f5a99da8efb5349229\",\"keyLocation\":\"https://omniaops.com/931000e19dd0a3f5a99da8efb5349229.txt\",\"urlList\":[$URLS]}"
) &
