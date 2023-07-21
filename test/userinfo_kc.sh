#!/bin/bash
source ./.env

KEYCLOAK_API=https://authn.ut-cadde.jp:18443/keycloak/realms/authentication/protocol/openid-connect
TOKEN_API="${KEYCLOAK_API}/token"
USERINFO_API="${KEYCLOAK_API}/userinfo"

CREDENTIAL=consumer1_webapp:X0IwpZHnuFI8uduRkM5RV5A8F1XJwF3T
BASIC=$(echo -n "$CREDENTIAL" | base64)

TOKEN=$(
  curl -X POST "$TOKEN_API" -sS \
  -H "Authorization: Basic $BASIC" \
  -d "grant_type=password" \
  -d "username=consumer1" \
  -d "password=consumer" \
  --cacert "$CA_CERT" \
  | jq -r '.access_token'
)
echo "$TOKEN"

curl -v -X GET "$USERINFO_API" \
-H "Authorization: Bearer $TOKEN" \
--cacert "$CA_CERT" \
| jq '.'

