#!/bin/bash
source ./.env

# Login
read -p "利用者ユーザID: " consumer_user_id
read -p "パスワード: " password

BODY=$(cat << EOS | jq
{
  "user_id": "$consumer_user_id",
  "password": "$password",
  "client_id": "consumer1_webapp",
  "client_secret": "X0IwpZHnuFI8uduRkM5RV5A8F1XJwF3T"
}
EOS
)
TOKEN=$(curl -X POST "$TOKEN_API" -sS -H "Content-Type: application/json" -d "$BODY" --cacert "$CA_CERT" | jq -r '.access_token')
echo "$TOKEN"
echo ""

# detail catalog search
read -p "詳細データセットID: " dataset_id
read -p "提供者ユーザID: " provider_user_id

curl -v -X GET "${CATALOG_SEARCH_API}?fq=caddec_dataset_id_for_detail:$dataset_id" -sS \
-H "Cache-Control: no-cache" \
-H "x-cadde-search: detail" \
-H "x-cadde-provider: $provider_user_id" \
-H "Authorization:Bearer $TOKEN" \
--cacert $CA_CERT \
| jq '.'
