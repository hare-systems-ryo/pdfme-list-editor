/* ----------------------------------------------------------------------------
server\utils\bucket.ts
---------------------------------------------------------------------------- */

import { Readable } from 'stream';

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsCommand,
  ListObjectsCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { EnvConfig } from '@/server/lib/env-config';

const useS3 = (config: EnvConfig) => {
  const S3ClientConfig: any = {
    region: String(config.S3_REGION),
    credentials: {
      accessKeyId: String(config.S3_ACCESS_KEY),
      secretAccessKey: String(config.S3_SECRET_KEY),
    },
  };
  const endpoint = String(config.S3_ENDPOINT);
  if (endpoint) {
    S3ClientConfig.endpoint = endpoint;
  }
  return new S3Client(S3ClientConfig);
};

const DataUrlToArrayBuffer = async (dataUrl: string) => {
  const ret = await fetch(dataUrl);
  return await ret.arrayBuffer();
};

const streamToString = (stream: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: any = [];
    stream.on('data', (chunk: any) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
};
const streamToBuffer = (stream: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: any = [];
    stream.on('data', (chunk: any) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
};

/**
 * ファイル情報を取得する
 */
export const ListObject = async (config: EnvConfig, fileKey: string) => {
  const client = useS3(config);
  const input = {
    Bucket: config.S3_BUCKET_NAME,
    Prefix: fileKey,
  };
  const command = new ListObjectsCommand(input);
  const listRes: ListObjectsCommandOutput = await client.send(command);
  // IncLog.Info('putObject s3Params=', ret);
  client.destroy();
  return listRes;
};

export const GetObject = async (config: EnvConfig, fileKey: string) => {
  const client = useS3(config);
  const input = {
    Bucket: config.S3_BUCKET_NAME,
    Key: fileKey,
  };
  const command = new GetObjectCommand(input);
  const data = await client.send(command);
  if (!(data.Body instanceof Readable)) {
    return null;
  }
  client.destroy();
  return data;
};

export const GetObjectToString = async (config: EnvConfig, fileKey: string) => {
  const client = useS3(config);
  const input = {
    Bucket: config.S3_BUCKET_NAME,
    Key: fileKey,
  };
  const command = new GetObjectCommand(input);
  const data = await client.send(command);
  const bodyContents = await streamToString(data.Body);
  client.destroy();
  return bodyContents;
};

export const GetObjectToBuffer = async (config: EnvConfig, fileKey: string) => {
  const client = useS3(config);
  const input = {
    Bucket: config.S3_BUCKET_NAME,
    Key: fileKey,
  };
  const command = new GetObjectCommand(input);
  const data = await client.send(command);
  const bodyContents = await streamToBuffer(data.Body);
  client.destroy();
  return bodyContents;
};

/**
 * アップロード
 */
export const PutObject = async (
  config: EnvConfig,
  fileKey: string,
  file: string | ArrayBuffer,
  contentType?: string
) => {
  // S3 キー名の禁止文字除外
  // S3 キー名の非推奨文字除外
  const safeKey = fileKey
    .replace(/[&$@=;: +,?]/, '')
    .replace(/[\\^`><{}\][#%~|]/, '')
    .replace(/\/\//, '/');
  if (safeKey !== fileKey) {
    throw new Error('Key Name Error');
  }
  const input: any = {
    Bucket: config.S3_BUCKET_NAME,
    Key: fileKey,
    Body: file,
    ContentType: contentType,
  };
  const client = useS3(config);
  const command = new PutObjectCommand(input);
  const ret = await client.send(command);
  client.destroy();
  return ret;
};

/**
 * ファイル削除
 */
export const DeleteObject = async (config: EnvConfig, fileKey: string) => {
  const client = useS3(config);
  const input = {
    Bucket: config.S3_BUCKET_NAME,
    Key: fileKey,
  };
  const command = new DeleteObjectCommand(input);
  await client.send(command);
  client.destroy();
};

/**
 * DataUrlでアップロード
 */
export const UploadFileByDataUrl = async (
  config: EnvConfig,
  fileKey: string,
  dataUrl: string,
  contentType?: string
) => {
  const buffer = await DataUrlToArrayBuffer(dataUrl);
  const ret = await PutObject(config, fileKey, buffer, contentType);
};
export const PutObjectByDataUrl = UploadFileByDataUrl;

/**
 * ファイルアップロード用の証明書付きURLを発行する。
 */
export const PutObjectPresignedUrl = async (config: EnvConfig, key: string) => {
  const client = useS3(config);
  const input = {
    Bucket: config.S3_BUCKET_NAME,
    Key: key,
  };
  const command = new PutObjectCommand(input);
  const ret = await getSignedUrl(client, command, { expiresIn: 3600 });
  client.destroy();
  return ret;
};

/**
 * ファイル取得用の証明書付きURLを発行する。
 */
export const GetObjectPresignedUrl = async (config: EnvConfig, key: string) => {
  const client = useS3(config);
  const input = {
    Bucket: config.S3_BUCKET_NAME,
    Key: key,
  };
  const command = new GetObjectCommand(input);
  const ret = await getSignedUrl(client, command, { expiresIn: 3600 });
  client.destroy();
  return ret;
  // 使い方こんな感じ
  // const presignedUrl = await GetObjectPresignedUrl(fileKey);
  // return sendRedirect(event, presignedUrl, 302);
};
