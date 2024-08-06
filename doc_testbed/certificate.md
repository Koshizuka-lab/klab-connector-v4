# CADDEテストベッド用TLS証明書の取得方法
本資料は、CADDEテストベッド上でアプリケーション間の通信に用いるTLSサーバ証明書の取得方法を示すものである。

CADDEテストベッドにおいて、すべてのアプリケーションのサーバ証明書は、テストベッド運用者（東京大学）が管理するテストベッド用プライベート認証局から発行される。

また、本テストベッドではTLS証明書の準備を簡単にするため、テストベッドネットワークに参加する組織ごとにワイルドカード証明書を取得し、テストベッド参加者自らが管理するすべてのアプリケーションでTLS証明書を共通化するものとする。
なお、複数のWireGuardサイトでテストベッドネットワークに参加する組織も、マルチドメイン証明書を取得することで、異なるサイトをまたいで1枚のTLS証明書を共通で利用することができる。

以下にTLS証明書の取得手順を示す。
1. 秘密鍵・証明書署名要求（CSR, Certificate Signing Request）を作成する
1. 証明書署名要求（CSR）ファイルをテストベッド用プライベート認証局に提出する
1. プライベート認証局からTLS証明書・CA証明書を受領する

# 前提
## 実行環境
- テストベッドネットワークに接続し、組織ごとのsitenameが割り当てられていること
    - `テストベッドネットワーク概要.pdf`を参照
- 以下のコマンドが利用可能であること
    - openssl（バージョン 1.1.1 以上）


# 1. 秘密鍵・CSRの作成

## 秘密鍵の作成
`openssl genrsa`コマンドを用いて、秘密鍵ファイルを作成する。
秘密鍵ファイルのファイル名は`-out`オプションで指定する。

```bash
$ openssl genrsa -out server.key 4096
```

## CSRの作成
`openssl req`コマンドを用いて、CSRファイルを作成する。
コマンド実行時には以下のオプションを指定する。

- `-key`：秘密鍵ファイル名
- `-out`：CSRファイル名
- `-addext`: TLS証明書の拡張属性
  - SAN（Subject Alternative Name）：証明書を配置するサーバのドメインを指定する
  - ワイルドカード証明書はアスタリスク（*）を含むドメインを設定することで取得できる
    - 例：`subjectAltName = DNS:*.koshizukalab.dataspace.internal`
  - 複数のサイトで共通利用するマルチドメイン証明書を取得したい場合は、設定したいサイトドメインの数だけ追加する
    - 例：2つのサイトドメインsite1.dataspace.internal, site2.dataspace.internalを持つ場合
        - `subjectAltName = DNS:*.site1.dataspace.internal,DNS:*.site2.dataspace.internal`

```bash
# SANを追加する場合
$ openssl req -new -key server.key -out server.csr -addext "subjectAltName = DNS:*.<サイトドメイン>"
```

また、上記のコマンドを実行すると、証明書を配置するサーバの識別情報を対話的に入力することが求められる。

サーバの識別情報を構成する項目は以下の通り。

- Country Name（任意）：国名
    - 例：`JP`
- State or Province Name（任意）：都道府県名
    - 例：`Tokyo`
- Locality Name（任意）：市区町村名
    - 例：`Bunkyo`
- Organization Name（任意）：組織名
    - 例：`The University of Tokyo`
- Organizatinal Unit Name（任意）：部門・部署名
    - 例：`Koshizuka Lab`
- Common Name（必須）：識別名（ドメイン・IPアドレスなど）
  - ワイルドカード証明書はアスタリスク（*）を含むドメインを設定することで取得できる
  - 例：`*.koshizukalab.dataspace.internal`

以下に、東京大学越塚研究室が取得しているTLS証明書のサーバ識別情報例を示す。
```bash
Country Name (2 letter code) [AU]: JP
State or Province Name (full name) [Some-State]: Tokyo
Locality Name (eg, city) []: Bunkyo
Organization Name (eg, company) [Internet Widgits Pty Ltd]: The University of Tokyo
Organizational Unit Name (eg, section) []: Koshizuka Lab
Common Name (e.g. server FQDN or YOUR name) []: *.koshizukalab.dataspace.internal
```

サーバ識別情報の入力が完了するとCSRが作成される。
作成したCSRの内容は次のコマンドで確認できる。
```bash
$ openssl req -text -noout -in ./server.csr
```


# 2. CSRの提出
テストベッド用プライベート認証局はテストベッド運用者である東京大学越塚研究室が管理している。

そのため、上記の手順で作成したCSRを越塚研究室の担当者に送付する。

<!-- TODO：動線となるフォームを記述 -->


# 3. サーバ証明書・CA証明書の受領
プライベート認証局はテストベッド参加者から提出されたCSRに署名を行い、TLS証明書を作成する。

TLS証明書の作成が完了次第、以下の2つのファイルがテストベッド参加者に送付される。

- テストベッド参加者のTLSサーバ証明書：`server.crt`
- プライベート認証局のCA証明書：`cacert.pem`

CADDEテストベッド参加者環境の構築にあたって、上記2種類のTLS証明書を適宜サーバ上に配置する。

なお、TLS証明書の内容は次のコマンドで確認できる。
`-in`オプションでTLS証明書のファイル名を指定する。
```bash
$ openssl x509 -text -noout -in server.crt
```
