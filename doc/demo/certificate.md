# 本ドキュメントについて
本ドキュメントは、OpenSSLを用いた秘密鍵・証明書の作成方法を示すものである。

まず秘密鍵を作成し、その後CSR（証明書署名要求）ファイル（拡張子: `csr`）を作成する。作成したCSRファイルは研究室内プライベート認証局の管理者に送付し、署名してもらうことで最終的に証明書（拡張子: `crt`）を得る。

## 前提条件
OpenSSL（`openssl`コマンド）が利用でき、かつバージョンが1.1.1以上であること。

# 1. 秘密鍵の作成
`openssl genrsa`コマンドを用いて、秘密鍵ファイル（PEM形式）を作成する。

秘密鍵ファイルのファイル名は`-out`オプションで指定する。ここでは、`server.key`としている。
```bash
openssl genrsa -out ./server.key 4096
```

# 2. CSR（証明書署名要求）の作成
`openssl req`コマンドを用いて、サーバ証明書を発行するためのCSR（Certificate Signing Request, 証明書署名要求）ファイル（PEM形式）を作成する。

コマンド実行時に指定しているオプションに関する説明は以下の通り。
- `-key`: 秘密鍵ファイル名
- `-out`: CSRファイル名
  - 以下のコマンドでは`server.csr`としている。
- `-addext`: X.509証明書の拡張属性である`SubjectAltName`としてサーバドメインの別名やIPアドレスを指定
  - CADDEコネクタ構築デモでは、サーバドメインを適当に設定した提供者コネクタ・利用者コネクタのドメインとする。また、各コネクタはローカルマシン上に立ち上げているため、ドメインの別名として`localhost`、IPアドレスとして`127.0.0.1`も指定する。
```bash
openssl req -new -key ./server.key -out ./server.csr -addext "subjectAltName = DNS:<コネクタドメイン>,DNS:localhost,IP:127.0.0.1"
```

CSR作成時にはサーバ識別名（DN）情報を入力する。具体的な項目は以下の通り。
- Country Name: 国名
- State or Province Name: 都道府県名
- Locality Name: 市区町村名
- Organization Name: 組織名
- Organizatinal Unit Name: **省略**
- Common Name: サーバ名

以下に、CADDEコネクタのサーバ識別名情報の入力例を示す。Common Nameに対応する`<コネクタドメイン>`は適宜事前に設定した利用者コネクタ・提供者コネクタのドメイン名に書き換える。
```
...
Country Name (2 letter code) [AU]: JP
State or Province Name (full name) [Some-State]: Tokyo
Locality Name (eg, city) []: Bunkyo
Organization Name (eg, company) [Internet Widgits Pty Ltd]: Koshizuka Lab
Organizational Unit Name (eg, section) []:
Common Name (e.g. server FQDN or YOUR name) []: <コネクタドメイン>
```

作成したCSRの内容は次のコマンドで確認できる。
```bash
openssl req -text -noout -in ./server.csr
```

# 3. 証明書の作成
作成したCSRは認証局に提出し、署名されたのち証明書が発行される。

**CADDE構築デモ用のサーバ証明書（クライアント証明書）を作成する場合は、上で作成したCSRファイルを研究室内プライベート認証局の担当者に送信する。**

証明書の内容は次のコマンドで確認できる。
```bash
openssl x509 -text -noout -in ./server.crt
```

