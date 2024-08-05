# CADDEテストベッド参加資料 (WIP)
本資料は、データスペース技術国際テストベッド(以下、ITDT)上に構築される、CADDEテストベッドへの参加時に必要となる準備事項・環境構築手順を示すものである。

本ディレクトリに含まれる資料は、CADDE公式の技術仕様を参考としつつ、説明の都合上、一部を省略・追加するなどの改変を行っているものである。<br/>
したがって、本テストベッド用資料群に記載された内容が公式の技術仕様と一部異なる場合があることを予めご了承ください。<br/>
CADDE公式の詳細な技術仕様については、[CADDE-sip/documentのリポジトリ](https://github.com/CADDE-sip/documents)から確認できる。


# CADDEテストベッド参加のための事前準備
- CADDEテストベッド利用申請
    - 申請の流れ
        - テストベッド参加者：CADDEテストベッド利用申請フォームに必要事項を記入し、テストベッド運営者（＝ 東京大学越塚研究室）に提出する
        - テストベッド運営者：申請情報を基にCADDE利用に必要な設定情報を返す
    - 必要事項
        - 必要なユーザアカウント数
            - ユーザ数だけCADDEユーザID・パスワードを発行する
            - CADDEユーザIDのネーミングポリシーは？
        - データ利用者環境を構築するか（y / n）
            - ユーザアカウント数 x 2（利用者コネクタ・WebApp）のクライアント情報を発行する
            - 利用者コネクタ1つとかWebApp1つとかにはできないか？
        - データ提供者環境を構築するか（y / n）
            - ユーザアカウント数 x 2（提供者コネクタ・認可機能）のクライアント情報を発行する
            - 認可機能は1つでもいけそう？（認可機能の設計書を確認する）
        - 詳細カタログサイトURL
            - 横断検索カタログのクローリング用
            - オリジン（ドメイン + ポート番号）を送信してもらう
            - 登録申請のタイミングで横断検索カタログに登録を行う or カタログサイトの構築後
        - （二要素認証の利用希望）
        - （提供者コネクタURL）
            - ロケーションサービスを利用する場合
    - 設定情報
        - ユーザ情報
            - CADDEユーザID
                - ID採番規則
                    - `<連番（4桁）>.<sitename>`
                    - 例： `0001.koshizukalab`
            - 初期パスワード
                - secretsライブラリで生成
            - アカウントコンソール画面のURL
                - `https://cadde-authn.koshizukalab.dataspace.internal:18443/keycloak/realms/authentication/account`
                - 初期パスワードを変更してもらう
        - クライアント情報
            - クライアントID
                - 利用者コネクタ `consumer-<username>`
                - 利用者WebApp `webapp-<username>`
                - 認可機能 `authz-<username>`
            - クライアントシークレット
        - 支援サービス情報
            - 横断検索カタログURL
            - 認証機能 CADDE API
            - 認証機能 Keycloak
            - 来歴管理機能URL
- ドメインの取得
  - 命名規則は別資料 `テストベッドネットワーク概要 v1.0.0` を参照のこと
  - テストベッド参加者は以下の5つのアプリケーションについて、事前にドメインを取得する必要がある
    - 利用者コネクタ
    - 利用者WebApp
    - 提供者コネクタ
    - 認可機能
    - 提供者カタログ
  - ドメイン取得の流れ
      - テストベッド参加者：各アプリケーションのドメインを命名する
      - テストベッド参加者：テストベッド運営者（＝ 東京大学越塚研究室）に対して、命名したドメインの登録を申請する
      - テストベッド運営者：テストベッドネットワーク用DNSサーバにて申請されたドメインを登録し、テストベッド参加者に通知
  - （参考）ホスト名の命名について
      - ホスト名を単に機能単位で命名すると、複数のCADDEユーザアカウントを申請・利用する場合、同一機能のアプリケーションが同一サイト内に複数構築されるため、ドメイン名が被ってしまう懸念がある
      - ホスト名にユーザ名の情報を含めておくと、各アプリケーションがどのユーザに利用されるかを分かりやすく識別できる
          - 例： `cadde-provider-test1.koshizukalab.dataspace.internal`
          - 上の例では”test1”の箇所がユーザ名に該当する
          - なお、CADDE認証機能上では、ユーザ名とサイト名を結合して単一のCADDEユーザIDとして管理することとする
              - 例： `test1.koshizukalab`
  - （参考）標準的な命名方法
      - 利用者コネクタ
          - `cadde-consumer-<username>.<sitename>.dataspace.internal`
      - 利用者WebApp
          - `cadde-webapp-<username>.<sitename>.dataspace.internal`
      - 提供者コネクタ
          - `cadde-provider-<username>.<sitename>.dataspace.internal`
      - 認可機能
          - `cadde-authz-<username>.<sitename>.dataspace.internal`
      - 提供者カタログ
          - `cadde-catalog-<username>.<sitename>.dataspace.internal`
- TLS証明書の取得
  - [certificate.md](./certificate.md)を参照
- データサーバの準備
  - public / private
- 横断検索サイト登録申請
  - 登録申請のタイミング or カタログサイト構築後


# CADDE参加者環境の構築
データ提供者環境は、[provider.md](./provider.md)に従って構築する。

データ利用者環境は、[consumer.md](./consumer.md)に従って構築する。


# CADDE参加者環境の動作確認
[operation_check.md](./operation_check.md)に従い、CADDE上のデータ検索・発見・共有プロセスの動作確認を行う。


# CADDEテストベッド用ドキュメント一覧

| ファイル | 概要 |
| :---------- | :---- |
| [provider.md](./provider.md) | データ提供者環境の構築手順 |
| [consumer.md](./consumer.md) | データ利用者環境の構築手順 |
| [operation_check.md](./operation_check.md) | CADDE参加者環境の動作確認手順 |
| [certificate.md](./certificate.md) | CADDEテストベッド用TLS証明書の取得方法 |
| [handson.md](./handson.md) | CADDEテストベッドハンズオン手順 |
