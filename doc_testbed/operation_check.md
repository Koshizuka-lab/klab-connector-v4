# CADDE 動作確認
本資料は、CADDEテストベッド用に構築したデータ利用者環境・データ提供者環境の動作確認手順を示すものである。

<!-- 本章では、利用者コネクタ、提供者コネクタを経由し、HTTPサーバからデータを取得する方法を説明する。 -->
## 前提条件
- データ提供者環境を構築していること
- データ提供者環境で提供者カタログへのアクセスが認可されていること
- データ提供者環境で提供データを登録していること
    - 認可なし
    - 認可あり

## WebAppを利用する場合

### ユーザ認証

### 利用する利用者コネクタの登録

### 横断検索カタログを通じたデータの検索

### 提供者カタログを通じたデータの検索

### コネクタを介したデータの取得


## CADDE APIを利用する場合

### ユーザ認証
認証機能のトークン取得APIを利用して、CADDE利用者トークンを取得する。

TODO: トークン取得APIの仕様はXXXを参照

<!-- CADDE利用者トークンはJSON形式のレスポンス内で`access_token`というkeyに対応している。 -->

以下にトークン取得APIの実行例を示す。
リクエストヘッダにクライアントID・シークレットをbase64エンコーディングしたもの、リクエストボディにCADDEユーザID・パスワードをJSON形式で指定する。

また、認証機能に対するHTTPS通信を行うためには、認証機能のCA証明書、すなわちテストベッド用プライベート認証局を信頼する設定を行う必要がある。
これは、curlコマンドの`--cacert`オプションで指定できる。

```bash
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
```
```bash
# output
{"access_token":"eyJhb...","refresh_token":"eyJhb..."}
```

CADDE利用者トークンは、[提供者カタログを通じたデータの検索](#提供者カタログを通じたデータの検索)や[コネクタを介したデータの取得](#コネクタを介したデータの取得)において、ユーザ情報を取得し認可判断を行うために用いられる。

トークンの有効期間は30分に設定しているため、有効期間が過ぎれば再度APIを実行してCADDE利用者トークンを取得し直す。


### 横断検索カタログを通じたデータの検索
利用者コネクタのカタログ検索APIを利用して、横断検索カタログを通じたデータの検索を行う。

以下にカタログ検索APIの実行例を示す。
クエリパラメータにデータセットの検索キーワード、リクエストヘッダ`x-cadde-search`に横断検索を示す`meta`という値を指定する。

また、curlコマンドの`--cacert`オプションで利用者コネクタのCA証明書を指定できる。

```bash
curl -v -X GET "https://<利用者コネクタのFQDN>:<ポート番号>/cadde/api/v4/catalog?q=<検索キー>" -sS -H "Cache-Control: no-cache" -H "x-cadde-search: meta"　--cacert <CA証明書>
```

### 提供者カタログを通じたデータの検索
- 前提条件
    - 提供者カタログに対するアクセスが認可されていること

利用者コネクタのカタログ検索APIを利用して、横断検索で得たカタログ情報を基に提供者カタログを通じたデータの検索を行う。

以下にカタログ検索APIの実行例を示す。
クエリパラメータに詳細検索用のデータセットIDを指定しているが、これは横断検索カタログの検索結果から取得できる。

リクエストヘッダについては以下の3つの項目を指定する。
- `x-cadde-search`
    - 詳細検索を示す`detail`という値を指定
- `x-cadde-provider`
    - 検索対象の提供者カタログを管理するデータ提供者のCADDEユーザID
- `Authorization`
    - ユーザ認証時に取得した利用者トークン

また、curlコマンドの`--cacert`オプションで利用者コネクタのCA証明書を指定できる。

```bash
curl -v -X GET 'https://<利用者コネクタのFQDN>:<ポート番号>/cadde/api/v4/catalog?fq=caddec_dataset_id_for_detail:<詳細検索用データセットID>' -sS -H "Cache-Control: no-cache" -H "x-cadde-search: detail" -H "x-cadde-provider: <データ提供者のCADDEユーザID>" -H "Authorization:Bearer <CADDE利用者トークン>" --cacert <CA証明書>
```

上記のコマンドを実行した結果、データセットIDが一致するデータセットの情報が取得できていればよい。


### コネクタを介したデータの取得
- 前提条件
    - アクセスが認可されたデータが提供されていること

利用者コネクタのデータ取得APIを利用して、詳細検索で得たカタログ情報を基にデータの取得を行う。

以下にデータ取得APIの実行例を示す。

リクエストヘッダについて以下の4つの項目を指定する。
- `x-cadde-resource-url`
    - データのURL
- `x-cadde-resource-api-type`
    - データサーバのプロトコル（HTTP / FTP / NGSI）
    - HTTPサーバは`file/http`という値で指定する
- `x-cadde-provider`
    - データ提供者のCADDEユーザID
- `Authorization`
    - ユーザ認証時に取得した利用者トークン

また、`curl`コマンドの`-o`オプションでレスポンスの出力先、`--cacert`オプションで利用者コネクタのCA証明書を指定できる。
```bash
curl -v -X GET "https://<利用者コネクタのFQDN>:<ポート番号>/cadde/api/v4/file" -sS -H "Cache-Control: no-cache" -H "x-cadde-resource-url: <データURL>" -H "x-cadde-resource-api-type: file/http" -H "x-cadde-provider: <提供者ID>" -H "Authorization:Bearer <CADDE利用者トークン>" \
-o <出力ファイル名> --cacert <CA証明書>
```
