#!/bin/bash
source ./.env

read -p "検索クエリ: " query

# 利用者コネクタのカタログ検索APIを叩く
curl -v -X GET "${CONSUMER_CONNECTOR}/cadde/api/v4/catalog?q=${query}" -s -S -H "Cache-Control: no-cache" -H "x-cadde-search: meta"
echo ""
