#!/bin/bash
source ./.env

read -p "リソースURL: " resource_url
read -p "リソース提供手段（http / ftp / ngsi）: " resource_api_type
read -p "提供者ユーザID: " provider_user_id
read -p "利用者トークン: " consumer_token
read -p "出力ファイル: " output_file

curl -v -X GET "${CONSUMER_CONNECTOR}/cadde/api/v4/file" -s -S \
-H "Cache-Control: no-cache" -H "x-cadde-resource-url: ${resource_url}" -H "x-cadde-resource-api-type: ${resource_api_type}" \
-H "x-cadde-provider: ${provider_user_id}" -H "Authorization:Bearer ${consumer_token}" \
-o ${output_file}
