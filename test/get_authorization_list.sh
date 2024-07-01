#!/bin/bash
source .env.provider

BASIC=$(echo -n "${CLIENT_ID}:${CLIENT_SECRET}" | base64)

# Login
read -p "User ID: " consumer_user_id
read -p "Password: " password

BODY=$(cat << EOS | jq
{
  "user_id": "$consumer_user_id",
  "password": "$password"
}
EOS
)
TOKEN=$(curl -X POST "$TOKEN_API" -sS -H "Content-Type: application/json" -H "Authorization: Basic $BASIC" -d "$BODY" --cacert "$CA_CERT" | jq -r '.access_token')
echo "Successfully authenticated."
echo

# list authorization policies
read -p "Provider User ID: " provider_user_id

result=$(curl -v -X GET "${AUTHZ_LIST_API}?assigner=${provider_user_id}" -sS \
-H "Authorization:Bearer $TOKEN" \
--cacert "$CA_CERT" \
--cert "$CLIENT_CERT" \
--key "$CLIENT_KEY")

if command -v jq &> /dev/null; then
    echo "$result" | jq '.'
else
    echo "$result"
fi
