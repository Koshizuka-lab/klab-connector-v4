#!/bin/bash
source ./.env

read -p "詳細データセットID: " dataset_id
read -p "提供者ユーザID: " provider_user_id
read -p "利用者トークン: " consumer_token

curl -v -X GET "${CONSUMER_CONNECTOR}/cadde/api/v4/catalog?fq=caddec_dataset_id_for_detail:${dataset_id}" -s -S \
-H "Cache-Control: no-cache" -H "x-cadde-search: detail" -H "x-cadde-provider: ${provider_user_id}" -H "Authorization:Bearer ${consumer_token}"
