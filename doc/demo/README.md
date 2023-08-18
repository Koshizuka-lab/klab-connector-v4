# 前提条件

- 認証機能で以下のIDやシークレットが事前に採番されていること
	- CADDEユーザID・パスワード
	- CADDEユーザ属性（`user`, `org`, `aal`）
		- user: ユーザ名
		- org: 組織名
		- aal: 認証レベル
	- 利用者コネクタのクライアントID・シークレット
	- 提供者コネクタのクライアントID・シークレット
	- 提供者認可機能のクライアントID・シークレット

- 以下が事前にインストールされていること
	- Docker: 20.10.1以上（参考: [CADDEドキュメント](../../README.md#前提条件)）
	- [Docker Compose CLI](https://github.com/docker/compose-cli)
	- git
	- OpenSSL: 1.1.1以上
- Linux 上での動作が前提（参考: [CADDEドキュメント](../../README.md#前提条件)）
- 提供データサイズ: サポートするデータサイズは以下（参考: [CADDEドキュメント](../../README.md#前提条件)）
  - コンテキスト情報：1MB 以下
  - ファイル：100MB 以下

# ドキュメント
| ファイル | 概要 |
| :---------- | :---- |
| [install.md](./install.md) | 利用者コネクタ・提供者コネクタ・認可機能の構築マニュアル |
| [usage.md](./usage.md) | コネクタや認可機能を介したCADDE 4.0の使用例 |
| [certificate.md](./certificate.md) | OpenSSLを用いた秘密鍵・サーバ証明書の作成手順 |


# ドキュメント作成時の検証環境
- macOS Ventura 13.4
- Docker 24.0.5 (Docker for Mac)
- Docker Compose CLI 2.20.2
- git 2.40.1
- OpenSSL 3.1.2
