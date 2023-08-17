# 検証環境
- macOS Ventura 13.4
- Docker 24.0.5
- git 2.40.1
- OpenSSL 3.1.2 1 Aug 2023 (Library: OpenSSL 3.1.2 1 Aug 2023)


# 前提条件
- 認証機能で以下のIDやシークレットが事前に採番されていること
	- CADDEユーザID
		- user, org, aal
	- コネクタのクライアントID・シークレット
- 以下が事前にインストールされていること
	- Docker
	- [Docker Compose CLI](https://github.com/docker/compose-cli)
	- git
- Linux 上での動作が前提
- 提供データサイズ: サポートするデータサイズは以下
  - コンテキスト情報：１ MB 以下
  - ファイル：100MB 以下

# ドキュメント
| ファイル | 概要 |
| :---------- | :---- |
| [install.md](./install.md) | 利用者コネクタ・提供者コネクタ・認可機能の構築マニュアル |
| [usage.md](./usage.md) | コネクタや認可機能を介したCADDE 4.0の使用例 |

