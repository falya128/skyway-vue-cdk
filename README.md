# SkyWay Vue CDK

## 概要

SkyWay の認証・認可機能で用いられるSkyWay Auth Tokenを発行するためのAWS CDKプロジェクトです。  

SkyWay Auth Tokenの詳細な内容についてはこちらをご参照ください。  
https://skyway.ntt.com/ja/docs/user-guide/authentication/

また、本プロジェクトは別リポジトリのVueプロジェクトと併せてご利用ください。  
https://github.com/falya128/skyway-vue

## 開始手順

### 各種ライブラリのインストール

```powershell
cd skyway-vue-cdk
npm install

cd skyway-vue-cdk/lambda_layer/nodejs
npm install
```

### 環境設定

```powershell
cp .env.example .env
```

以下の箇所を変更
```
SKYWAY_APP_ID=[SkyWay 管理コンソールから取得したアプリケーションID]
SKYWAY_SECRET_KEY=[SkyWay 管理コンソールから取得したシークレットキー]
```

### デプロイ

```powershell
cdk deploy
```
