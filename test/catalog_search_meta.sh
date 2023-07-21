#!/bin/bash
source ./.env

read -p "検索クエリ: " query

# 利用者コネクタのカタログ検索APIを叩く
curl -v -X GET "$CATALOG_SEARCH_API?q=$query" -sS \
-H "Cache-Control: no-cache" \
-H "x-cadde-search: meta" \
--cacert "$CA_CERT" \
| jq '.'
