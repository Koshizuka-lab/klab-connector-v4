#!/bin/bash
source .env.consumer

BASIC=$(echo -n "${CLIENT_ID}:${CLIENT_SECRET}" | base64)

read -p "User ID: " user_id
read -p "Password: " password

BODY=$(cat << EOS | jq
{
  "user_id": "$user_id",
  "password": "$password"
}
EOS
)

result=$(curl -v -X POST "$TOKEN_API" -sS \
-H "Content-Type: application/json" \
-H "Authorization: Basic $BASIC" \
-d "$BODY" \
--cacert "$CA_CERT")

if command -v jq &> /dev/null; then
    echo "$result" | jq '.'
else
    echo "$result"
fi
