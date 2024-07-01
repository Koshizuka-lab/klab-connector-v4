#!/bin/bash
source .env.consumer

read -p "Query: " query

# 利用者コネクタのカタログ検索APIを叩く
result=$(curl -v -X GET "$CATALOG_SEARCH_API?q=$query" -sS \
-H "Cache-Control: no-cache" \
-H "x-cadde-search: meta" \
--cacert "$CA_CERT")

if command -v jq &> /dev/null; then
    echo "$result" | jq '.'
else
    echo "$result"
fi
