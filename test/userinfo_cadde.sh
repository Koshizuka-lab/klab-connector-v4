#!/bin/bash
source ./.env

CADDE_API=https://authn.ut-cadde.jp:18443/cadde/api/v4
KEYCLOAK_API=https://authn.ut-cadde.jp:18443/keycloak/realms/authentication/protocol/openid-connect

TOKEN_API="${CADDE_API}/token"
USERINFO_API="${KEYCLOAK_API}/userinfo"

TOKEN=$(
  curl -X POST "$TOKEN_API" -sS \
  -H "Content-Type: application/json" \
  -d '{"user_id": "consumer1", "password": "consumer", "client_id": "consumer1_webapp", "client_secret": "X0IwpZHnuFI8uduRkM5RV5A8F1XJwF3T"}' \
  --cacert "$CA_CERT" \
  | jq -r '.access_token'
)
echo "$TOKEN"

curl -v -X GET "$USERINFO_API" \
-H "Authorization: Bearer $TOKEN" \
--cacert "$CA_CERT" \
| jq '.'
