#!/bin/bash
source .env.consumer

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

# detail catalog search
read -p "Dataset ID: " dataset_id
read -p "Provider User ID: " provider_user_id

result=$(curl -v -X GET "${CATALOG_SEARCH_API}?fq=caddec_dataset_id_for_detail:${dataset_id}" -sS \
-H "Cache-Control: no-cache" \
-H "x-cadde-search: detail" \
-H "x-cadde-provider: $provider_user_id" \
-H "Authorization:Bearer $TOKEN" \
--cacert $CA_CERT)

if command -v jq &> /dev/null; then
    echo "$result" | jq '.'
else
    echo "$result"
fi
