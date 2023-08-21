# 本ドキュメントについて
本ドキュメントは、OpenSSLを用いた秘密鍵・証明書の作成方法を示すものである。

OpenSSLのバージョンは1.1.1以上であることを想定している。

# 秘密鍵の作成
`openssl genrsa`コマンドを用いて、秘密鍵ファイル（PEM形式）を作成する。
```bash
openssl genrsa -out ./server.key 4096
```

# CSR（証明書署名要求）の作成
`openssl req`コマンドを用いて、サーバ証明書を発行するためのCSR（Certificate Signing Request, 証明書署名要求）ファイル（PEM形式）を作成する。
作成時には上で作成した秘密鍵ファイルを`key`オプションで指定する。
```bash
openssl req -new -key ./server.key -out ./server.csr
```

CSR作成時にはサーバ識別名（DN）情報を入力する。具体的な項目は以下の通り。
- Country Name: 国名
- State or Province Name: 都道府県名
- Locality Name: 市区町村名
- Organization Name: 組織名
- Organizatinal Unit Name: **省略**
- Common Name: サーバ名

基本的にCommon Nameは、サーバのドメイン名（FQDN）と一致させる。別名やIPアドレスを指定したい場合はX.509証明書の拡張属性である`SubjectAltName`を設定する。

以下に、CADDEコネクタのサーバ識別名情報の設定例を示す。
ここでは、コネクタのドメイン名を`cadde.<userID>.com`と指定しているが、これは｀userID`にCADDE認証機能発行のユーザIDを入れることで、ユーザとコネクタの対応が分かりやすいようにしている。
```bash
openssl req -new -key ./server.key -out ./server.csr
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

作成したCSRの内容は次のコマンドで確認できる。
```bash
openssl req -text -noout -in ./server.csr
```

## （補足）SubjectAltNameの設定
CSRに`SubjectAltName`を記入するためには、`openssl req`コマンドに`addext`オプションを付与する。
以下のコマンド例では、サーバのドメイン名の別名として`localhost`, IPアドレスとして`127.0.0.1`を設定している。
```bash
openssl req -new -key ./server.key -out ./server.csr -addext "subjectAltName = DNS:cadde.<userID>.com,DNS:localhost,IP:127.0.0.1"
```

# 証明書の作成
作成したCSRは認証局に提出し、署名されたのち証明書が発行される。

CADDEデモ用のサーバ証明書（+クライアント証明書）であれば、研究室内のプライベート認証局に送信する。

証明書の内容は次のコマンドで確認できる
```bash
openssl x509 -text -noout -in ./server.crt
```

