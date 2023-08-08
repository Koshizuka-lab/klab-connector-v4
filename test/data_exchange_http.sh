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

# data exchange
read -p "リソースURL: " resource_url
read -p "提供者ユーザID: " provider_user_id

curl -v -X GET "$DATA_EXCHANGE_API" -s -S \
-H "Cache-Control: no-cache" \
-H "x-cadde-resource-url: $resource_url" \
-H "x-cadde-resource-api-type: file/http" \
-H "x-cadde-provider: $provider_user_id" \
-H "Authorization:Bearer $TOKEN" \
--cacert "$CA_CERT"
