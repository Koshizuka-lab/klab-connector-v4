# 1. 利用者コネクタ
## 1.1 利用者コネクタ構築手順

### 1.1.1. 利用者コネクタ取得
越塚研GitHubからCADDEコネクタ用リポジトリをSSHでクローンする。リポジトリのクローン後、コネクタ構築デモ用のブランチ`demo`に切り替える。

※ GitHubとのSSH接続設定をすでに行っていることを前提とする。
```bash
git clone git@github.com:Koshizuka-lab/klab-connector-v4.git
cd klab-connector-v4
git checkout -b demo origin/demo
git branch -l
```
```bash
# output
* demo
  master
```

### 1.1.2. 共通ファイルの展開
`klab-connector-v4`ディレクトリ直下で、利用者コネクタ用ディレクトリ`src/consumer`に移動し、`setup.sh`を実行する。
```bash
cd src/consumer/
sh setup.sh
```

### 1.1.3. コンフィグファイルの設定
設定すべきコンフィグファイルの一覧は以下の通り。

| コンフィグファイル | 概要 |
| :------------  | :----- |
| location.json | 提供者IDとコネクタURLのマッピング |
| connector.json | 利用者コネクタ設定 |
| ngsi.json | [**未対応**] NGSIサーバアクセス時のアクセストークン設定 |
| public_ckan.json | 横断検索サーバURL設定 |
| docker-compose.yml | 提供者コネクタURLのマッピング + 利用者コネクタ用アクセスポートの設定 |
| requirements.txt | PyYAMLライブラリのバージョン指定 | 

#### location.json: 提供者コネクタのURL設定
パス: `src/consumer/connector-main/swagger_server/configs/location.json`

| 設定パラメータ | 概要 |
| :--------- | :------- |
| connector_location | 提供者IDとコネクタURLのマッピング |
| connector_location.<提供者ID> | CADDEユーザID(提供者) を記載する |
| connector_location.<提供者ID>.provider_connector_url | 提供者コネクタのアクセスURL |

CADDE構築デモでは、利用者コネクタと提供者コネクタを同一のローカルマシン上に構築するため、ここでは提供者コネクタのアクセスURL（ドメイン）を適当に設定しておき、Dockerを用いてローカルマシンのIPアドレスに解決させる。例えば、提供者コネクタURLを`cadde.<提供者ID>.com`というように指定可能。

```json:location.json
{
    "connector_location": {
        "提供者ID": {
            "provider_connector_url": "<提供者コネクタURL>"
        }
    }
}
```

#### connector.json: 利用者コネクタ設定
パス: `src/consumer/connector-main/swagger_server/configs/connector.json`

| 設定パラメータ | 概要 |
| :--------- | :------- |
| consumer_connector_id | **認証**機能発行の利用者コネクタのクライアントID |
| consumer_connector_secret | **認証**機能発行の利用者コネクタのクライアントシークレット |
| location_service_url | **[変更の必要無し]** ロケーションサービスのアクセスURL |
| trace_log_enable | **[変更の必要無し]** コネクタの詳細ログ出力有無（出力無の設定でも基本的な動作ログは出力される） |
  
```json:connector.json
{
    "consumer_connector_id" : "<利用者コネクタ クライアントID>",
    "consumer_connector_secret" : "<利用者コネクタ クライアントシークレット>",
    "location_service_url" : "https://testexample.com",
    "trace_log_enable" : false
}
```

#### ngsi.json: **未対応**

#### public_ckan.json: 横断検索サーバURL設定
パス: `src/consumer/catalog-search/swagger_server/configs/public_ckan.json`

<span style="color: orange;">**以下、デモにあたっては変更の必要なし**</span>

| 設定パラメータ | 概要 |
| :---------- | :---- |
| public_ckan_url | 横断検索サーバURL |

```json:public_ckan.json
{
    "public_ckan_url": "http://172.26.16.16:5000/api/3/action/package_search"
}
```

#### docker-compose.yml: 提供者コネクタURLのマッピング + 利用者コネクタ用アクセスポートの設定
##### 提供者コネクタURLのマッピング
CADDE構築デモでは、提供者コネクタをローカルマシンに構築するため、上の`location.json`に記入した提供者コネクタのドメインをIPアドレスにマッピングする必要がある。

利用者環境におけるドメインの名前解決はすべてフォワードプロキシ上で行われるため、`docker-compose.yml`内のフォワードプロキシに対応するコンテナの箇所で、ドメインの割り当てを追加する。
下の例では、`location.json`に記入した提供者コネクタのドメインに対して`host-gateway`を割り当てている。

`host-gateway`と指定しておくと、Dockerが自動的にホストのIPアドレスに変換する。利用者コネクタのコンテナから一度ホストのIPアドレスにアクセスし、ポートフォワードにより提供者コネクタにアクセスするために設定している。

```yaml:docker-compose.yml
services:
  ...
  consumer-forward-proxy:
    ...
    extra_hosts:
      - "cadde.provider1.com:172.26.16.16"
      - "authn.ut-cadde.jp:172.26.16.20"
      - "<提供者コネクタURL>:host-gateway"
```

##### 利用者コネクタ用アクセスポートの設定
<span style="color: orange;">**以下、デモにあたっては変更の必要なし**</span>

利用者コネクタと提供者コネクタを同一ホスト上で立ち上げる場合、デフォルトの設定ではホスト側でHTTPSの443番ポートが衝突する。
そこで、利用者コネクタのポート番号をずらし、提供者コネクタに443番ポートを渡す。こうすることで、利用者コネクタ内フォワードプロキシから外部に通信する際のポートに関するACLを更新する必要がなくなる。
下の例ではホスト側のポートを10443番にし、コンテナ443番ポートにフォワードしている。
```yaml
...
services:
  ...
  consumer-reverse-proxy:
    ...
    ports:
      - 10443:443
      - 10080:80
    ...
```

### 1.1.4. リバースプロキシの設定
![利用者コネクタリバースプロキシ](../png/tls_example1.png)

利用者コネクタにおけるリバースプロキシは、利用者WebAppから利用者コネクタへHTTPS接続を行いたいときに機能する。

ここでは、利用者WebAppに対して配布するサーバ証明書の準備やプロキシ用ミドルウェアNginxのセットアップを行う。

#### 1.1.4.1. 秘密鍵・証明書の準備

`src/consumer`直下で以下のコマンドを実行し、`nginx/volumes`以下に秘密鍵やクライアント証明書を配置するための`ssl`ディレクトリを作成する。これはリバースプロキシ用のDockerコンテナにバインドマウントされる。
```bash
cd ./nginx/volumes
mkdir ssl
cd ssl
```
以下に、サーバ証明書の作成手続きにおける注意点を示す。
- 秘密鍵・CSR・サーバ証明書のファイル名はそれぞれ`server.key`, `server.csr`, `server.crt`としておく。
- CSR作成時に記入するサーバ識別名情報のうちCommon Nameに関しては、利用者コネクタのドメインを指定する。CADDE構築デモでは、利用者コネクタと提供者コネクタを同一のローカルマシンに立ち上げるため、上の`location.json`で指定した提供者コネクタのドメインと利用者コネクタのドメインを一致させて指定することを推奨する。
- Common Name以外のサーバ識別名情報はEnterでスキップしても構わない。


秘密鍵・サーバ証明書の具体的な作成方法は[certificate.md](./certificate.md)を参照。

#### 1.1.4.2 コンフィグファイルの設定
パス: `src/consumer/nginx/volumes/default.conf`

<span style="color: orange;">**以下、デモにあたっては変更の必要なし**</span>

上で作成したサーバ証明書や秘密鍵をリバースプロキシに利用させるため、Nginxのコンフィグファイルを編集する。

暗号化に使用する秘密鍵やサーバ証明書のファイルパスが、コンフィグファイル内`ssl_certificate`, `ssl_certificate_key`という項目でそれぞれ指定される。デフォルトでは秘密鍵を`server.key`, 証明書を`server.crt`というファイル名で設定している。
```bash
cat ../default.conf | grep ssl_certificate
```
```bash
# output
    ssl_certificate /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;
```

### 1.1.5. フォワードプロキシの設定
![利用者コネクタフォワードプロキシ](../png/tls_example2.png)
ここでは、提供者コネクタとのTLS相互認証を行うために、秘密鍵とクライアント証明書の準備、プロキシ用ミドルウェアSquidのセットアップを行う。

#### 1.1.5.1. 秘密鍵・証明書の準備

`src/consumer`直下で以下のコマンドを実行し、`squid/volumes`ディレクトリ以下に秘密鍵やクライアント証明書を配置するための`ssl`ディレクトリを作成する。これはフォワードプロキシ用のDockerコンテナにバインドマウントされる。
```bash
cd ./squid/volumes
mkdir ssl
cd ssl
```

CADDE構築デモでは、利用者コネクタと提供者コネクタを同一のローカルマシンに立ち上げるため、準備の簡単のために利用者コネクタのフォワードプロキシとリバースプロキシ、さらに提供者コネクタのリバースプロキシという3つのプロキシすべてで同じ秘密鍵・証明書を用いることとする。

そこで、`src/consumer/squid/volumes/ssl`直下で以下のコマンドを実行し、先に設定したリバースプロキシの秘密鍵と証明書をコピーする。その後、`server.key`, `server.crt`といったファイル名を`client.key`, `client.crt`に変更する。
```bash
cp ~/klab-connector-v4/src/consumer/nginx/volumes/ssl/* ./
for file in server.*; do mv "$file" "${file/server/client}"; done
ls
```
```
client.crt  client.csr  client.key
```

#### 1.1.5.2. SSL Bump設定用自己署名SSL証明書を作成
提供者コネクタに対してクライアント証明書を渡すため、フォワードプロキシでは利用者コネクタ・提供者コネクタ間のTLSセッションを中継するSSL Bump機能の設定を行う。

SSL Bumpを用いて、利用者コネクタがプロキシを中継して提供者コネクタにアクセスするたびに、事前に用意した自己署名SSL証明書をもとにして、Squidが動的にサーバ証明書を生成して利用者コネクタに返すようにしている。

そこで、`src/consumer/squid/volumes/ssl`直下で以下のコマンドを実行し、SSL Bump用の自己署名SSL証明書を作成する。実行の結果、秘密鍵と自己署名証明書の両方を含む`squidCA.pem`というファイルが作成される。

なお、このコマンドの実行中にもサーバの国名やCommon Nameが聞かれるが、Common Nameのみ適当な文字列を入力し、それ以外の項目はスキップもしくは適当な文字列で設定する。
```bash
openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 -keyout squidCA.pem -out squidCA.pem
```

#### 1.1.5.3. コンフィグファイル編集
パス: `src/consumer/squid/volumes/squid.conf`

<span style="color: orange;">**以下、デモにあたっては変更の必要なし**</span>

上で作成したクライアント証明書や秘密鍵をフォワードプロキシに利用させるため、Squidのコンフィグファイルを編集する。

サーバ接続時に使用するクライアント証明書や秘密鍵のファイルパスがコンフィグファイル内`tls_outgoing_options`という項目で指定される。デフォルトでは、秘密鍵を`client.key`, 証明書を`client.crt`という名前で設定している。
```bash
cat ../squid.conf | grep tls_outgoing_options
```
```bash
# output
tls_outgoing_options cert=/etc/squid/ssl/client.crt key=/etc/squid/ssl/client.key
```

#### 1.1.5.4. プロキシ初回起動
`src/consumer/squid`直下で以下のコマンドを実行し、利用者コネクタ全体を起動する前に、フォワードプロキシ用コンテナを一度起動させておく。
```bash
docker compose -f docker-compose_initial.yml up -d --build
```
以下のコマンドでプロキシ（Squid）が起動しているか確認する。
```bash
docker compose -f docker-compose_initial.yml ps
```
```bash
# output
NAME                IMAGE               COMMAND                  SERVICE             CREATED             STATUS              PORTS
forward-proxy       cadde-squid:4.0.0   "/usr/sbin/squid '-N…"   squid               44 seconds ago      Up 43 seconds       0.0.0.0:3128->3128/tcp, :::3128->3128/tcp
```

#### 1.1.5.5. SSL Bump設定
`src/consumer/squid`直下で以下のコマンドを実行し、SSL Bump用の設定を行う。
```bash
# プロキシのSSL Bump設定
docker exec -it forward-proxy /usr/lib/squid/security_file_certgen -c -s /var/lib/squid/ssl_db -M 20MB
```
```bash
# output
Initialization SSL db...
Done
```
プロキシコンテナ内の`var/lib/squid/ssl_db`ディレクトリをホスト上の`src/consumer/squid/volumes`以下にコピーする。
```bash
docker cp forward-proxy:/var/lib/squid/ssl_db ./volumes/
```
```bash
# output
Successfully copied 3.58kB to /Users/mitk/klab-connector-v4/src/consumer/squid/volumes/
```
フォワードプロキシ用のSSL Bump用設定が終了したため、コンテナを終了する。
```bash
docker compose -f docker-compose_initial.yml down
```
```bash
# output
[+] Running 2/2
 ✔ Container forward-proxy  Removed
 ✔ Network squid_default    Removed
```

## 1.2. 利用者コネクタ起動手順

### 1.2.1. 利用者コネクタ起動
`src/consumer`直下で以下のコマンドを実行し、利用者コネクタ用のDockerコンテナ群を起動する。
```bash
sh start.sh
```

起動した利用者コネクタの構成は以下の通り。CADDE構築デモではリバースプロキシのポート番号のみ`10443`に変更している。
![利用者コネクタ構成](../png/consumer.png)

### 1.2.2. 利用者コネクタ起動確認
`src/consumer`直下で以下のコマンドを実行し、利用者コネクタ用のDockerコンテナ群の起動状況を確認する。
```bash
docker compose ps
```
```
NAME                             IMAGE                                  COMMAND                  SERVICE                          CREATED             STATUS              PORTS
consumer_authentication          consumer/authentication:4.0.0          "python3 -m swagger_…"   consumer-authentication          2 minutes ago       Up 2 minutes        8080/tcp
consumer_catalog_search          consumer/catalog-search:4.0.0          "python3 -m swagger_…"   consumer-catalog-search          2 minutes ago       Up 2 minutes        8080/tcp
consumer_connector_main          consumer/connector-main:4.0.0          "python3 -m swagger_…"   consumer-connector-main          2 minutes ago       Up 2 minutes        8080/tcp
consumer_data_exchange           consumer/data-exchange:4.0.0           "python3 -m swagger_…"   consumer-data-exchange           2 minutes ago       Up 2 minutes        8080/tcp
consumer_forward-proxy           cadde-squid:4.0.0                      "/usr/sbin/squid '-N…"   consumer-forward-proxy           2 minutes ago       Up 2 minutes        3128/tcp
consumer_provenance_management   consumer/provenance-management:4.0.0   "python3 -m swagger_…"   consumer-provenance-management   2 minutes ago       Up 2 minutes        8080/tcp
consumer_reverse-proxy           nginx:1.23.1                           "/docker-entrypoint.…"   consumer-reverse-proxy           2 minutes ago       Up 2 minutes        0.0.0.0:10080->80/tcp, :::10080->80/tcp, 0.0.0.0:10443->443/tcp, :::10443->443/tcp
```

利用者コネクタが起動できれば、[usage.mdに記載された利用者コネクタの使い方](./usage.md#利用者)を参考にCADDEを利用する。

### 1.2.3. (利用者コネクタ停止)
利用者コネクタを停止したい場合は、`src/consumer`直下で以下のコマンドを実行する。
```
sh stop.sh
```


# 2. 提供者コネクタ

## 2.1. 提供者コネクタ環境準備
### 2.1.1. 提供者コネクタ取得
ソースコードの取得は[利用者コネクタの取得方法](#111-利用者コネクタ取得)を参照。利用者コネクタ取得時に越塚研GitHubのリポジトリから一度クローンしていれば、提供者コネクタ用に別途クローンする必要はない。

提供者コネクタのソースコードは同一リポジトリの`src/provider`配下に存在する。

### 2.1.2. 共通ファイルの展開
`klab-connector-v4`ディレクトリ直下で、提供者コネクタ用ディレクトリ`src/provider`に移動し、`setup.sh`を実行する。
```bash
cd src/provider
sh setup.sh
```

### 2.1.3. コンフィグファイルの設定
設定すべきコンフィグファイルの一覧は以下の通り。

| コンフィグファイル | 概要 |
| :------------  | :----- |
| provider_ckan.json | 横断検索・詳細検索カタログCKANサーバのアクセス設定 |
| http.json | HTTPサーバから提供するリソースの設定 |
| ftp.json | [**未対応**] FTPサーバから提供するリソースの設定 |
| ngsi.json | [**未対応**] NGSIサーバから提供するリソースの設定 |
| authorization.json | [**認可設定時**] 認可機能URLの設定 |
| connector.json | [**認可設定時**]　提供者コネクタ設定 |
| provenance.json | [**来歴管理設定時**] 来歴管理サーバURLの設定 |
| docker-compose.yml | [**認可設定時**] 認可機能アクセスURLのマッピング |
| requirements.txt | PyYAMLライブラリのバージョン指定 |

#### provider_ckan.json: 横断検索・詳細検索カタログCKANサーバのアクセス設定
パス: `src/providerconnector-main/swagger_server/configs/provider_ckan.json`

<span style="color: orange;">**以下、デモにあたっては変更の必要なし**</span>

| 設定パラメータ | 概要 |
| :---------- | :---- |
| release_ckan_url | 横断カタログサイトのアクセスURL |
| detail_ckan_url | 詳細カタログサイトのアクセスURL |
| authorization | 詳細カタログサイトアクセス時の認可確認有無 |
| packages_search_for_data_exchange | データ取得時の交換実績記録用リソースID検索を行うか否かを設定（来歴を使用せず、かつ、カタログ無しの状態でデータの提供を行いたい場合は、リソースID検索を行わない設定（false）にする） |

```json:provider_ckan.json
{
    "release_ckan_url": "http://172.26.16.16:5000",
    "detail_ckan_url": "http://172.26.16.16:5000",
    "authorization": true,
    "packages_search_for_data_exchange": false
}
```

#### http.json: HTTPサーバから提供するリソースの設定
パス: `src/provider/connector-main/swagger_server/configs/http.json`
| 設定パラメータ | 概要 |
| :---------- | :---- |
| basic_auth | **[変更の必要なし]** 提供リソースのドメインごとにBasic認証を行うか |
| basic_auth.domain | **[変更の必要なし]** Basic認証を行うリソースドメイン |
| basic_auth.basic_id | **[変更の必要なし]** `domain`アクセス時のBasic認証ID |
| basic_auth.basic_pass | **[変更の必要なし]** `domain`アクセス時のBasic認証パスワード |
| authorization | 提供リソースの認可確認設定. リクエストされたURLが設定されていなければTrueとして動作 |
| authorization.url | 提供リソースURL |
| authorization.enable | 提供リソースの認可確認有無 |
| contract_management_service | 取引市場利用設定. リクエストされたURLが設定されていなければTrueとして動作 |
| register_provenance | 来歴登録設定情報. リクエストされたURLが設定されていなければTrueとして動作 |

CADDE構築デモにあたっては、`authorization`, `contract_management_service`, `register_provenance`以下に提供したいリソースのURLを追加する。また、デモでは取引市場の利用や来歴登録は対象外であるため、`authorization.enable`のみ`true`で設定しておき、`contract_management_service.enable`や`register_provenance.enable`は`false`としておく。

**この`http.json`は提供データを追加したい場合に逐一編集するため、ここでは特に編集せず、コネクタ構築後にに提供者コネクタを利用したい場合に設定を行うことも可能である。**
`http.json`に関しては、[usage.md内の提供者コネクタの使い方](./usage.md#2-提供者コネクタのデータ管理コンフィグ設定)で再度説明している。

```json:http.json
{
    "basic_auth": [
        {
            "domain": "example.com:8080",
            "basic_id": "anonymous",
            "basic_pass": "anonymous"
        }
    ],
    "authorization": [
        {
            "url": "<リソースURL>",
            "enable": true
        }
    ],
    "contract_management_service": [
        {
            "url": "<リソースURL>",
            "enable": false
        }
    ],
    "register_provenance": [
        {
            "url": "<リソースURL",
            "enable": false
        }
    ]
}
```

#### ftp.json: **未対応**
#### ngsi.json: **未対応**

#### authorization.json: 認可機能URLの設定
パス: `src/provider/authorization/swagger_server/configs/authorization.json`

リソース提供時に認可確認を行う場合に、認可機能URLを設定する。[認可機能の構築方法はこちら](#31-認可機能構築手順)
| 設定パラメータ | 概要 |
| :---------- | :---- |
| authorization_server_url | 認可機能のアクセスURL |

CADDE構築デモでは、利用者コネクタ・提供者コネクタと同じく認可機能も同一のローカルマシン上に立ち上げる。
そこで、利用者コネクタ構築時に提供者コネクタURLを適当に設定したのと同様に（参考: [利用者コネクタ`location.json`の設定](#113-コンフィグファイルの設定)）、認可機能のアクセスURLも適当に設定しておき、Dockerを用いてローカルマシンのIPアドレスに解決させる。例えば、提供者のCADDEユーザIDを用いて、`authz.cadde.<提供者ID>.com`というように指定可能。
```json:authorization.json
{
     "authorization_server_url": "<認可機能URL>"
}
```

#### connector.json: 提供者コネクタ設定
パス: `src/provider/connector_main/swagger_server/configs/connector.json`

リソース提供時に認可確認を行う場合に、認可機能が発行する提供者コネクタ情報を設定する。
[認可機能の構築方法はこちら](#31-認可機能構築手順)

| 設定パラメータ                     | 概要                                  |
| :------------------------------ | :----------------------------------- |
| provider_id | CADDEユーザID（提供者） |
| provider_connector_id | 認証機能発行の提供者コネクタのクライアントID |
| provider_connector_secret | **認可**機能発行の提供者コネクタのクライアントシークレット |
| trace_log_enable | コネクタの詳細ログ出力有無（出力無の設定でも基本的な動作ログは出力される） |

上の設定パラメータのうち、`provider_connector_secret`は「認証」機能ではなく「認可」機能により発行されるものであることに注意する。
しかし、認可機能は本ドキュメントの[3. 認可機能](#3-認可機能)で構築するため、現時点ではクライアントシークレットは発行されていない。そのため、ここでは一旦適当な文字列を記入しておき、[3.1 認可機能構築手順](#31-認可機能構築手順)が完了したのち、改めて記入し直す。
  
```json:connector.json
{
    "provider_id" : "<提供者ID>",
    "provider_connector_id" : "<提供者コネクタ クライアントID>",
    "provider_connector_secret" : "<提供者コネクタ クライアントシークレット>",
    "trace_log_enable" : false
}
```

#### docker-compose.yml: 認可機能アクセスURLのマッピング
パス: `src/provider/docker-compose.yml`

CADDE構築デモでは、認可機能をローカルマシンに構築するため、上の`location.json`に記入した認可機能のドメインをIPアドレスにマッピングする必要がある。

そのために、`docker-compose.yml`の認可IFに対応するコンテナ`provider-authorization`以下で、認可機能のドメインに対してIPアドレスを割り当てる。
下の例では、`authorization.json`に記入した認可機能のドメインに対して`host-gateway`を割り当てている。

前述の通り、`host-gateway`はDockerコンテナを立ち上げているホストのIPアドレスに自動変換される。

```yaml:docker-compose.yml
version: "3"
services:
  ...
  provider-authorization:
    ...
    extra_hosts:
      - "<認可機能ドメイン>:host-gateway" # must change
```

### 2.1.4. リバースプロキシの設定
![提供者コネクタのリバースプロキシ](../png/tls_example2.png)

提供者コネクタへのアクセス制限を行うためにリバースプロキシでのTLS設定が必要となる。

#### 2.1.4.1. 秘密鍵・サーバ証明書の準備
`src/provider`直下で以下のコマンドを実行し、`nginx/volumes`以下に秘密鍵やサーバ証明書を配置するための`ssl`ディレクトリを作成する。これはリバースプロキシ用のDockerコンテナにバインドマウントされる。
```bash
cd ./nginx/volumes
mkdir ssl
cd ssl
```

前述の通り、CADDE構築デモでは、準備の簡単のために利用者コネクタのフォワードプロキシとリバースプロキシ、さらに提供者コネクタのリバースプロキシという3つのプロキシすべてで同じ秘密鍵・証明書を用いることとする。

そこで、`src/provider/nginx/volumes/ssl`直下で以下のコマンドを実行し、先に設定した利用者コネクタのリバースプロキシの秘密鍵と証明書をコピーする。ここでは`klab-connector-v4`がホームディレクトリに存在すると仮定するが、デモの環境に合わせて適宜変更する。
```bash
cp ~/klab-connector-v4/src/consumer/nginx/volumes/ssl/* ./
ls
```
```
server.crt  server.csr  server.key
```

#### 2.1.4.2. クライアント認証用CA証明書の準備
クライアント証明書のCA証明書も`nginx/volumes/ssl`以下に配置する必要がある。
ここでは、研究室内プライベート認証局のルート証明書`cacert.pem`を事前に用意しておく。
```bash
ls
```
```
cacert.pem  server.crt  server.csr  server.key
```

#### 2.1.4.3. コンフィグファイルの設定
パス: `connector/src/consumer/nginx/volumes/default.conf`

<span style="color: orange;">**以下、デモにあたっては変更の必要なし**</span>

上で作成したサーバ証明書や秘密鍵, クライアントCA証明書をリバースプロキシに利用させるため、Nginxのコンフィグファイルを編集する。
ここでは以下の項目が設定されている。
| key                     | value |　概要 |
| :-------------- | :--------------- | :--------------- |
| ssl_certificate　| `server.crt` | サーバ証明書 |
| ssl_certificate_key　| `server.key` | サーバ秘密鍵
| ssl_verify_client | `on` | クライアント認証on/off |
| ssl_client_certificate | `cacert.pem` | クライアント認証に使用するCA証明書 |

```txt:default.conf
...
    ssl_certificate /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;
    ssl_verify_client on;
    ssl_client_certificate /etc/nginx/ssl/cacert.pem;
...
```

## 2.2. 提供者コネクタ起動手順
### 2.2.1 提供者コネクタ起動
`src/provider`直下で以下のコマンドを実行し、提供者コネクタ用のDockerコンテナ群を起動する。
```bash
sh start.sh
```
起動した提供者コネクタの構成は以下の通り。
![提供者コネクタ構成](../png/producer.png)

### 2.2.2. 提供者コネクタ起動確認
`src/provider`直下で以下のコマンドを実行し、提供者コネクタ用のDockerコンテナ群の起動状況を確認する。
```bash
docker compose ps
```
```
NAME                             IMAGE                                  COMMAND                  SERVICE                          CREATED             STATUS              PORTS
provider_authorization           provider/authorization:4.0.0           "python3 -m swagger_…"   provider-authorization           11 seconds ago      Up 9 seconds        8080/tcp
provider_catalog_search          provider/catalog-search:4.0.0          "python3 -m swagger_…"   provider-catalog-search          11 seconds ago      Up 10 seconds       8080/tcp
provider_connector_main          provider/connector-main:4.0.0          "python3 -m swagger_…"   provider-connector-main          11 seconds ago      Up 9 seconds        8080/tcp
provider_data_exchange           provider/data-exchange:4.0.0           "python3 -m swagger_…"   provider-data-exchange           11 seconds ago      Up 9 seconds        8080/tcp
provider_provenance_management   provider/provenance-management:4.0.0   "python3 -m swagger_…"   provider-provenance-management   11 seconds ago      Up 10 seconds       8080/tcp
provider_reverse-proxy           nginx:1.23.1                           "/docker-entrypoint.…"   provider-reverse-proxy           11 seconds ago      Up 9 seconds        0.0.0.0:80->80/tcp, :::80->80/tcp, 0.0.0.0:443->443/tcp, :::443->443/tcp
```

提供者コネクタが起動できれば、[usage.mdに記載された提供者コネクタの使い方](./usage.md#提供者)を参考に、データ提供のための準備を行う。

### 2.2.3. (提供者コネクタ停止)
提供者コネクタを停止したい場合は、`src/provider`直下で以下のコマンドを実行する。
```
sh stop.sh
```

# 3. 認可機能
## 3.1. 認可機能構築手順
ソースコードの取得は[利用者コネクタの取得方法](#111-利用者コネクタ取得)を参照。利用者コネクタや提供者コネクタ取得時に越塚研GitHubのリポジトリから一度クローンしていれば、認可機能用に別途クローンする必要はない。

認可機能は同一リポジトリの`misc/authorization`以下に存在する。

以下のコマンドで認可機能のソースコード配下に移動する。
```bash
cd misc/authorization
```

### 3.1.1. コンフィグファイルの設定
#### docker-compose.yaml
パス: `misc/authorization/docker-compose.yaml`

**以下、デモにあたっては変更の必要なし**

認可機能用Dockerコンテナ群を起動するための設定ファイル。

| 設定パラメータ                     | 概要                                  |
| :------------------------------ | :----------------------------------- |
| services.nginx.ports | 認可機能ポート番号 |
| services.keycloak.environment.KEYCLOAK_ADMIN | 認可機能Keycloakのadminユーザ名 |
| services.keycloak.environment.KEYCLOAK_PASSWORD | 認可機能Keycloakのadminユーザパスワード |
| services.keycloak.environment.KC_DB_USERNAME | 認可機能Keycloakが利用するPostgresDBのユーザ名 |
| services.keycloak.environment.KC_DB_PASSWORD | 認可機能Keycloakが利用するPostgresDBのパスワード |
| services.postgres.environment.POSTGRES_USER | PostgresDBのユーザ名（KC_DB_USERNAMEと一致させる）　|
| services.postgres.environment.POSTGRES_PASSWORD | PostgresDBのパスワード（KC_DB_PASSWORD）と一致させる　|

```yaml:docker-compose.yaml
...
services:
  nginx:
    ...
    ports:
      - "5080:80"
    ...
  fastapi:
    ...
  keycloak:
    ...
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      ...
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: keycloak
      ...
  postgres:
    ...
    environment:
      ...
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: keycloak
      ...
```

#### settings.json
パス: `misc/authorization/settings.json`

認可機能APIサーバで使用する設定ファイル。
| 設定パラメータ | 概要 |
| :---------- | :-- |
| provider_connector_id　| 提供者コネクタのクライアントID |
| client_id | 認証機能発行の認可機能のクライアントID |
| client_secret | 認証機能発行の認可機能のクライアントシークレット |
| authz_keycloak_url | 認可機能KeycloakのベースURL |
| authn_url | **[変更の必要なし]** 認証機能APIのベースURL |
| authn_keycloak_url | **[変更の必要なし]** 認証機能KeycloakのベースURL |
| authn_realm_name | **[変更の必要無し]** 認証機能のレルム名 |
| subject_issuer | **[変更の必要なし]** 認証機能を表す文字列(authenticationを指定しておく) |

上の設定パラメータのうち`authz_keycloak_url`に関して、認可機能リバースプロキシ用コンテナの名前である`authz_nginx`を用いて`http://authz_nginx/keycloak`と指定することが可能である。こうした場合、認可機能リバースプロキシ用コンテナのドメイン名はDockerによって解決される。
```json:settings.json
{
  "provider_connector_id": "<提供者コネクタ クライアントID>",
  "client_id": "<認可機能 クライアントID>",
  "client_secret": "<認可機能 クライアントシークレット>",
  "authz_keycloak_url": "<認可機能Keycloak URL>",
  "authn_url": "https://authn.ut-cadde.jp:18443/cadde/api/v4",
  "authn_keycloak_url": "https://authn.ut-cadde.jp:18443/keycloak",
  "authn_realm_name": "authentication",
  "subject_issuer": "authentication"
}
```

### 3.1.2. TLS設定
認証トークンと認可トークンの交換に伴い、認可サーバから認証サーバへのHTTPS通信が発生する。
この通信は認可機能FastAPIコンテナ, Keycloakコンテナから発生するため、対応するコンテナにTLS/HTTPSの設定を追加する必要がある。

まず、`misc/authorization`直下で以下のコマンドを実行し、認証機能のCA証明書、つまり研究室内プライベート認証局の証明書`cacert.pem`（PEM形式）とKeycloak用のCA証明書 `kcTrustStore.p12`（PKCS12トラストストア形式）を配置するための`certs`ディレクトリを作成する。その後、`cacert.pem`, `kcTrustStore.p12`の各ファイルを`certs`ディレクトリに移動させる。

※ `cacert.pem`, `kcTrustStore.p12`はそれぞれ研究室内プライベート認証局の担当者から事前に受け取っておく。

```bash
mkdir certs
mv ./cacert.pem certs/
mv ./kcTrustStore.p12 certs/
```

<span style="color: orange;">**以下、デモにあたっては変更の必要なし**</span>

HTTPS通信のためのCA証明書が配置できれば、`docker-compose.yml`を編集し、コンテナが当該証明書を利用するよう設定する。
ここで設定している項目は以下の通り。

| 設定パラメータ                     | 概要                                  |
| :------------------------------ | :----------------------------------- |
| services.fastapi.volumes　| 信頼するCA証明書`cacert.pem`をコンテナ内に配置 |
| services.fastapi.environment | コンテナ内部のPythonがHTTPリクエストの際に`cacert.pem`を信頼するよう設定 |
| services.keycloak.volumes | 信頼するCA証明書`kcTrustStore.p12`をコンテナ内に配置 |
| services.keycloak.environment | 信頼するCA証明書を追加する設定 |

```yaml:docker-compose.yml
...
services:
  nginx:
    ...

  fastapi:
    ...
    volumes:
      ...
      - "./certs/cacert.pem:/etc/docker/certs.d/cacert.pem:ro"
    environment:
      - REQUESTS_CA_BUNDLE=/etc/docker/certs.d/cacert.pem
    ...

  keycloak:
    ...
    volumes:
      - "./certs/kcTrustStore.p12:/opt/keycloak/kcTrustStore.p12:ro"
    environment:
      ...
      KC_SPI_TRUSTSTORE_FILE_FILE: kcTrustStore.p12
      KC_SPI_TRUSTSTORE_FILE_PASSWORD: koshizukalab
      KC_SPI_TRUSTSTORE_FILE_HOSTNAME_VERIFICATION_POLICY: WILDCARD
      KC_SPI_TRUSTSTORE_FILE_TYPE: pkcs12
      ...
```

### 3.1.3. Dockerイメージの作成
`misc/authorization`直下で以下のコマンドを実行し、認可機能用Keycloakコンテナのイメージ（`prebuilt_keycloak:19.0.2`）を作成する。パスワードを聞かれた場合は、コマンドを実行しているマシンのrootユーザのパスワードを入力する。
```bash
./image_build_keycloak.sh
```

同様にして認可機能用FastAPIコンテナのイメージ（`fastapi:latest`）を作成する。
```bash
./image_build_fastapi.sh
```

## 3.2. 認可機能起動手順
### 3.2.1. 認可機能起動
`misc/authorization`直下で以下のコマンドを実行し、認可機能用のDockerコンテナ群を起動する。

※ 認可機能起動時には、既に[提供者コネクタの起動](#221-提供者コネクタ起動)が完了し、`provider_default`というDockerネットワークが作成されている必要がある。一度提供者コネクタを起動していれば、認可機能起動時に提供者コネクタが並行して立ち上がっている必要はない。
```bash
./start.sh
```

### 3.2.2. 認可機能起動確認
`misc/authorization`直下で以下のコマンドを実行し、認可機能用のDockerコンテナ群の起動状況を確認する。
```bash
docker compose ps
```
```
NAME                IMAGE                      COMMAND                  SERVICE             CREATED             STATUS              PORTS
authz_fastapi       authz_fastapi:4.0.0        "python -m uvicorn m…"   fastapi             13 seconds ago      Up 12 seconds       8000/tcp
authz_keycloak      prebuilt_keycloak:19.0.2   "/opt/keycloak/bin/k…"   keycloak            13 seconds ago      Up 12 seconds       8080/tcp, 8443/tcp
authz_nginx         nginx:1.23.1               "/docker-entrypoint.…"   nginx               13 seconds ago      Up 12 seconds       0.0.0.0:5080->80/tcp, :::5080->80/tcp
authz_postgres      postgres:14.4              "docker-entrypoint.s…"   postgres            13 seconds ago      Up 12 seconds       5432/tcp
```

### 3.2.3. 認可機能セットアップ
認可機能コンテナの起動中に、`misc/authorization`直下で`./provider_setup.sh`を実行し、以下の設定パラメータを対話的に入力する。これらの設定項目は`settings_provider_setup.json`に書き込まれる。

| 設定パラメータ | 概要 |
| :---------- | :-- |
| CADDEユーザID　| 提供者のユーザID。これは認可機能Keycloakのレルム名として使用される。 |
| 提供者コネクタのクライアントID | 先に設定した`settings.json`内の`provider_connector_id`の値と一致させる。 |
| CADDE認証機能認証サーバのURL | 先に設定した`settings.json`の`authn_keycloak_url`と値を一致させる。 |

```bash
bash ./provider_setup.sh
```
```bash
CADDEユーザID: <提供者ID>
提供者コネクタのクライアントID: <提供者コネクタ クライアントID>
CADDE認証機能認証サーバのURL: https://authn.ut-cadde.jp:18443/keycloak
----------アドミンのアクセストークン取得----------
アドミンのアクセストークン取得成功
----------レルム設定----------
# レルム作成
レルムを作成しました
----------クライアント設定----------
# クライアント(提供者コネクタ)作成
クライアント(提供者コネクタ)を作成しました
# クライアントUUIDの取得
提供者コネクタのクライアントUUID: 4a660c98-33d4-436f-9b1d-c886865c36c5
realm-managementのクライアントUUID: bac5eff8-93b9-4445-a1f6-e63ad3933e66
# クライアント(提供者コネクタ)の設定
クライアントの設定をしました
# クライアント(提供者コネクタ)のマッパーの設定を作成
userマッパーを作成しました
orgマッパーを作成しました
aalマッパーを作成しました
----------アイデンティティプロバイダー設定----------
# アイデンティティプロバイダーを作成
アイデンティティプロバイダーを作成しました
# アイデンティティプロバイダーのマッピング設定
userマッパーを作成しました
orgマッパーを作成しました
aalマッパーを作成しました
# アイデンティティプロバイダーのToken Exchange設定
## Token Exchangeに関わるパーミッションとリソースの作成
Token Exchangeに関わるパーミッションとリソースを作成しました
パーミッションのUUID: 2a1b227c-dfeb-4f34-a0ef-04b55b9c50ba
リソースのUUID: 4181ce13-eef2-43be-a8ab-e9c894af4197
## クライアントポリシーの作成(提供者コネクタを指定するポリシー)
クライアントポリシーを作成しました
## クライアントポリシーUUIDの取得
クライアントポリシーのUUID: c00e751e-6d64-4b74-b8f6-7e99e0d07516
## token-exchangeスコープUUIDの取得
token-exchangeスコープのUUID: 0dca0b19-0017-43fa-aaa7-dcefd17c7315
## アイデンティティプロバイダーのUUIDの取得
アイデンティティプロバイダーのUUID: 99556d90-71e7-45e0-95e7-f8f986337ce8
## Token Exchangeに関わるパーミッションの設定
Token Exchangeに関わるパーミッションを設定しました
```
実行が完了すると、`settings_provider_setup.json`に入力した設定項目が記入され、認可を設定するためのKeycloakの初期設定が完了する。
```json:settings_provider_setup.json
{ "realm": "<提供者ID>", "client": "<提供者コネクタ クライアントID>", "identity_provider": "https://authn.ut-cadde.jp:18443/keycloak" }
```

### 3.2.4. (認可機能停止)
提供者コネクタを停止したい場合は、`misc/authorization`直下で以下のコマンドを実行する。
```bash
./stop.sh
```

