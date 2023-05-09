#!/bin/bash
start_type=$1

if [ "$start_type" = "noproxy" ]
then
    # フォワードプロキシ、リバースプロキシを起動しない
    # docker compose -f docker-compose_noreverseproxy.yml up consumer-catalog-search consumer-data-exchange consumer-authentication consumer-provenance-management consumer-connector-main -d
    # デタッチしない
    docker compose -f docker-compose_noreverseproxy.yml up consumer-catalog-search consumer-data-exchange consumer-authentication consumer-provenance-management consumer-connector-main
    docker compose ps

elif [ "$start_type" = "noforwardproxy" ]
then
    # フォワードプロキシを起動しない
    # docker compose -f docker-compose.yml up consumer-catalog-search consumer-data-exchange consumer-authentication consumer-provenance-management consumer-connector-main consumer-reverse-proxy -d
    # デタッチしない
    docker compose -f docker-compose.yml up consumer-catalog-search consumer-data-exchange consumer-authentication consumer-provenance-management consumer-connector-main consumer-reverse-proxy
    docker compose ps

elif [ "$start_type" = "noreverseproxy" ]
then
    # リバースプロキシを起動しない
    # docker compose -f docker-compose_noreverseproxy.yml up -d
    # デタッチしない
    docker compose -f docker-compose_noreverseproxy.yml up
    docker compose ps

else
    # 全コンテナを起動
    docker compose -f docker-compose.yml up -d
    # デタッチしない
    docker compose -f docker-compose.yml up
    docker compose ps

fi
