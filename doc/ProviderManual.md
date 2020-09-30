
# 提供者環境構築ガイド
提供者サーバ環境として事前に準備する必要がある項目について下記に記載します。

### 1. 提供者用データ管理サーバ(FTPサーバ or HTTPサーバ or NGSIサーバ)
事前にFTPサーバ or HTTPサーバ or NGSIサーバが起動していること。
各サーバにデータが登録されていることが前提。

### 2. 詳細検索用カタログサイト(CKAN)
 詳細検索用カタログサイトには、提供者コネクタ経由で取得可能なすべてのカタログ詳細情報を登録します。
 各カタログ設定項目についての詳細については、(参考1) SIPデータカタログ項目仕様参照のこと。

### 3. 横断検索用カタログサイト(CKAN)
 横断検索用カタログサイトには、横断検索サーバに公開可能なカタログ情報を登録します。
 各提供者の横断検索用カタログサイトのカタログ情報は、横断検索サーバに横断検索用カタログサイトアクセスURLを設定することにより、定期的に収集されます。<br>
 
(1) CADDE内限定データのカタログ項目<br>
　提供者コネクタ経由で詳細カタログ検索、データ取得可能とするために、横断検索用カタログサイトのカタログに下記項目設定が必須です。
- 提供者ID (extras:caddec_provider_id) 事前に払い出された提供者IDを設定。
- 詳細検索用データセットID (extras:caddec_dataset_id_for_detail) 横断検索用カタログと対になる詳細検索用カタログのデータセットIDを設定。
- リソース提供手段の識別子 (resources:caddec_resource_type): HTTPサーバの場合:file/http, FTPサーバの場合:file/ftp, NGSIサーバの場合:api/ngsi を設定。
- コネクタ利用の要否 (resources:caddec_contract_required): requiredを設定

(2) オープンデータのカタログ項目<br>
　提供者コネクタ経由で詳細カタログ検索、データ取得しないオープンデータの場合、横断カタログサイトのカタログに下記項目設定は不要です。
- 提供者ID (extras:caddec_provider_id) : カタログ項目を設定しない。
- 詳細検索用データセットID (extras:caddec_dataset_id_for_detail) : カタログ項目を設定しない。
- リソース提供手段の識別子 (resources:caddec_resource_type): カタログ項目を設定しない。
- コネクタ利用の要否 (resources:caddec_contract_required): notRequired または requiredを設定


# (参考1) SIPデータカタログ項目仕様
横断検索用カタログサイト、詳細検索用カタログサイトに登録するカタログ仕様の詳細については、下記を参照してください。
- [SIPデータカタログ項目仕様Version1.0(2020年9月14日).xlsx](catalog/SIPデータカタログ項目仕様Version1.0(2020年9月14日).xlsx)
