#!/bin/bash
source ./.env

read -p "ユーザID: " user_id
read -p "パスワード: " password

BODY=$(cat << EOS | jq
{
  "user_id": "$user_id",
  "password": "$password",
  "client_id": "consumer1_webapp",
  "client_secret": "X0IwpZHnuFI8uduRkM5RV5A8F1XJwF3T"
}
EOS
)

curl -v -X POST "$TOKEN_API" -sS \
-H "Content-Type: application/json" \
-d "$BODY" \
--cacert "$CA_CERT" \
| jq '.'
