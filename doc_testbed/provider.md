# データ提供者環境の構築 (WIP)

# 前提条件
- CADDEテストベッド利用申請
- ドメインの取得
- TLS証明書の取得
- データサーバの準備
  - HTTPサーバを立ち上げる（Dockerコンテナ）
  - 提供者コネクタ connector_main にextra_hostsを追加
    - 内部ドメイン `data-management.<username>.internal`
- GitHub利用準備
  - SSHでクローンする場合


# 1. インストール

## 1.1. 提供者カタログサイト

### 1.1.1. CKANの構築
CKAN公式ドキュメント"[Installing CKAN](https://docs.ckan.org/en/2.10/maintaining/installing/index.html)"の手順に従い、CKANサイトを構築する。

なお、[CKANの推奨動作環境](https://github.com/ckan/ckan/wiki/Hardware-Requirements)は以下の通り。
- CPU：2コア
- メモリ：4GB
- ディスク：60GB

以下では参考として、Docker Composeを用いた構築手順を示す。

まず、GitHubからDockerを用いたCKAN構築用のリポジトリをクローンする。
```bash
$ cd ${WORKDIR}
$ git clone https://github.com/ckan/ckan-docker.git
$ cp .env.example .env
```

`.env`ファイル内で、以下の環境変数を設定する。
- `NGINX_SSLPORT_HOST`
  - CKANコンテナを公開するポート番号
- `CKAN_SITE_URL`
  - CKANサイトのアクセスに用いるURL
  - CADDEテストベッド参加の事前準備で取得しておいた、提供者カタログサイトのドメイン名を用いる
- `CKAN_SYSADMIN_NAME`
  - CKANサイト管理者のユーザ名
- `CKAN_SYSADMIN_PASSWORD`
  - CKANサイト管理者のパスワード（英数字8文字以上）

```bash
$ vim .env
# Host Ports
NGINX_SSLPORT_HOST=<ポート番号>
...
# CKAN core
CKAN_SITE_URL=https://<提供者カタログサイトのドメイン>:<ポート番号>
...
CKAN_SYSADMIN_NAME=<CKAN管理者のユーザ名>
CKAN_SYSADMIN_PASSWORD=<CKAN管理者のパスワード>
```

次に、提供者カタログサイトのTLSサーバ証明書・秘密鍵をCKANのリバースプロキシに配置する。

配置先は`ckan-docker/nginx/setup`というディレクトリである。

なお、リポジトリからクローンした段階で、すでに`ckan-local.key`、`ckan-local.crt`というファイル名で秘密鍵・TLSサーバ証明書がそれぞれ存在している。
そのため、これらのファイルをCADDEテストベッド参加用の秘密鍵・TLSサーバ証明書で置き換える（ファイル名は同一のものにする）。

ディレクトリが以下の状態になれば完了である。
```bash
$ ls ${WORKDIR}/ckan-docker/nginx/setup/
ckan-local.crt  ckan-local.key  default.conf  index.html  nginx.conf
```

そして、CKANのリバースプロキシ用コンテナのDockerfileを以下の内容に書き換える。
```dockerfile
FROM nginx:stable-alpine

ENV NGINX_DIR=/etc/nginx

RUN apk update --no-cache && \
    apk upgrade --no-cache && \
    apk add --no-cache openssl

COPY setup/nginx.conf ${NGINX_DIR}/nginx.conf
COPY setup/index.html /usr/share/nginx/html/index.html
COPY setup/default.conf ${NGINX_DIR}/conf.d/

RUN mkdir -p ${NGINX_DIR}/certs

COPY setup/ckan-local.crt ${NGINX_DIR}/certs/ckan-local.crt
COPY setup/ckan-local.key ${NGINX_DIR}/certs/ckan-local.key

ENTRYPOINT nginx -g 'daemon off;'
```

最後に、以下のコマンドを実行し、提供者カタログCKAN用のDockerコンテナ群を起動する。
```bash
$ cd ${WORKDIR}/ckan-docker
$ docker compose build
$ docker compose up -d
```

提供者カタログの起動状況は以下のコマンドで確認できる。
```bash
$ cd ${WORKDIR}/ckan-docker
$ docker compose ps
```


### 1.1.2. CKANの初期設定
CKAN公式ドキュメント"[Getting Started](https://docs.ckan.org/en/2.10/maintaining/getting-started.html)"の手順に従い、CKANの初期設定を行う。

#### ユーザの作成
CKANの起動直後は管理者用アカウントしか存在しない。

そこで、CKANサイト上でデータ提供者に対応する新たなユーザを作成する。

新たなユーザを作成する場合、まず提供者カタログサイトに管理者としてログインする。

[image]

その後、`https://<CKANサイトドメイン>:<ポート番号>/user/register`というエンドポイントにアクセスすると、ユーザ作成画面に遷移する。
この画面上で、ユーザ名・パスワードを設定し、データ提供者に対応するユーザを作成する。

[image]

なお、CKAN上のユーザ名・パスワードは必ずしもCADDEユーザのユーザ名・パスワードと一致していなくともよいが、同じものを設定することを推奨する。
また、ユーザ作成時に入力するメールアドレスについては、メールサーバと連携しない場合には不要であるため、適当な文字列を入力すればよい。

`https://<CKANサイトドメイン>:<ポート番号>/user`にアクセスして、作成したユーザが一覧に含まれていることを確認できれば完了である。

[image]


#### 組織（Organization）の作成
CKANではデータカタログを組織単位（Organizations）でまとめることができる。

そこで、CKANサイト上でCADDEテストベッドに参加している組織（WireGuardサイト）に対応する新たな組織を作成する。

新たな組織を作成する場合、[上記](#ユーザの作成)で作成したユーザでCKANサイトにログインする。

[image]

その後、画面上部`Organizations`メニューに遷移し、`Add Organization`から新たな組織を作成する。

[image]

組織情報の入力画面では、組織名として各WireGuardサイトのsitenameに対応する英文字列を入力することを推奨する。
例えば、東京大学越塚研究室のWireGuardサイト上で構築されるデータ提供者環境では、`koshizukalab`を入力する。
また、組織の説明欄（Description）は任意で入力すれば良い。

画面上部`Organizations`メニューに遷移し、作成した組織が一覧に含まれていることを確認できれば完了である。


### 1.1.3. CKANの動作確認
<!-- TODO -->

#### via GUI
CKAN公式ドキュメント[User guide > Using CKAN](https://docs.ckan.org/en/2.10/user-guide.html#using-ckan)を参考に、CKAN上で新しいカタログの作成や既存のカタログの検索ができるか確認する。

#### via API
CKAN公式ドキュメント[API guide](https://docs.ckan.org/en/2.10/api/index.html)を参考に、APIを通じて以下を実行できるか確認する。
- カタログ一覧の取得
  - `/api/action/package_list`
- 指定したカタログの取得
  - `/api/action/package_show?id=<カタログID>`
- カタログの検索
  - `/api/action/package_search?q=<検索キーワード>`


### 1.1.4. 横断検索機能への登録申請
<!-- TODO -->

横断検索機能が提供者カタログサイトをクローリング対象として登録するための申請を行う。

横断検索機能は東京大学越塚研究室が管理しているため、CADDEテストベッド参加者は以下の情報を越塚研究室の担当者に送付する。
- 提供者カタログサイト名
  - 例：`越塚研究室カタログサイト`
- 提供者カタログサイトのドメイン名
  - 例：`cadde-catalog-test1.koshizukalab.dataspace.internal`

横断検索機能の登録完了通知を受け取り、横断検索サイト上で自身が提供するデータカタログの閲覧・検索ができることを確認できれば完了である。


## 1.2. 認可機能

### 1.2.1. ソースコードの取得
GitHubからCADDEコネクタリポジトリをクローンする。

```bash
$ git clone git@github.com:Koshizuka-lab/klab-connector-v4.git
$ cd ${WORKDIR}/klab-connector-v4
$ git checkout -b dev-klab origin/dev-klab
```

ブランチが`dev-klab`であることを確認する。
```bash
$ git branch -l
* dev-klab
  master
```

`klab-connector-v4/misc/authorization`に認可機能用ソースコードが配置してある。


### 1.2.2. Dockerイメージの作成
認可機能を構成するFastAPIコンテナおよびKeycloakコンテナのDockerイメージを作成する。
```bash
$ cd ${WORKDIR}/klab-connector-v4/misc/authorization
$ ./image_build_fastapi.sh
$ ./image_build_keycloak.sh
```

以下のコマンドでDockerイメージが作成されたことを確認する。
FastAPIコンテナは`fastapi:latest`、Keycloakコンテナは`prebuild_keycloak:19.0.2`という名前のイメージを用いている。
```bash
$ sudo docker image ls | grep fastapi
$ sudo docker image ls | grep keycloak
```


### 1.2.3. 認可用Keycloakの初期設定
以下のファイルを編集し、認可用Keycloakのユーザに関する初期設定を行う。
- `klab-connector-v4/misc/authorization/docker-compose.yaml`

設定すべきパラメータは以下の通り。
- services
  - nginx
    - `ports`：認可機能を公開するポート番号
  - keycloak
    - environment
      - `KEYCLOAK_ADMIN`：認可用Keycloakの管理者ユーザ名
      - `KEYCLOAK_PASSWORD`：認可用Keycloakの管理者パスワード
      - `KC_DB_USERNAME`：認可用Keycloakが利用するDBのユーザ名
      - `KC_DB_PASSWORD`：認可用Keycloakが利用するDBのパスワード
  - postgres
    - environment
      - `POSTGRES_USER`：PostgresDBのユーザ名
        - 上記`KC_DB_USERNAME`と一致させる
      - `POSTGRES_PASSWORD`：PostgresDBのパスワード
        - 上記`KC_DB_PASSWORD`と一致させる

<!-- 
| 設定パラメータ                     | 概要                                  |
| :------------------------------ | :----------------------------------- |
| services.nginx.ports | 認可機能ポート番号 |
| services.keycloak.environment.KEYCLOAK_ADMIN | 認可機能Keycloakのadminユーザ名 |
| services.keycloak.environment.KEYCLOAK_PASSWORD | 認可機能Keycloakのadminユーザパスワード |
| services.keycloak.environment.KC_DB_USERNAME | 認可機能Keycloakが利用するPostgresDBのユーザ名 |
| services.keycloak.environment.KC_DB_PASSWORD | 認可機能Keycloakが利用するPostgresDBのパスワード |
| services.postgres.environment.POSTGRES_USER | PostgresDBのユーザ名（KC_DB_USERNAMEと一致させる）　|
| services.postgres.environment.POSTGRES_PASSWORD | PostgresDBのパスワード（KC_DB_PASSWORD）と一致させる　| -->

以下に設定例を示す。
```yaml
services:
  nginx:
    ports:
      - "5080:80"
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
```

### 1.2.4. 認証機能との連携に関する設定
認可機能は認証機能と連携することで、データ利用者の認証トークンからCADDEユーザ情報を取得し、認可判断を行う。

そこで、認証機能の接続先URLや、認証機能から見た認可機能のクライアント設定を以下の設定ファイルに記載する。
- `klab-connector-v4/misc/authorization/settings.json`

設定すべきパラメータは以下の通り。

| 設定パラメータ | 概要 |
| :---------- | :-- |
| provider_connector_id　| 提供者コネクタのクライアントID（認可機能発行） |
| client_id | 認可機能のクライアントID |
| client_secret | 認可機能のクライアントシークレット |
| authz_keycloak_url | 認可機能KeycloakのベースURL |
| authn_url | 認証機能APIのベースURL |
| authn_keycloak_url | 認証機能KeycloakのベースURL |
| authn_realm_name | 認証機能のレルム名（authenticationに固定） |
| subject_issuer | 認証機能を表す文字列（authenticationに固定） |

以下に設定例を示す。
```json
{
  "provider_connector_id": "provider-test1",
  "client_id": "authz-test1",
  "client_secret": "XXX",
  "authz_keycloak_url": "http://cadde-authz-test1.koshizukalab.dataspace.internal:5080/keycloak",
  "authn_url": "https://cadde-authn.koshizukalab.dataspace.internal:18443/cadde/api/v4",
  "authn_keycloak_url": "https://cadde-authn.koshizukalab.dataspace.internal:18443/keycloak",
  "authn_realm_name": "authentication",
  "subject_issuer": "authentication"
}
```

また、認証機能との連携に伴い、認可機能上で認証機能のサーバ証明書を信頼するための設定を行う必要がある。

まず、認証機能のCA証明書を配置するためのディレクトリを作成する。
```bash
$ mkdir ${WORKDIR}/klab-connector-v4/misc/authorization/certs
```

上のディレクトリに認証機能のCA証明書を配置する。
この証明書は、CADDEテストベッド参加の事前準備の段階で、`cacert.pem`というファイル名で受け取っていることを前提とする（[certificate.mdを参照](./certificate.md)）。

ディレクトリが以下の状態になれば完了である。
```bash
$ ls ${WORKDIR}/klab-connector-v4/misc/authorization/certs
cacert.pem
```

次に、認証機能FastAPIコンテナおよびKeycloakコンテナ内部にCA証明書を配置するための設定を以下のファイルで行う。
- `klab-connector-v4/misc/authorization/docker-compose.yml`


設定すべきパラメータは以下の通り。
- services
  - fastapi
    - volumes：CA証明書をコンテナ内にマウント
    - environment
      - `REQUESTS_CA_BUNDLE`：PythonのHTTPリクエスト時に信頼するCA証明書
  - keycloak
    - volumes：CA証明書（pkcs12形式）をコンテナ内にマウント
    - environment
      - `KC_SPI_TRUSTSTORE_FILE_FILE`
      - `KC_SPI_TRUSTSTORE_FILE_PASSWORD`
      - `KC_SPI_TRUSTSTORE_FILE_HOSTNAME_VERIFICATION_POLICY`
      - `KC_SPI_TRUSTSTORE_FILE_TYPE`
    - entrypoint：Keycloakコンテナ起動時に実行されるコマンド
      - CA証明書（PEM形式）からCA証明書（PKCS#12形式）に変換した後、Keycloakを起動するコマンドを記述
    - command：使用しないためコメントアウトする

以下に設定例を示す。
```yaml
services:
  fastapi:
    volumes:
      - "./certs/cacert.pem:/etc/docker/certs.d/cacert.pem:ro"
    environment:
      - REQUESTS_CA_BUNDLE=/etc/docker/certs.d/cacert.pem

  keycloak:
    volumes:
      - "./certs/cacert.pem:/opt/keycloak/cacert.pem:ro"
    environment:
      KC_SPI_TRUSTSTORE_FILE_FILE: cacert.p12
      KC_SPI_TRUSTSTORE_FILE_PASSWORD: testbed
      KC_SPI_TRUSTSTORE_FILE_HOSTNAME_VERIFICATION_POLICY: WILDCARD
      KC_SPI_TRUSTSTORE_FILE_TYPE: pkcs12
    entrypoint: >
      /bin/bash -c "keytool -import -noprompt -file cacert.pem -keystore cacert.jks -storepass testbed
      && keytool -importkeystore -noprompt -srckeystore cacert.jks -srcstorepass testbed -destkeystore cacert.p12 -deststoretype PKCS12 -deststorepass testbed
      && /opt/keycloak/bin/kc.sh start-dev"
    # command: start-dev
```


### 1.2.5. 認可機能の起動
以下のコマンドを実行し、認可機能用のDockerコンテナ群を起動する。
```bash
$ cd ${WORKDIR}/klab-connector-v4/misc/authorization
$ sh ./start.sh
```

認可機能の起動状況は以下のコマンドで確認できる。
```bash
$ cd ${WORKDIR}/klab-connector-v4/misc/authorization
$ docker compose ps
```

### 1.2.6. 認可機能の初期セットアップ
認可機能を起動したのち、認可機能の利用ユーザや認証機能との連携に関する初期設定を行う必要がある。

なお、初期設定の内容はDockerボリュームに保存されるため、同じボリューム上ですでに初期設定を行っていれば、再度この手順に従う必要はない。

`provider_setup.sh`を実行し、以下の設定項目を対話的に入力する。

| 設定パラメータ | 概要 |
| :---------- | :-- |
| CADDEユーザID　| データ提供者のCADDEユーザID |
| 提供者コネクタのクライアントID | `settings.json`の`provider_connector_id`の値と一致 |
| CADDE認証機能認証サーバのURL | `settings.json`の`authn_keycloak_url`の値と一致 |

以下に初期セットアップの実行例を示す。
```bash
$ cd ${WORKDIR}/klab-connector-v4/misc/authorization
$ bash ./provider_setup.sh
CADDEユーザID: test1
提供者コネクタのクライアントID: provider-test1
CADDE認証機能認証サーバのURL: https://cadde-authn.koshizukalab.dataspace.internal:18443/keycloak
```

次のようなメッセージが出力されていれば、正常に初期セットアップが行われたこととなる。
```bash
----------アドミンのアクセストークン取得----------
アドミンのアクセストークン取得成功
----------レルム設定----------
# レルム作成
レルムを作成しました
...（省略）...
## アイデンティティプロバイダーのUUIDの取得
アイデンティティプロバイダーのUUID: XXXX
## Token Exchangeに関わるパーミッションの設定
Token Exchangeに関わるパーミッションを設定しました
```

最後に、入力した設定項目が`settings_provider_setup.json`に記入されていることを確認する。
```bash
$ cd ${WORKDIR}/klab-connector-v4/misc/authorization
$ cat settings_provider_setup.json
```

### （参考）認可機能の停止
認可機能を停止したい場合は、以下のコマンドを実行する。
```bash
$ cd ${WORKDIR}/klab-connector-v4/misc/authorization
$ sh ./stop.sh
```


## 1.3. 提供者コネクタ

### 1.3.1. ソースコードの取得
GitHubからCADDEコネクタリポジトリをクローンする。

```bash
$ git clone git@github.com:Koshizuka-lab/klab-connector-v4.git
$ cd klab-connector-v4
$ git checkout -b dev-klab origin/dev-klab
```

ブランチが`dev-klab`であることを確認する。
```bash
$ git branch -l
* dev-klab
  main
```

`klab-connector-v4/src/provider`に提供者コネクタ用ソースコードが配置してある。

### 1.3.2. 共通ファイルの展開
`setup.sh`を実行する。
```bash
$ cd ${WORKDIR}/klab-connector-v4/src/provider
$ sh setup.sh
```

### 1.3.3. リバースプロキシの設定

提供者コネクタに対する通信はHTTPSによる接続が推奨される。
また、CADDEはデータ共有の信頼性を高めるため、利用者コネクタ - 提供者コネクタ間の相互TLS通信をサポートしている。
そこで、リバースプロキシ上でTLSサーバ証明書の設定を行う。

#### 秘密鍵・サーバ証明書の準備
[certificate.md](certificate.md)に基づき、CADDEテストベッド参加サイト用の秘密鍵とワイルドカード証明書のペアを作成する。

秘密鍵とワイルドカード証明書の作成後、それらを配置するためのディレクトリを作成する。
このディレクトリはリバースプロキシ用Dockerコンテナにマウントされる。

```bash
$ mkdir ${WORKDIR}/klab-connector-v4/src/provider/nginx/volumes/ssl
```

上で作成したディレクトリに秘密鍵とワイルドカード証明書のファイルをそれぞれ`server.key`、`server.crt`というファイル名で配置する
（ただし、これらのファイル名はNginxの設定ファイルを編集することで変更可能）。

ディレクトリが以下の状態になれば完了である。
```bash
$ ls ${WORKDIR}/klab-connector-v4/src/provider/nginx/volumes/ssl
server.crt  server.key
```

#### クライアント認証用CA証明書の準備
利用者コネクタ - 提供者コネクタ間の相互TLS通信では、利用者コネクタのクライアント認証を行う。
そのため、リバースプロキシに利用者コネクタが提示するクライアント証明書のCA証明書を、秘密鍵・サーバ証明書を配置したディレクトリと同じ場所に配置しておく。

CADDEテストベッド上のサーバ証明書は、すべてテストベッド用プライベート認証局（越塚研管理）から発行される。
プライベート認証局のルート証明書は、ワイルドカード証明書の発行と同時に`cacert.pem`というファイル名で受け取っていることを前提とする。

ディレクトリが以下の状態になれば完了である。
```bash
$ ls ${WORKDIR}/klab-connector-v4/src/provider/nginx/volumes/ssl
cacert.pem server.crt  server.key
```


### 1.3.4. データカタログの接続設定

設定ファイルの一覧は以下の通り。

| コンフィグファイル | 概要 |
| :------------  | :----- |
| provider_ckan.json | 横断検索・詳細検索カタログCKANサーバのアクセス設定 |
| authorization.json | [**認可設定時**] 認可機能URLの設定 |
| connector.json | [**認可設定時**]　提供者コネクタ設定 |
| provenance.json | [**来歴管理設定時**] 来歴管理サーバURLの設定 |


詳細検索カタログをコネクタ経由で公開するため、詳細検索カタログのCKANサイトURLを設定ファイルに記載する。

パス: `connector-main/swagger_server/configs/provider_ckan.json`

| 設定パラメータ | 概要 |
| :---------- | :---- |
| release_ckan_url | 横断検索用データカタログのURL |
| detail_ckan_url | 詳細検索用データカタログのURL |
| authorization | 詳細検索用データカタログアクセス時の認可確認有無 |
| packages_search_for_data_exchange | データ取得時の交換実績記録用リソースID検索を行うか否かを設定 |

(記入例)
```json:provider_ckan.json
{
    "release_ckan_url": "https://cadde-catalog-test1.koshizukalab.dataspace.internal:8443",
    "detail_ckan_url": "https://cadde-catalog-test1.koshizukalab.dataspace.internal:8443",
    "authorization": true,
    "packages_search_for_data_exchange": true
}
```

### 1.3.5. データサーバ（HTTP）の接続設定
提供データをコネクタ経由で公開するため、HTTPサーバのURLを設定ファイルに記載する。

パス: `src/provider/connector-main/swagger_server/configs/http.json`

この設定ファイルはコネクタ経由で公開するデータを追加するたびに編集する。
詳細はXXX.mdで述べる。（X.Y.Z節参照）


### 1.3.6. 認可機能の接続設定
リソース提供時に認可確認を行う場合に、認可機能URLを設定する。[認可機能の構築方法はこちら](#31-認可機能構築手順)

パス: `src/provider/authorization/swagger_server/configs/authorization.json`

| 設定パラメータ | 概要 |
| :---------- | :---- |
| authorization_server_url | 認可機能のアクセスURL |

(記入例)
```json:authorization.json
{
     "authorization_server_url": "<認可機能URL>"
}
```

また、認可機能の利用には提供者コネクタの情報が必要である。
提供者コネクタのクライアントIDとシークレットは認可機能（≠認証機能）発行のものを用いることに注意が必要である。

パス: `src/provider/connector_main/swagger_server/configs/connector.json`

| 設定パラメータ                     | 概要                                  |
| :------------------------------ | :----------------------------------- |
| provider_id | CADDEユーザID（提供者） |
| provider_connector_id | 提供者コネクタのクライアントID |
| provider_connector_secret | 提供者コネクタのクライアントシークレット |
| trace_log_enable | コネクタの詳細ログ出力有無（出力無の設定でも基本的な動作ログは出力される） |

TODO: 認可機能・コネクタの構築順を検討する

```json:connector.json
{
    "provider_id" : "<提供者ID>",
    "provider_connector_id" : "<提供者コネクタ クライアントID>",
    "provider_connector_secret" : "<提供者コネクタ クライアントシークレット>",
    "trace_log_enable" : true
}
```

### 1.3.7. 来歴管理の接続設定（WIP）
来歴管理機能を利用する場合、来歴管理サーバURLを設定ファイルに記載する。

パス: `src/provider/provenance-management/swagger_server/configs/provenance.json`

| 設定パラメータ                     | 概要                                  |
| :------------------------------ | :----------------------------------- |
| provenance_management_api_url | 来歴管理サーバURL |

```json:provenance.json
{
    "provenance_management_api_url": "http://cadde-provenance-management.koshizukalab.dataspace.internal:3000/v2"
}
```

### 1.3.8. その他カスタマイズ可能な項目
- ポート番号
- TODO: 他には？

### 1.3.9. 提供者コネクタの起動
以下のコマンドを実行し、提供者コネクタ用のDockerコンテナ群を起動する。
```bash
$ cd ${WORKDIR}/klab-connector-v4/src/provider
$ sh ./start.sh
```

起動した提供者コネクタの構成は以下の通り。
![提供者コネクタ構成](./images/producer.png)

提供者コネクタの起動状況は以下のコマンドで確認できる。
```bash
$ cd ${WORKDIR}/klab-connector-v4/src/provider
$ docker compose ps
...
```

提供者コネクタが起動できれば、[usage.mdに記載された提供者コネクタの使い方](./usage.md#提供者)を参考に、データ提供のための準備を行う。

### （参考）提供者コネクタの停止
提供者コネクタを停止したい場合は、以下のコマンドを実行する。
```bash
$ cd ${WORKDIR}/klab-connector-v4/src/provider
$ sh ./stop.sh
```


# 2. データ提供設定
<!-- - （来歴管理機能にデータの原本登録をする）
- （横断検索カタログに登録申請する）
- 提供者カタログにデータカタログを作成する
- 認可機能に認可を設定する
- 提供者コネクタにデータを登録する -->

本章では、コネクタを経由したデータ提供を行うために、データ提供者が事前に準備する必要のある設定について説明する。

## 2.1. データカタログの作成
データ利用者は横断検索カタログサイトまたは提供者カタログサイトにアクセスして、取得したいデータを検索・発見する。
そのため、データ提供者は自らが管理する提供者カタログサイトにデータカタログを作成する必要がある。
ここで作成した提供者カタログは、横断検索機能によってクローリングされ、横断検索カタログサイトにも登録される。

以下にCKANサイト上でデータカタログを登録する手順を示す。

まず、[1.1.2. CKANの初期設定](#112-ckanの初期設定)で作成したユーザでCKANサイトにログインする。

![カタログサイトトップページ](./images/catalog_top.png)

ログイン後、[1.1.2. CKANの初期設定](#112-ckanの初期設定)で作成したOrganizationの配下にデータカタログを追加していく。

画面上部メニューの`Organizations`から登録されているOrganizationの一覧ページに遷移し、さらに自ら登録したOrganizationのページに遷移する。

![カタログサイトOrganizations一覧](./images/catalog_organization.png)

`Add Dataset`を押下して新たなデータカタログを作成する。

![カタログサイトklabデータセット一覧](./images/catalog_dataset.png)

データカタログを作成する際は、データセットのタイトルなどのメタデータを設定していく。
ここで、CADDE上で流通するデータカタログには、詳細検索を行うための独自の拡張項目が定められており、以下2つの項目を設定する必要がある。

- `caddec_dataset_id_for_detail`: データセットの識別子
- `caddec_provider_id`: データ提供者のCADDEユーザID

これらの拡張項目はデータカタログ作成ページの一番下に存在する`Custom Field`の箇所で設定する。

![カタログサイトデータセット追加画面](./images/catalog_custom_field.png)


メタデータの設定が完了すれば`Next: Add Data`を押し、次のページでは実際に提供するデータファイルを登録する。

CKANサイトでのデータの登録方法は、CKAN自体に提供データをアップロードする方法（Upload）、別サーバに保存しているデータのロケーション（URL）を登録する方法（Link）の2通り存在する。

ここでは`Link`を押下し、外部のファイルサーバに配置したデータのURLを入力する。
データの名前や説明、フォーマットは適宜入力する。

![カタログサイトデータファイル追加画面](./images/catalog_add_link.png)

データに関する情報の入力が完了して`Finish`を押すと、データカタログの登録が完了となる。
なお、1つのデータセットに複数のデータを登録する場合は、`Save & add another`を押し別のデータの登録を続ける。


## 2.2. 認可の設定
データ提供者は自身の提供データに対する認可条件を設定することでデータ共有時のアクセス制御を行う。

まず、事前に設定した自身の認可機能のURLを用いて、ブラウザから認可機能GUIにアクセスする。

トップ画面に表示される`ログイン`を押下すると、認証機能（Keycloak）のユーザログイン画面に遷移するため、自身のCADDEユーザIDとパスワードを入力する。

![認可機能ログイン](./images/authz_login.png "ログイン")
![認証機能ログイン](./images/authn_login.png "ログイン")

ログインに成功すると、認可機能の画面に戻り、画面左側の各メニューを利用することができる。
認可を設定するためには`認可登録`メニューに遷移する。

ここでは以下の4つの条件を入力して認可の設定を行う。なお、「ユーザに対する認可」「組織に対する認可」「当人認証レベルに対する認可」の3つは任意入力であるが、このうち少なくとも一つに関して入力する必要がある。

- リソースURL（必須）
- ユーザに対する認可（任意）
  - CADDEユーザ単位での認可
  - CADDEユーザIDを指定する
- 組織に対する認可（任意）
  - CADDEを利用する組織単位での認可
  - CADDEユーザに紐づいた組織IDを指定する
    - 組織IDはCADDEユーザの`org`属性に登録されている
- 当人認証レベルに対する認可（任意）
  - データ利用者の認証レベル（AAL, Authenticator Assurance Level）に対する認可
    - AAL：認証の要素数によって1 / 2 / 3の値をとる
    - 設定したAALの値より大きな認証レベルのユーザに対してアクセスを許可する
  - データ利用者の認証レベルを考慮しないのであればAAL=1を設定する
    - ユーザID・パスワードのみを用いた認証に対応する

以上の条件を記入して`認可設定`を押下すると認可の設定が完了する。
正常に登録された認可は画面左側`認可一覧`メニューにて確認することができる。

![認可登録画面](./images/authz_registration.png "認可登録")

### （参考）認可一覧メニュー
認可一覧メニューでは、設定した認可がリソースURLごとに表示される。
リソースURLの部分を押下することで、選択したリソースの認可の詳細を確認できる。

![認可一覧画面](./images/authz_list.png "認可一覧")

各認可設定の詳細画面では、ユーザ・組織・当人認証レベルなどの条件の確認・削除ができる。

認可を削除する場合、削除対象の認可の行を選択した状態で、`認可削除`を押下する。
リソースURLに紐づくすべての認可を削除した場合、認可一覧から対象URLが削除される。

![認可詳細画面](./images/authz_detail.png "認可詳細")

### （参考）認可機能の設定メニュー
認可機能の設定メニューでは、以下の3つの設定項目の確認・変更が可能である。

- 認可機能の設定
    - 認可機能が発行するアクセストークンの生存期間を確認・変更する
- 提供者コネクタ設定
    - 認可機能が管理している提供者コネクタのクライアントID・シークレットを確認・変更する
    - これらの情報は[1.3.6. 認可機能の接続設定](#136-認可機能の接続設定)で必要
- 認証機能との連携設定
    - 認証機能と連携する際に使用するUserInfo URLを確認・変更する

![認可機能設定画面](./images/authz_settings.png "認可機能の設定")


## 2.3. データサーバの接続設定
コネクタを介したデータ提供を行うためには、提供者コネクタ上で自身が提供するデータに関する情報を設定する必要がある。

パス: `src/provider/connector-main/swagger_server/configs/http.json`

本設定ファイルでは以下の4つの項目を設定する。
- `basic_auth`
  - Basic認証が必要なデータサーバのドメインや認証情報を設定する
  - Basic認証を設定しない場合は何も記述する必要がない
- `authorization`
  - 提供データのURLと認可確認の有無を設定する
  - データ利用者から要求されたデータに関する設定が存在しない場合、trueとして動作する
- `contract_management_service`
  - 提供データのURLとデータ取引市場の利用有無を設定する
  - データ利用者から要求されたデータに関する設定が存在しない場合、trueとして動作する
  - CADDEテストベッドはデータ取引市場を含まないため、提供データを追加するたびにfalseを設定することとする
- `register_provenance`
  - 提供データのURLとデータ送信来歴の登録有無を設定する
  - データ利用者から要求されたデータに関する設定が存在しない場合、trueとして動作する
  <!-- - TODO：CADDEテストベッドは来歴管理機能を含まないため、提供データを追加するたびにfalseを設定することとする -->

以下に設定例を示す。
```json
"authorization": [
    {
        "url": "https://example1.com/with_authz.txt",
        "enable": true
    },
    {
        "url": "https://example2.com/without_authz.txt",
        "enable": false
    }
],
"contract_management_service": [
    {
        "url": "https://example1.com/with_authz.txt",
        "enable": false
    },
    {
        "url": "https://example2.com/without_authz.txt",
        "enable": false
    }
],
"register_provenance": [
    {
        "url": "https://example1.com/with_authz.txt",
        "enable": true
    },
    {
        "url": "https://example2.com/without_authz.txt",
        "enable": true
    }
]
```

# 3. 動作確認
- XXX.mdを参照
  - データ利用者から詳細検索
    - 詳細検索カタログの認可を行わないといけない
  - データ利用者からデータ取得（認可なし）
  - データ利用者からデータ取得（認可あり）
