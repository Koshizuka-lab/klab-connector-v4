# CADDEテストベッド ハンズオン (WIP)
本資料は、データスペース技術国際テストベッド「第3回テストベッドTF CADDE4.0ハンズオン」（2024年8月23日）で用いられるものである。

# 目標
本ハンズオンでは、AWS上に構築したハンズオン環境において、データ利用者環境・データ提供者環境をそれぞれ構築し、それらの間でCADDEを通じたデータ検索・取得を達成することを目的とする。


# 前提

## ハンズオン環境について
ハンズオン環境はAWS上に構築され、データスペース技術国際テストベッドに参加している各社ごとに割り当てられる。

ハンズオン環境を構成するホスト情報は以下の通り。
- EC2（t3.medium）：2台
    - OS：Ubuntu 22.04
    - CPU：2コア
    - メモリ：4GB
    - ディスク：40GB

2つの仮想マシンのうち、1つをデータ提供者環境（・WireGuardルータ）、もう1つをデータ利用者環境として構築することとする。

データ提供者環境には以下の4つのアプリケーション用コンテナを構築する。
- HTTPサーバ
- 提供者カタログサイト
- 認可機能
- 提供者コネクタ

データ利用者環境には以下の2つのアプリケーション用コンテナを構築する。
- 利用者コネクタ
- 利用者WebApp


## CADDEテストベッド参加のための事前準備
本来、CADDEテストベッドの利用を開始するためには、各参加者が[CADDEテストベッド参加のための事前準備](./README.md#caddeテストベッド参加のための事前準備)を行うことが必要となる。
具体的な準備事項は以下の通り。
- [CADDEテストベッド利用情報の取得](./README.md#caddeテストベッド利用情報の取得)
- [CADDEテストベッド参加者環境のドメイン登録](./README.md#caddeテストベッド参加者環境のドメイン登録)
- [CADDEテストベッド用TLS証明書の取得](./README.md#caddeテストベッド用tls証明書の取得)

しかし、本ハンズオンでは、CADDE参加者環境の構築・設定・利用方法に焦点を当てるため、これらの準備情報をハンズオン環境用に事前に割り当てる。

そのため、ハンズオン参加者が上記の事前準備を行う必要はない。
下記のハンズオン作業では、東京大学によって割り振られたハンズオン用の事前準備情報（CADDEユーザID、ドメイン名、TLS証明書など）を用いることとする。
<!-- TODO: TLS証明書の場所を示す -->
<!-- TODO：↑上記の情報を割り振る動線を確認 -->


# ハンズオン手順

## 1. 実行環境の準備
CADDE参加者環境の構築・利用は、以下のコマンドおよびソフトウェアが利用可能であることを前提とする。
- docker
- git
- curl
- jq
- openssl

以下にこれらをインストールするための例を示す。

0. （パッケージリストの更新）
    ```bash
    $ sudo apt-get update
    ```

1. docker

    [公式サイト](https://docs.docker.com/engine/install/ubuntu/)を参考にインストールする。
    ```bash
    # Add Docker's official GPG key:
    $ sudo apt-get update
    $ sudo apt-get install ca-certificates curl
    $ sudo install -m 0755 -d /etc/apt/keyrings
    $ sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    $ sudo chmod a+r /etc/apt/keyrings/docker.asc

    # Add the repository to Apt sources:
    $ echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    $ sudo apt-get update

    $ sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    ```

    自分のユーザをdockerグループに追加し、sudoなしでdockerコマンドを実行可能にする。
    シェルにログインし直すことで有効になる。
    ```bash
    $ sudo usermod -aG docker $USER
    ```

1. その他
    ```bash
    $ sudo apt-get install curl git jq openssl
    ```

<!-- TODO: certsを移動させる手順は記述する？ -->


## 2. CADDE参加者環境の構築
データ提供者環境の構築手順は[provider.md > 1. インストール](./provider.md#1-インストール)を参照する。<br/>
[データ提供設定](./provider.md#2-データ提供設定)については、以降の章（[3. CADDEでデータを提供する](#3-caddeでデータを提供する)）にて具体的に扱う。

データ利用者環境の構築手順は[consumer.md > 1. インストール](./consumer.md#1-インストール)を参照する。

<!-- TODO: 完了条件 -->


## 3. CADDEでデータを提供する
本章では、データ提供者がコネクタを経由してCADDE上にデータを提供する手順を追う。

### 3.1. データサーバを構築する
- 提供データの準備（データサーバの構築）
    - nginxでシンプルなHTTPサーバを構築
    - 2種類のデータを用意する
    - データ利用者に対して認可を与えるデータ
    - データ利用者に対して認可を与えないデータ
    <!-- - TODO: どういうデータを準備するか -->

### 3.2. データ原本情報を登録する
- 提供データの原本登録
    - 登録できたら確認する

### 3.3. データカタログを作成する
- データカタログの作成
    - 2種類のデータセットを登録する

### 3.4. 認可を設定する
- 認可の設定
    - 自分の環境のデータ利用者に対して認可を与える

### 3.5. 提供者コネクタとデータサーバを接続する
- 2種類の提供データを登録


## 4. CADDEでデータを取得する
本章では、データ利用者がコネクタを経由してCADDEからデータを取得する手順を追う。

### 4.1. ユーザ認証

### 4.2. 横断検索カタログを通じてデータを発見する

### 4.3. 提供者カタログサイトからデータカタログを取得する

### 4.4. データ提供者からデータを取得する
- 2種類の提供データに対してリクエスト
- 片方は取得でき、片方は取得できないことを確認する


## 5. CADDE上のデータの来歴を確認する
本章では、データ提供者・データ利用者がCADDE上で共有されたデータの来歴（データ交換・加工の履歴）を確認する手順を追う。

データ提供者
- 送信来歴の確認

データ利用者
- 受信来歴の確認
