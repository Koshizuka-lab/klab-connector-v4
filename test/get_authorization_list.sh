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
read -p "提供者ユーザID: " provider_user_id

curl -v -G "$AUTHORIZATION_LIST_API" -s -S \
-H "Authorization:Bearer $TOKEN" \
-d "assigner=${provider_user_id}" \
--cacert "$CA_CERT" \
| jq '.'
