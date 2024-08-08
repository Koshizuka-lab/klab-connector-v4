# CADDEテストベッド参加用資料
本資料は、データスペース技術国際テストベッド(以下、ITDT)上に構築される、CADDEテストベッドへの参加時に必要となる準備事項・環境構築手順を示すものである。

本ディレクトリに含まれる資料は、CADDE公式の技術仕様を参考としつつ、説明の都合上、一部を省略・追加するなどの改変を行っているものである。<br/>
したがって、本テストベッド用資料群に記載された内容が公式の技術仕様と一部異なる場合があることを予めご了承ください。<br/>
CADDE公式の詳細な技術仕様については、[CADDE-sip/documentのリポジトリ](https://github.com/CADDE-sip/documents)から確認できる。


# CADDEテストベッド参加のための事前準備

## CADDEテストベッド利用情報の取得
CADDEテストベッドの利用開始にあたって、各参加者は以下のCADDEテストベッド利用情報をテストベッド運用者（東京大学）から受け取る。

- CADDEユーザアカウント
  - CADDEユーザID
  - 初期パスワード
- CADDEアプリケーションのクライアント情報
  - クライアントID
  - クライアントシークレット
- CADDE支援サービスの情報
  - 認証機能
  - 横断検索機能
  - 来歴管理機能

上記のCADDEテストベッド利用情報を基に、各参加者はデータ利用者・データ提供者環境の構築やCADDE利用を行う。


### CADDEユーザアカウント
テストベッド参加者に対して、3つのCADDEユーザアカウント（ID・パスワード）が最初に発行される。

CADDEユーザとは、CADDEを利用する個人または組織に対応し、CADDEユーザIDを用いて一意に識別される主体である。
CADDEユーザはデータ利用者・データ提供者のどちらとしても振る舞うことができ、データ利用者環境・データ提供者環境はCADDEユーザごとに構築される。

CADDEユーザIDはデータ利用者の認証や、データ共有の依頼先となるデータ提供者の識別などに用いられる。

CADDEテストベッドにおいて、CADDEユーザIDは以下の規則で採番されるものとする。
- `<serial number（4桁）>-<sitename>`
  - serial number：各組織（site）ごとに連番で増加する4桁の値
  - 例：`0001-koshizukalab`

また、CADDEユーザアカウントの発行時にはランダム生成された初期パスワードが割り当てられるため、後述するアカウントコンソールにアクセスして適宜パスワードを変更するようにする。

[アカウントコンソール画面]


### クライアント情報
ユーザアカウントの発行と同時に、データ利用者環境・データ提供者環境に構築される以下のアプリケーションそれぞれのクライアント情報（ID・シークレット）も発行される。
なお、これらのアプリケーションは各CADDEユーザごとに構築されるため、クライアント情報はユーザアカウントの数だけ発行されることとなる。

- データ利用者環境
  - 利用者コネクタ
  - 利用者WebApp
- データ提供者環境
  - 認可機能

クライアントIDはCADDE認証機能がアプリケーションを一意に識別するための識別子であり、例えば認証トークンの発行・検証などの際に用いられる。

CADDEテストベッドにおいて、クライアントIDは以下の規則で採番されるものとする。
- `<app name>-<CADDE UserID>`
  - app name：CADDEを構成するアプリケーション名
    - 利用者コネクタ：`consumer`
    - 利用者WebApp：`webapp`
    - 提供者コネクタ：`provider`
    - 認可機能：`authz`
  - CADDE UserID：クライアントに対応するアプリーションを構築・利用するCADDEユーザのID
  - 例：`consumer-0001-koshizukalab`


### CADDE支援サービスの情報
CADDE支援サービスとは、CADDE運用者が管理し、CADDE参加者が共通で利用する機能のことである。

CADDEテストベッドの利用に際し、各参加者は以下のCADDE支援サービスに関する情報を受け取る。

- 認証機能
  - ユーザアカウントコンソールのURL
    - https://cadde-authn.koshizukalab.dataspace.internal:18443/keycloak/realms/authentication/account
  - 認証用CADDE APIのベースURL
    - https://cadde-authn.koshizukalab.dataspace.internal:18443/cadde/api/v4
  - 認証用Keycloak APIのベースURL
    - https://cadde-authn.koshizukalab.dataspace.internal:18443/keycloak
- 横断検索機能
  - 横断検索サイトURL
    - http://cadde-federated-catalog.koshizukalab.dataspace.internal:23000
  - 横断検索用APIのベースURL
    - http://cadde-federated-catalog.koshizukalab.dataspace.internal:25000/api/package_search
- 来歴管理機能
  - 来歴管理機能APIのベースURL
    - http://cadde-provenance-management.koshizukalab.dataspace.internal:3000/v2



## CADDEテストベッド参加者環境のドメイン登録
各テストベッド参加者は、自らが利用するCADDEユーザごとに以下5つのアプリケーションのドメイン名を事前に登録する必要がある。

1. 利用者コネクタ
1. 利用者WebApp
1. 提供者コネクタ
1. 認可機能
1. 提供者カタログサイト

ただし、データ利用者環境のみ・もしくはデータ提供者環境のみを構築するなど、上記アプリケーションすべてを構築・利用するのでなければ、ドメイン名の登録対象となるアプリケーションを限定して登録申請を行うことも可能である。

また、テストベッド参加者は最初に3つのユーザアカウントを割り当てられるが、それらすべてについてドメイン名を登録する必要はない。
すなわち、割り当てられた3つのユーザアカウントのうち、1つのアカウントしか利用しないのであれば、当該アカウントが利用するアプリケーションのみに関するドメイン名の登録を申請すればよい。

ドメイン登録の流れを以下に示す。
1. テストベッド参加者：自らの環境で利用するアプリケーションのドメイン名を決定する
1. テストベッド参加者：テストベッド運用者（＝東京大学）に対して、決定したドメイン名の登録を申請する
1. テストベッド運用者：テストベッドネットワーク用DNSサーバにて申請されたドメイン名を登録し、テストベッド参加者に通知する

<!-- TODO：動線となるフォームを記述 -->
<!-- TODO：横断検索サイト登録申請 -->


### （参考）ドメインの命名方法
別資料`テストベッドネットワーク概要.pdf`において、テストベッドネットワークにおけるドメインの命名規則は以下のように定められている。
> - `<name>.<sitename>.dataspace.internal`
>   - sitenameには各社サブネット固有の名前を割り当て
>   - nameには機能単位で固有の名前を割り当て

ここで、複数のCADDEユーザアカウントを申請・利用する場合を考えると、各アプリケーションのドメイン名を単に機能単位で命名すれば、同一機能のアプリケーションが同一サイト内に複数構築され、異なるアプリケーションのドメイン名が重複してしまうことが懸念される。

そのため、CADDEテストベッドでは、ホスト名にユーザIDの情報を含めることを推奨する。

具体的には、`<serial number（4桁）>-<sitename>`というIDを持つCADDEユーザ（[CADDEユーザIDの採番規則を参照](#caddeユーザアカウント)）であれば、以下のようにドメイン名を設定する。
- `cadde-<app name>-<serial number>.<sitename>.dataspace.internal`
  - CADDEユーザIDのserial numberを利用する

以下に、東京大学越塚研究室サイト（`koshizukalab`）に属するCADDEユーザ（`0001-koshizukalab`）が構築・利用するアプリケーションのドメイン名の例を示す。
- 利用者コネクタ
  - `cadde-consumer-0001.koshizukalab.dataspace.internal`
- 利用者WebApp
  - `cadde-webapp-0001.koshizukalab.dataspace.internal`
- 提供者コネクタ
  - `cadde-provider-0001.koshizukalab.dataspace.internal`
- 認可機能
  - `cadde-authz-0001.koshizukalab.dataspace.internal`
- 提供者カタログサイト
  - `cadde-catalog-0001.koshizukalab.dataspace.internal`



## CADDEテストベッド用TLS証明書の取得
CADDEテストベッド参加者は、自ら構築・利用するアプリケーションに配置するTLS証明書を事前に取得する必要がある。

本テストベッドはVPN上に構築されるため、テストベッド上のすべてのアプリケーションのTLSサーバ証明書は、テストベッド運用者（東京大学）が管理するテストベッド用プライベート認証局から発行されることとしている。

また、本テストベッドではTLS証明書の準備を簡単にするため、テストベッドネットワークに参加する組織ごとにワイルドカード証明書（マルチドメイン証明書）を利用することとしている。

TLS証明書を取得するための詳細な手順は[certificate.md](./certificate.md)で確認できる。

<!-- TODO：動線となるフォームを記述 -->
<!-- TODO: データサーバの準備は前提に含めるか -->


# CADDE参加者環境の構築
## データ提供者
データ提供者環境は以下3つのアプリケーションで構成される。
- 提供者カタログサイト
- 認可機能
- 提供者コネクタ

上記アプリケーションの構築完了後、データ提供者はCADDE上でデータ提供を行うために以下の設定を行う必要がある。
- データカタログの作成
- 認可の設定
- 提供者コネクタとデータサーバの接続

以上の環境構築および設定の詳しい手順は[provider.md](./provider.md)を参照する。

## データ利用者
データ利用者環境は以下2つのアプリケーションで構成される。
- 利用者コネクタ
- 利用者WebApp

上記アプリケーションの詳しい構築手順は[consumer.md](./consumer.md)を参照する。


# CADDE参加者環境の動作確認
[operation_check.md](./operation_check.md)に従い、CADDE上のデータ検索・発見・共有プロセスの動作確認を行う。


# CADDEテストベッド用ドキュメント一覧
| ファイル | 概要 |
| :---------- | :---- |
| [provider.md](./provider.md) | データ提供者環境の構築手順 |
| [consumer.md](./consumer.md) | データ利用者環境の構築手順 |
| [certificate.md](./certificate.md) | CADDEテストベッド用TLS証明書の取得方法 |
| [handson.md](./handson.md) | CADDEテストベッドハンズオン手順 |
<!-- | [operation_check.md](./operation_check.md) | CADDE参加者環境の動作確認手順 | -->
