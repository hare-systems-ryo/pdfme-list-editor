

# PDFME List Editor

## 概要

PDFMEにリスト形式での編集機能を付与したものです。  
自分がPDFMEの運用を楽にしたいだけなやつ・・・・

ただ・・・それだけ。



## 概要

下記環境で運用を想定しています。

* Nuxt実行環境はローカルDev環境想定
* テンプレートファイルの保管場所は「AWS S3互換のWasabi」
  * ※AWSのSDKを使用しています※エンドポイントをWasabiにしているだけ
    * なので.envファイルのエンドポイント設定をブランクにするとAWSにたぶん繋がります。
* PDFの編集部分とPDFのテンプレートなどの取得系は分けてますのでそれぞれの実行環境に合わせて修正してください。

## 必要なこと



## 環境変数

とりあえず環境変数はストレージの接続先を「0～9」まで１０個設定できるようにしている。


```sh:.env
# ENV1** ～  ENV9** まで設定できます

# ENV1_ENV = 'production' | 'staging' | 'development';
# ENV1_S3_ENDPOINT="https://s3.ap-northeast-1.wasabisys.com"   # Wasabi
# ENV1_S3_ENDPOINT=""                                          # AWS S3

# production
ENV1_NAME="本番環境"
ENV1_ENV="production"
ENV1_S3_ENDPOINT="https://s3.ap-northeast-1.wasabisys.com"
ENV1_S3_REGION="ap-northeast-1"
ENV1_S3_BUCKET_NAME="hoge-app-production"
ENV1_S3_ACCESS_KEY=""
ENV1_S3_SECRET_KEY=""

# staging
ENV2_NAME="検証環境"
ENV2_ENV="staging"
ENV2_S3_ENDPOINT="https://s3.ap-northeast-1.wasabisys.com"
ENV2_S3_REGION="ap-northeast-1"
ENV2_S3_BUCKET_NAME="hoge-app-staging"
ENV2_S3_ACCESS_KEY=""
ENV2_S3_SECRET_KEY=""

# development
ENV3_NAME="ローカルRyo用"
ENV3_ENV="development"
ENV3_S3_ENDPOINT="https://s3.ap-northeast-1.wasabisys.com"
ENV3_S3_REGION="ap-northeast-1"
ENV3_S3_BUCKET_NAME="hoge-app-development"
ENV3_S3_ACCESS_KEY=""
ENV3_S3_SECRET_KEY=""

```

# PDFME 本家さん

PDFMEについてはこちら
https://github.com/pdfme/pdfme



