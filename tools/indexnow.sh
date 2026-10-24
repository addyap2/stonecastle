#!/bin/sh
# Tells Bing (and the other IndexNow search engines) to crawl every page in sitemap.xml now.
# Run it from the site's folder after publishing new or changed pages:  sh tools/indexnow.sh
# The key file at the site's root (1b75cc1476e62d6edef57ab43498ac33.txt) must stay in place.
KEY=1b75cc1476e62d6edef57ab43498ac33
URLS=$(grep -o '<loc>[^<]*' sitemap.xml | sed 's/<loc>//' | sed 's/.*/"&"/' | paste -sd, -)
BODY="{\"host\":\"janstenborg.com\",\"key\":\"$KEY\",\"keyLocation\":\"https://janstenborg.com/$KEY.txt\",\"urlList\":[$URLS]}"
for ENDPOINT in https://www.bing.com/indexnow https://api.indexnow.org/indexnow; do
  printf '%s: ' "$ENDPOINT"
  curl -s -o /dev/null -w '%{http_code} (200 or 202 = accepted)\n' -X POST "$ENDPOINT" -H 'Content-Type: application/json; charset=utf-8' -d "$BODY"
done
