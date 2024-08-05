# データ利用者環境の構築

## 事前に準備が必要なもの
- CADDEテストベッド利用申請
- ドメインの取得
- TLS証明書の取得
- データサーバの準備
- GitHub利用準備
  - SSHでクローンする場合


## 1. Installation

### 1.1. 利用者コネクタ環境準備

#### 1.1.1. 利用者コネクタ取得
GitHubからCADDEコネクタリポジトリをクローンする。

```bash
❯ git clone git@github.com:Koshizuka-lab/klab-connector-v4.git
❯ cd klab-connector-v4
❯ git checkout -b dev-klab origin/dev-klab
```

ブランチが`dev-klab`であることを確認する。
```bash
❯ git branch -l
* dev-klab
  main
```

利用者コネクタ用ソースコードが配置してあるディレクトリ`klab-connector-v4/src/consumer`に移動する。
```bash
❯ cd src/consumer
❯ pwd
```

#### 1.1.2. 共通ファイルの展開
`setup.sh`を実行する。
```bash
❯ cd ${WORKDIR}/klab-connector-v4/src/consumer
❯ sh setup.sh
```

#### 1.1.3. リバースプロキシの設定
利用者コネクタに対する通信はHTTPSによる接続が推奨される。
そこで、リバースプロキシ上でTLSサーバ証明書の設定を行う。

##### 秘密鍵・サーバ証明書の準備
[certificate.md](certificate.md)に基づき、CADDEテストベッド参加サイト用の秘密鍵とワイルドカード証明書のペアを作成する。

秘密鍵とワイルドカード証明書の作成後、それらを配置するためのディレクトリを作成する。
このディレクトリはリバースプロキシ用Dockerコンテナにマウントされる。
```bash
❯ mkdir ${WORKDIR}/klab-connector-v4/src/consumer/nginx/volumes/ssl
```

上で作成したディレクトリに秘密鍵とワイルドカード証明書のファイルをそれぞれ`server.key`、`server.crt`というファイル名で配置する
（ただし、これらのファイル名はNginxの設定ファイルを編集することで変更可能）。

ディレクトリが以下の状態になれば完了である。
```bash
❯ ls ${WORKDIR}/klab-connector-v4/src/consumer/nginx/volumes/ssl
server.crt  server.key
```

#### 1.1.4. フォワードプロキシの設定
CADDEはデータ共有の信頼性を高めるため、利用者コネクタ - 提供者コネクタ間の相互TLS通信をサポートしている。
ここでは、提供者コネクタに提示するクライアント証明書、および提供者コネクタに対するインタフェースとなるフォワードプロキシの準備を行う。

##### 秘密鍵・クライアント証明書の準備
[certificate.md](certificate.md)に基づき、CADDEテストベッド参加サイト用の秘密鍵とワイルドカード証明書のペアを作成する。
ここでは簡単のため、リバースプロキシと同じ秘密鍵・ワイルドカード証明書を用いてもよい。

秘密鍵とワイルドカード証明書の作成後、それらを配置するためのディレクトリを作成する。
このディレクトリはフォワードプロキシ用Dockerコンテナにマウントされる。
```bash
❯ mkdir ${WORKDIR}/klab-connector-v4/src/consumer/squid/volumes/ssl
```

上で作成したディレクトリに秘密鍵とワイルドカード証明書のファイルをそれぞれ`client.key`、`client.crt`というファイル名で配置する
（ただし、これらのファイル名はSquidの設定ファイルを編集することで変更可能）。

ディレクトリが以下の状態になれば完了である。
```bash
❯ ls ${WORKDIR}/klab-connector-v4/src/consumer/squid/volumes/ssl
client.crt  client.key
```

##### SSL Bump用自己署名SSL証明書を作成
フォワードプロキシは利用者コネクタ - 提供者コネクタ間のTLSセッションを中継する機能を持つ。これをSSL Bumpという。
CADDEでは利用者コネクタが提供者コネクタにアクセスするたび、SSL Bumpを利用することでフォワードプロキシがクライアント証明書を提示するようにする。

このとき、利用者コネクタ本体は一時的にフォワードプロキシとの間にTLSセッションを張るため、フォワードプロキシにTLS証明書を配置する必要がある。
そこで、フォワードプロキシに自己署名TLS証明書を配置し、プロキシがその証明書を基に動的にサーバ証明書を生成し、利用者コネクタ本体に提示するようにしている。

以上の動作を実現するため、以下のコマンドによってフォワードプロキシ上にSSL Bump用自己署名TLS証明書を作成する。
`squidCA.pem`という名前のファイルが作成されれば、設定は完了である。
```bash
❯ cd ${WORKDIR}/klab-connector-v4/src/consumer/squid/volumes/ssl
❯ openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 -keyout squidCA.pem -out squidCA.pem
❯ ls
squidCA.pem
```

なお、証明書の作成過程でサーバの識別情報が聞かれるが、Common Name以外の項目はスキップまたは適当な文字列で設定すればよい。
Common Nameは適当な文字列でよい。

##### フォワードプロキシの初期設定
利用者コネクタ全体を起動する前に、フォワードプロキシ用コンテナを一度起動させ、SSL Bumpの初期設定をする必要がある。

まず、以下のコマンドを実行してフォワードプロキシを起動する。
```bash
❯ cd ${WORKDIR}/klab-connector-v4/src/consumer/squid
❯ docker compose -f docker-compose_initial.yml up -d --build
```

以下のコマンドでフォワードプロキシが起動しているか確認する。
```bash
❯ docker compose -f docker-compose_initial.yml ps
NAME                IMAGE               COMMAND                  SERVICE             CREATED             STATUS              PORTS
forward-proxy       cadde-squid:4.0.0   "/usr/sbin/squid '-N…"   squid               44 seconds ago      Up 43 seconds       0.0.0.0:3128->3128/tcp, :::3128->3128/tcp
```

次に、以下のコマンドを実行してSSL Bumpで用いられるデータベースを初期化する。
```bash
❯ docker exec -it forward-proxy /usr/lib/squid/security_file_certgen -c -s /var/lib/squid/ssl_db -M 20MB
Initialization SSL db...
Done
```

そして、フォワードプロキシ用コンテナ内部のディレクトリをホストにコピーする。


プロキシコンテナ内の`var/lib/squid/ssl_db`ディレクトリをホスト上の`src/consumer/squid/volumes`以下にコピーする。
```bash
❯ docker cp forward-proxy:/var/lib/squid/ssl_db ./volumes/
Successfully copied 3.58kB to /Users/mitk/klab-connector-v4/src/consumer/squid/volumes/
```

以上でフォワードプロキシの初期設定は終了であるため、コンテナを終了させる。
```bash
❯ docker compose -f docker-compose_initial.yml down
[+] Running 2/2
 ✔ Container forward-proxy  Removed
 ✔ Network squid_default    Removed
```

TODO: ACLのsafe_portの設定はどうする？



#### 1.1.5. データカタログの接続設定

設定すべきコンフィグファイルの一覧は以下の通り。

| コンフィグファイル | 概要 |
| :------------  | :----- |
| location.json | 提供者IDとコネクタURLのマッピング |
| connector.json | 利用者コネクタ設定 |
| public_ckan.json | 横断検索サーバURL設定 |


横断検索カタログから取得したいデータを検索するため、横断検索カタログサイトURLを設定ファイルに記載する。

パス: `src/consumer/catalog-search/swagger_server/configs/public_ckan.json`

| 設定パラメータ | 概要 |
| :---------- | :---- |
| public_ckan_url | 横断検索カタログURL |

（記入例）
```json:public_ckan.json
{
    "public_ckan_url": "http://cadde-federated-catalog.koshizukalab.dataspace.internal:25000/api/package_search"
}
```

#### 1.1.6. 認証機能の接続設定
認証機能との接続には、認証機能によって割り当てられた利用者コネクタの情報が必要である。

パス: `src/consumer/connector-main/swagger_server/configs/connector.json`

| 設定パラメータ | 概要 |
| :--------- | :------- |
| consumer_connector_id | 認証機能発行の利用者コネクタのクライアントID |
| consumer_connector_secret | 認証機能発行の利用者コネクタのクライアントシークレット |
<!-- | location_service_url | ロケーションサービスのアクセスURL | -->
<!-- | trace_log_enable | コネクタの詳細ログ出力有無（出力無の設定でも基本的な動作ログは出力される） | -->

```json:connector.json
{
    "consumer_connector_id" : "<利用者コネクタ クライアントID>",
    "consumer_connector_secret" : "<利用者コネクタ クライアントシークレット>",
    // "location_service_url" : "https://testexample.com",
    // "trace_log_enable" : false
}
```

#### 1.1.7. 提供者コネクタの接続設定
データ提供者のユーザIDと提供者コネクタのURLを紐づける。
ロケーションサービスを利用することで自動的に提供者コネクタのロケーションを解決することも可能だが、本ハンズオンでは利用者コネクタに手動で提供者コネクタのロケーションを追記していく。

パス: `src/consumer/connector-main/swagger_server/configs/location.json`

| 設定パラメータ | 概要 |
| :--------- | :------- |
| connector_location | 提供者IDとコネクタURLのマッピング |
| connector_location.<提供者ID> | CADDEユーザID(提供者) を記載する |
| connector_location.<提供者ID>.provider_connector_url | 提供者コネクタのアクセスURL |

```json:location.json
{
    "connector_location": {
        "test1": {
            "provider_connector_url": "https://cadde-provider-test1.koshizukalab.dataspace.internal:1443"
        }
    }
}
```

#### 1.1.8. 来歴管理の接続設定（TODO）
来歴管理機能を利用する場合、来歴管理サーバURLを設定ファイルに記載する。

パス: `src/consumer/provenance-management/swagger_server/configs/provenance.json`

| 設定パラメータ                     | 概要                                  |
| :------------------------------ | :----------------------------------- |
| provenance_management_api_url | 来歴管理サーバURL |

```json:provenance.json
{
    "provenance_management_api_url": "http://cadde-provenance-management.koshizukalab.dataspace.internal:3000/v2"
}
```


#### 1.1.9. その他カスタマイズ可能な項目
- TODO: 他には？

##### 利用者コネクタのポート番号
`docker-compose.yml`を編集することで、利用者コネクタを起動する際のポート番号を変更することができる。

以下の例では利用者コネクタをホストマシンの80, 443番で立ち上げ、コンテナの80, 443番ポートにそれぞれフォワーディングしている。
```yaml:docker-compose.yml
...
services:
  consumer-reverse-proxy:
    ports:
      - 443:443
      - 80:80
```

#### 1.1.10. 利用者コネクタの起動
以下のコマンドを実行し、利用者コネクタ用のDockerコンテナ群を起動する。
```bash
❯ cd ${WORKDIR}/klab-connector-v4/src/consumer
❯ sh ./start.sh
```

起動した利用者コネクタの構成は以下の通り。
![利用者コネクタ構成](./images/consumer.png)

利用者コネクタの起動状況は以下のコマンドで確認できる。
```bash
❯ cd ${WORKDIR}/klab-connector-v4/src/consumer
❯ docker compose ps
...
```

利用者コネクタが起動できれば、[usage.mdに記載された利用者コネクタの使い方](./usage.md#利用者)を参考にCADDEを利用する。

#### （参考）利用者コネクタの停止
利用者コネクタを停止したい場合は、以下のコマンドを実行する。
```bash
❯ cd ${WORKDIR}/klab-connector-v4/src/consumer
❯ sh ./stop.sh
```


### 1.2. 利用者WebApp環境準備

#### 1.2.1. 利用者WebApp取得
GitHubからCADDE利用者WebAppのリポジトリをクローンする。

```bash
❯ git clone git@github.com:Koshizuka-lab/ut-cadde_gui.git
❯ cd ut-cadde_gui
❯ git checkout -b ut-cadde-v0 origin/ut-cadde-v0
```

ブランチが`ut-cadde-v0`であることを確認する。
```bash
❯ git branch -l
* ut-cadde-v0
  main
```

#### 1.2.2. 環境変数の設定
利用者WebAppを利用するには、認証機能から割り当てられたWebAppのクライアント情報が必要となる。
そこで、WebAppのクライアント情報を環境変数に設定する。

ここでは`.env.local`ファイルを編集し、アプリケーションコード内で環境変数を読み込ませる。
```bash
❯ cp .env .env.local
❯ vim .env.local
CLIENT_ID=<WebAppクライアントID>
CLEINT_SECRET=<WebAppクライアントシークレット>
```

#### 1.2.3. その他カスタマイズ可能な項目

##### 利用者WebAppのポート番号
`docker-compose.yml`を編集することで、利用者WebAppを起動する際のポート番号を変更することができる。

以下の例では利用者WebAppをホストマシンの3000番で立ち上げ、コンテナの3000番ポートにフォワーディングしている。
```yaml:docker-compose.yml
...
services:
  app:
    ports:
      - "3000:3000"
```

#### 1.2.4. 利用者WebAppの起動
以下のコマンドを実行し、利用者WebApp用のDockerコンテナを起動する。
デフォルトでは3000番ポートで起動される。
```bash
❯ cd ${WORKDIR}/ut-cadde_gui
❯ sudo docker compose up -d --build
```

利用者WebAppの起動状況は以下のコマンドで確認できる。
```bash
❯ cd ${WORKDIR}/ut-cadde_gui
❯ sudo docker compose ps
...
```

#### （参考）利用者WebAppの停止
利用者WebAppを停止したい場合は、以下のコマンドを実行する。
```bash
❯ cd ${WORKDIR}/ut-cadde_gui
❯ sudo docker compose down
```


## 2. 動作確認
- XXX.mdを参照
  - WebApp
    - ログイン
    - 横断検索
    - 詳細検索
    - データ取得（認可なし）
    - データ取得（認可あり）
  - API
    - ログイン
    - 横断検索
    - 詳細検索
    - データ取得（認可なし）
    - データ取得（認可あり）

