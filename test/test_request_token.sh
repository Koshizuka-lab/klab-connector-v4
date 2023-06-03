#!/bin/bash
source ./.env

curl -X POST ${AUTHN_API}/cadde/api/v4/token \
-H "Content-Type: application/json" \
-d '{"user_id": "consumer1", "password": "consumer", "client_id": "consumer1_webapp", "client_secret": "X0IwpZHnuFI8uduRkM5RV5A8F1XJwF3T"}'
echo ""
