# 1. 利用者コネクタ
## 1.1 利用者コネクタ構築手順

### 1.1.1. 利用者コネクタ取得
```bash
git clone github:Koshizuka-lab/klab-connector-v4.git
cd klab-connector-v4
git checkout -b demo origin/demo
git branch -l
```
```
* demo
  master
```

### 1.1.2. 共通ファイルの展開
```bash
cd src/consumer/
sh setup.sh
```

### 1.1.3. コンフィグファイルの設定

| コンフィグファイル | 概要 |
| :------------  | :----- |
| location.json | 提供者IDとコネクタURLのマッピング |
| connector.json | 利用者コネクタ設定 |
| ngsi.json | [**未対応**] NGSIサーバアクセス時のアクセストークン設定 |
| public_ckan.json | 横断検索サーバURL設定 |
| docker-compose.yml | 提供者コネクタURLのマッピング + 利用者コネクタ用アクセスポートの設定 |
| requirements.txt | PyYAMLライブラリのバージョン指定 | 

---

#### location.json: 提供者コネクタのURL設定
パス: `connector-main/swagger_server/configs/location.json`

| 設定パラメータ                     | 概要                                  |
| :------------------------------ | :----------------------------------- |
| connector_location              | 提供者IDとコネクタURLのマッピング           |
| connector_location.<提供者ID>             | CADDEユーザID(提供者) を記載する          |
| connector_location.<提供者ID>.provider_connector_url          | 提供者コネクタのアクセスURL                |

```json:location.json
{
    "connector_location": {
        "提供者ID": {
            "provider_connector_url": "提供者コネクタのアクセスURL"
        }
    }
}
```

#### connector.json: 利用者コネクタ設定
パス: `connector-main/swagger_server/configs/connector.json`

| 設定パラメータ                     | 概要                                  |
| :------------------------------ | :----------------------------------- |
| consumer_connector_id | **認証**機能発行の利用者コネクタのクライアントID |
| consumer_connector_secret | **認証**機能発行の利用者コネクタのクライアントシークレット |
| location_service_url | ロケーションサービスのアクセスURL |
| trace_log_enable | コネクタの詳細ログ出力有無（出力無の設定でも基本的な動作ログは出力される） |
  
```json:connector.json
{
    "consumer_connector_id" : "利用者コネクタ クライアントID",
    "consumer_connector_secret" : "利用者コネクタ クライアントシークレット",
    "location_service_url" : "https://testexample.com",
    "trace_log_enable" : false
}
```

#### ngsi.json: **未対応**

#### public_ckan.json: 横断検索サーバURL設定
パス: `catalog-search/swagger_server/configs/public_ckan.json`

<span style="color: orange;">**以下、デモにあたっては変更の必要なし**</span>

| 設定パラメータ                     | 概要                                  |
| :------------------------------ | :----------------------------------- |
| public_ckan_url | 横断検索サーバURL |

```json:public_ckan.json
{
    "public_ckan_url": "http://172.26.16.16:5000/api/3/action/package_search"
}
```

#### docker-compose.yml: 提供者コネクタURLのマッピング + 利用者コネクタ用アクセスポートの設定
##### 提供者コネクタURLのマッピング
アクセスする提供者コネクタがグローバルに公開されていない場合、上の`location.json`に記入した提供者コネクタのドメインをIPアドレスにマッピングする必要がある。

利用者環境におけるドメインの名前解決はすべてフォワードプロキシ上で行われるため、`docker-compose.yml`内のフォワードプロキシに対応するコンテナの箇所で、ドメインの割り当てを追加する。
下の例では、`cadde.provider1.com`, `authn.ut-cadde.jp`というドメインに加えて、`cadde.example.com`という提供者コネクタURLに対して`host-gateway`を割り当てている。

`host-gateway`と指定しておくと、Dockerが自動的にホストのIPアドレスに変換する。これは同一ホスト上で利用者コネクタ・提供者コネクタのコンテナをそれぞれ立てている場合に必要である。利用者コネクタのコンテナから一度ホストのIPアドレスにアクセスし、ポートフォワードにより提供者コネクタにアクセスするために設定している。

```yaml:docker-compose.yml
services:
  ...
  consumer-forward-proxy:
    ...
    extra_hosts:
      - "cadde.provider1.com:172.26.16.16"
      - "authn.ut-cadde.jp:172.26.16.20"
      - "cadde.example.com:host-gateway"
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

`nginx/volumes`以下に秘密鍵やクライアント証明書を配置するための`ssl`ディレクトリを作成する。これはリバースプロキシ用のDockerコンテナにバインドマウントされる。
```bash
cd ./nginx/volumes
mkdir ssl
cd ssl
```

秘密鍵・クライアント証明書の具体的な作成方法は[certificate.md](./certificate.md)を参照。

ここで作成する秘密鍵・クライアント証明書のファイル名はそれぞれ`server.key`, `server.crt`としておく。

また、CSR作成時に記入するサーバ識別名情報について、Common Name以外はEnterでスキップして構わない。
Common Nameについて、このデモでは利用者コネクタと提供者コネクタを立ち上げることを前提とし、提供者コネクタのリバースプロキシの設定を鑑みて、`location.json`で指定した提供者コネクタURLに一致させる形で指定することを推奨する。

以下に、CADDE利用者コネクタのサーバ証明書用CSRの一例を示す。
```bash
openssl req -new -key ./server.key -out ./server.csr -addext "subjectAltName = DNS:cadde.<userID>.com,DNS:localhost,IP:127.0.0.1"
```
```
...
Country Name (2 letter code) [AU]: JP
State or Province Name (full name) [Some-State]: Tokyo
Locality Name (eg, city) []: Bunkyo
Organization Name (eg, company) [Internet Widgits Pty Ltd]: Koshizuka Lab
Organizational Unit Name (eg, section) []:
Common Name (e.g. server FQDN or YOUR name) []: cadde.<userID>.com
```
なお、上の例では、ローカルホスト上に立ち上げた利用者コネクタに`localhost`というドメインやIPアドレスでアクセスできるよう、SubjectAltNameを設定している。

#### 1.1.4.2 コンフィグファイルの設定
<span style="color: orange;">**以下、デモにあたっては変更の必要なし**</span>

上で作成したサーバ証明書や秘密鍵をリバースプロキシに利用させるため、Nginxのコンフィグファイル（`klab-connector-v4/src/consumer/nginx/volumes/default.conf`）を編集する。

暗号化に使用する秘密鍵やクライアントに配布するサーバ証明書のファイルパスが、コンフィグファイル内`ssl_certificate`, `ssl_certificate_key`という項目で指定される。デフォルトでは秘密鍵を`server.key`, 証明書を`server.crt`というファイル名で設定している。
```bash
cat ../default.conf | grep ssl_certificate
```
```
    ssl_certificate /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;
```

### 1.1.5. フォワードプロキシの設定
![利用者コネクタフォワードプロキシ](../png/tls_example2.png)
ここでは、提供者コネクタとのTLS相互認証を行うために、秘密鍵とクライアント証明書の準備、プロキシ用ミドルウェアSquidのセットアップを行う。

#### 1.1.5.1. 秘密鍵・証明書の準備

`squid/volumes`ディレクトリ以下に、秘密鍵やクライアント証明書を配置するための`ssl`ディレクトリを作成する。これはフォワードプロキシ用のDockerコンテナにバインドマウントされる。
```bash
cd ./squid/volumes
mkdir ssl
cd ssl
```

このデモでは、利用者コネクタと提供者コネクタを同一ホスト上に立ち上げている前提の下、準備の簡単のために利用者コネクタのフォワードプロキシとリバースプロキシ、さらに提供者コネクタのリバースプロキシという3つのプロキシすべてで同じ秘密鍵・証明書を用いることとする。

そこで、先に設定したリバースプロキシの秘密鍵と証明書をコピーする。また、`server.key`, `server.crt`といったファイル名をクライアント証明書用に`client.key`, `client.crt`に変更する。
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

そこで、以下のコマンドで事前にSSL Bump用の自己署名SSL証明書を用意しておく。実行の結果、秘密鍵と自己署名証明書の両方を含む`squidCA.pem`というファイルが作成される。
なお、このコマンドの実行中にもサーバの国名やCommon Nameが聞かれる。先ほどと同様に、Common Nameのみ任意の文字列で設定し、それ以外の項目はスキップ、もしくは好きな文字列で設定する。
```bash
openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 -keyout squidCA.pem -out squidCA.pem
```
```
...
---
Country Name (2 letter code) [AU]:
State or Province Name (full name) [Some-State]:
Locality Name (eg, city) []:
Organization Name (eg, company) [Internet Widgits Pty Ltd]:
Organizational Unit Name (eg, section) []:
Common Name (e.g. server FQDN or YOUR name) []:cadde.example.com
Email Address []:
```

#### 1.1.5.3. コンフィグファイル編集
<span style="color: orange;">**以下、デモにあたっては変更の必要なし**</span>

上で作成したクライアント証明書や秘密鍵をフォワードプロキシに利用させるため、Squidのコンフィグファイル（`connector/src/consumer/squid/volumes/squid.conf`）を編集する。

サーバ接続時に使用するクライアント証明書や秘密鍵のファイルパスがコンフィグファイル内`tls_outgoing_options`という項目で指定される。デフォルトでは、秘密鍵を`client.key`, 証明書を`client.crt`という名前で設定している。
```bash
cat ../squid.conf | grep tls_outgoing_options
```
```
tls_outgoing_options cert=/etc/squid/ssl/client.crt key=/etc/squid/ssl/client.key
```

#### 1.1.5.4. プロキシ初回起動
CADDEコネクタを起動する前に、フォワードプロキシ用コンテナを一度起動させておく必要があるため、以下のコマンドを実行する。
```bash
cd ~/klab-connector-v4/src/consumer/squid
docker compose -f docker-compose_initial.yml up -d --build
```
以下のコマンドでプロキシ（Squid）が起動しているか確認する。
```bash
docker compose -f docker-compose_initial.yml ps
```
```
NAME                IMAGE               COMMAND                  SERVICE             CREATED             STATUS              PORTS
forward-proxy       cadde-squid:4.0.0   "/usr/sbin/squid '-N…"   squid               44 seconds ago      Up 43 seconds       0.0.0.0:3128->3128/tcp, :::3128->3128/tcp
```

#### 1.1.5.5. SSL Bump設定
プロキシ用コンテナを起動させたら以下のコマンドを実行して、SSL Bump用の設定を行う。
```
# プロキシのSSL Bump設定
docker exec -it forward-proxy /usr/lib/squid/security_file_certgen -c -s /var/lib/squid/ssl_db -M 20MB
```
```
Initialization SSL db...
Done
```

```bash
# プロキシコンテナ内の`ssl_db`ディレクトリをホストにコピー
docker cp forward-proxy:/var/lib/squid/ssl_db ./volumes/
```
```
Successfully copied 3.58kB to /Users/mitk/klab-connector-v4/src/consumer/squid/volumes/
```

```
# 立ち上げたプロキシコンテナを一旦終了
docker compose -f docker-compose_initial.yml down
```
```
[+] Running 2/2
 ✔ Container forward-proxy  Removed
 ✔ Network squid_default    Removed
```
無事コンテナが終了すれば次の手順に移る。

## 1.2. 利用者コネクタ起動手順

### 1.2.1. 利用者コネクタ起動
```bash
cd ~/klab-connector-v4/src/consumer
sh start.sh
```

起動した利用者コネクタの構成は以下の通り（リバースプロキシのポートのみ異なる）。
![利用者コネクタ構成](../png/consumer.png)

### 1.2.2. 利用者コネクタ起動確認
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

### 1.2.3. 利用者コネクタ停止
```
sh stop.sh
```

---

# 2. 提供者コネクタ

## 2.1. 提供者コネクタ環境準備
### 2.1.1. 提供者コネクタ取得
ソースコードの取得は[利用者コネクタの取得方法](#111-利用者コネクタ取得)を参照。

提供者コネクタのソースコードは`src/provider`に存在する。

### 2.1.2. 共通ファイルの展開
```bash
cd src/provider
sh setup.sh
```

### 2.1.3. コンフィグファイルの設定
設定すべきファイルの一覧は以下の通り。

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

---

#### provider_ckan.json: 横断検索・詳細検索カタログCKANサーバのアクセス設定
パス: `connector-main/swagger_server/configs/provider_ckan.json`

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
パス: `connector-main/swagger_server/configs/http.json`
| 設定パラメータ | 概要 |
| :---------- | :---- |
| basic_auth | 提供リソースのドメインごとにBasic認証を行うか |
| basic_auth.domain | Basic認証を行うリソースドメイン |
| basic_auth.basic_id | `domain`アクセス時のBasic認証ID |
| basic_auth.basic_pass | `domain`アクセス時のBasic認証パスワード |
| authorization | 提供リソースの認可確認設定. リクエストされたURLが設定されていなければTrueとして動作 |
| authorization.url | 提供リソースURL |
| authorization.enable | 提供リソースの認可確認有無 |
| contract_management_service | 取引市場利用設定. リクエストされたURLが設定されていなければTrueとして動作 |
| register_provenance | 来歴登録設定情報. リクエストされたURLが設定されていなければTrueとして動作 |

**デモにあたっては、`authorization`, `contract_management_service`, `register_provenance`以下に提供したいリソースのURLを追加する。**

```json:http.json
cat connector-main/swagger_server/configs/http.json
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
            "url": "http://172.26.16.20:3080/files/matsunaga/test.txt",
            "enable": true
        }
    ],
    "contract_management_service": [
        {
            "url": "http://172.26.16.20:3080/files/matsunaga/test.txt",
            "enable": false
        }
    ],
    "register_provenance": [
        {
            "url": "http://172.26.16.20:3080/files/matsunaga/test.txt",
            "enable": false
        }
    ]
}
```

#### ftp.json: **未対応**
#### ngsi.json: **未対応**

#### authorization.json: 認可機能URLの設定
パス: `authorization/swagger_server/configs/authorization.json`
リソース提供時に認可確認を行う場合に、認可機能URLを設定する。
[認可機能の構築方法はこちら](#31-認可機能構築手順)。
| 設定パラメータ | 概要 |
| :---------- | :---- |
| authorization_server_url | 認可機能のアクセスURL |

ローカル上で認可機能を構築する場合、単に`localhost`もしくは`127.0.0.1`にアクセスしてしまうと、提供者コネクタ用のコンテナ自身を指してしまう。
そこで、下の例では認可機能のアクセスURLに適当なドメイン名を指定し、後に示す`docker-compose.yml`でドメイン名を解決する設定を行うことを想定している。
```json:authorization.json
{
     "authorization_server_url": "http://authz.cadde.example.com:5080"
}
```

#### connector.json: 提供者コネクタ設定
パス: `connector_main/swagger_server/configs/connector.json`

リソース提供時に認可確認を行う場合に、認可機能が発行する提供者コネクタ情報を設定する。
[認可機能の構築方法はこちら](#31-認可機能構築手順)。
| 設定パラメータ                     | 概要                                  |
| :------------------------------ | :----------------------------------- |
| provider_id | CADDEユーザID（提供者） |
| provider_connector_id | **認可**機能発行の提供者コネクタのクライアントID |
| provider_connector_secret | **認可**機能発行の提供者コネクタのクライアントシークレット |
| trace_log_enable | コネクタの詳細ログ出力有無（出力無の設定でも基本的な動作ログは出力される） |
  
```json:connector.json
{
    "provider_id" : "提供者ID",
    "provider_connector_id" : "提供者コネクタのクライアントID",
    "provider_connector_secret" : "提供者コネクタのクライアントシークレット",
    "trace_log_enable" : false
}
```

#### docker-compose.yml: 認可機能アクセスURLのマッピング
リソース提供時に認可確認を行う場合、上の`authorization.json`で指定した認可機能のドメイン名がグローバルに公開されていない場合はそれを解決させる設定が必要である。
そのために、`docker-compose.yml`の認可IFに対応するコンテナ`provider-authorization`以下で、認可機能のドメインとIPアドレスのマッピングを追加する。

下の例では、`authz.cadde.example.com`というドメインに対して`host-gateway`を割り当てている。
前述の通り、`host-gateway`はDockerコンテナを立ち上げているホストのIPアドレスに自動変換されるため、この場合では認可機能と提供者コネクタが同一ホスト上のコンテナとして立ち上がっていることを想定している。

```yaml:docker-compose.yml
version: "3"
services:
  ...
  provider-authorization:
    ...
    extra_hosts:
      - "authz.cadde.example.com:host-gateway"
```

### 2.1.4. リバースプロキシの設定
![提供者コネクタのリバースプロキシ](../png/tls_example2.png)

提供者コネクタへのアクセス制限を行うためにリバースプロキシでのTLS設定が必要となる。

#### 2.1.4.1. 秘密鍵・サーバ証明書の準備
秘密鍵やクライアント証明書を配置するための`ssl`ディレクトリを、`nginx/volumes`以下に作成する。これはリバースプロキシ用のDockerコンテナにバインドマウントされる。
```bash
cd ~/klab-connector-v4/src/provider/nginx/volumes
mkdir ssl
cd ssl
```

このデモでは、利用者コネクタと提供者コネクタを同一ホスト上に立ち上げている前提の下、準備の簡単のために利用者コネクタのフォワードプロキシとリバースプロキシ、さらに提供者コネクタのリバースプロキシという3つのプロキシすべてで同じ秘密鍵・証明書を用いることとする。

そこで、先に設定した利用者コネクタのリバースプロキシの秘密鍵と証明書をコピーする。
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
<span style="color: orange;">**以下、デモにあたっては変更の必要なし**</span>

上で作成したサーバ証明書や秘密鍵, クライアントCA証明書をリバースプロキシに利用させるため、Nginxのコンフィグファイル（`connector/src/consumer/nginx/volumes/default.conf`）を編集する。
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
```bash
cd ~/klab-connector-v4/src/provider
sh start.sh
```

起動した提供者コネクタの構成は以下の通り。
![提供者コネクタ構成](https://github.com/CADDE-sip/connector/blob/222f7a88e987dbe17f47d103916d21c35e855349/doc/png/system.png?raw=true)

### 2.2.2. 提供者コネクタ起動確認
```bash
docker compose ps
NAME                             IMAGE                                  COMMAND                  SERVICE                          CREATED             STATUS              PORTS
provider_authorization           provider/authorization:4.0.0           "python3 -m swagger_…"   provider-authorization           11 seconds ago      Up 9 seconds        8080/tcp
provider_catalog_search          provider/catalog-search:4.0.0          "python3 -m swagger_…"   provider-catalog-search          11 seconds ago      Up 10 seconds       8080/tcp
provider_connector_main          provider/connector-main:4.0.0          "python3 -m swagger_…"   provider-connector-main          11 seconds ago      Up 9 seconds        8080/tcp
provider_data_exchange           provider/data-exchange:4.0.0           "python3 -m swagger_…"   provider-data-exchange           11 seconds ago      Up 9 seconds        8080/tcp
provider_provenance_management   provider/provenance-management:4.0.0   "python3 -m swagger_…"   provider-provenance-management   11 seconds ago      Up 10 seconds       8080/tcp
provider_reverse-proxy           nginx:1.23.1                           "/docker-entrypoint.…"   provider-reverse-proxy           11 seconds ago      Up 9 seconds        0.0.0.0:80->80/tcp, :::80->80/tcp, 0.0.0.0:443->443/tcp, :::443->443/tcp
```

提供者コネクタが起動できれば、[usage.mdに記載された提供者コネクタの使い方](./usage.md#提供者)を参考に、データ提供のための準備を行う。

### 2.2.3. 提供者コネクタ停止
```
sh stop.sh
```


# 3. 認可機能
## 3.1. 認可機能構築手順
ソースコードの取得は[利用者コネクタの取得方法](#111-利用者コネクタ取得)を参照。

認可機能は`misc/authorization`以下に存在する。
```bash
cd ~/klab-connector-v4/misc/authorization
```

### 3.1.1. コンフィグファイルの設定
#### docker-compose.yaml
`misc/authorization/docker-compose.yaml`
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
      KC_DB_USERNAME: keycloak_db_user # must change
      KC_DB_PASSWORD: password # must change
      ...
  postgres:
    ...
    environment:
      ...
      POSTGRES_USER: keycloak_db_user # must change
      POSTGRES_PASSWORD: password # must change
      ...
```

#### settings.json
パス: `misc/authorization/settings.json`

認可機能APIサーバで使用する設定ファイル。
| 設定パラメータ                     | 概要                                  |
| :------------------------------ | :----------------------------------- |
| provider_connector_id　| 提供者コネクタのクライアントID |
| client_id | **認証**機能発行の**認可機能**のクライアントID |
| client_secret | **認証**機能発行の**認可機能**のクライアントシークレット |
| authz_keycloak_url | **認可**機能KeycloakのベースURL |
| authn_url | **認証**機能APIのベースURL |
| authn_keycloak_url | **認証**機能KeycloakのベースURL |
| authn_realm_name | **認証**機能のレルム名 |
| subject_issuer | **認証**機能を表す文字列(authenticationを指定しておく) |

下の例では、`authz_keycloak_url`のドメインに対して認可機能リバースプロキシ用コンテナの名前である`authz_nginx`を設定し、Dockerに名前解決させる。
```json:settings.json
{
  "provider_connector_id": "提供者コネクタ クライアントID",
  "client_id": "認可機能 クライアントID",
  "client_secret": "認可機能 クライアントシークレット",
  "authz_keycloak_url": "http://authz_nginx/keycloak",
  "authn_url": "https://authn.ut-cadde.jp:18443/cadde/api/v4",
  "authn_keycloak_url": "https://authn.ut-cadde.jp:18443/keycloak",
  "authn_realm_name": "authentication",
  "subject_issuer": "authentication"
}
```

### 3.1.2. TLS設定
認証トークンと認可トークンの交換に伴い、認可サーバから認証サーバへのHTTPS通信が発生する。
この通信は認可機能FastAPIコンテナ, Keycloakコンテナから発生するため、対応するコンテナにTLS/HTTPSの設定を追加する必要がある。

まずは認証機能のCA証明書、つまり研究室内プライベート認証局の証明書`cacert.pem`（PEM形式）とKeycloak用のCA証明書 `kcTrustStore.p12`（PKCS12トラストストア形式）を認可機能に配置する。`cacert.pem`, `kcTrustStore.p12`は研究室内プライベート認証局の管理者から受け取っておく。
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
Keycloakコンテナを立ち上げるため、`prebuilt_keycloak:19.0.2`というDockerイメージを作成する。そのために、以下のシェルスクリプトを実行する。パスワードを聞かれたら、rootユーザのパスワードを入力する。
```bash
./image_build_keycloak.sh
```

同様にFastAPIコンテナを立ち上げるため、`fastapi:latest`というDockerイメージを作成する。そのために、以下のシェルスクリプトを実行する。パスワードを聞かれたら、rootユーザのパスワードを入力する。
```bash
./image_build_fastapi.sh
```

## 3.2. 認可機能起動手順
### 3.2.1. 認可機能起動
```bash
./start.sh
```

### 3.2.2. 認可機能起動確認
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
コンテナを起動中に`./provider_setup.sh`を実行して、対話的に以下の項目を入力する。これらは`settings_provider_setup.json`に書き込まれる。
| 設定パラメータ                     | 概要                                  |
| :------------------------------ | :----------------------------------- |
| CADDEユーザID　| 提供者のユーザID。これは認可機能Keycloakのレルム名として使用される。 |
| 提供者コネクタのクライアントID | 先に設定した`settings.json`内の`provider_connector_id`の値と一致させる。 |
| CADDE認証機能認証サーバのURL | 先に設定した`settings.json`の`authn_keycloak_url`と値を一致させる。 |

実行が完了すると、認可を設定するためのKeycloakのセットアップが完了する。
```bash
bash ./provider_setup.sh
```
```
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
```json:provider_setup.json
{ "realm": "<提供者ID>", "client": "<提供者コネクタ クライアントID>", "identity_provider": "https://authn.ut-cadde.jp:18443/keycloak" }
```

### 3.2.4. 認可機能停止
```bash
./stop.sh
```

