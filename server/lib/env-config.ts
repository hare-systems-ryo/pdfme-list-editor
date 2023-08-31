/* ----------------------------------------------------------------------------
server\lib\config.ts
---------------------------------------------------------------------------- */

import { ObjectKeys } from '@/components/nac/nac-main';
// ----------------------------------------------------------------------------
export type EnvConfig = {
  NAME: string;
  ENV: 'production' | 'staging' | 'development' | '';
  S3_ENDPOINT: string;
  S3_REGION: string;
  S3_BUCKET_NAME: string;
  S3_ACCESS_KEY: string;
  S3_SECRET_KEY: string;
};
export const baseKeys = [
  //
  'NAME',
  'ENV',
  'S3_ENDPOINT',
  'S3_REGION',
  'S3_BUCKET_NAME',
  'S3_ACCESS_KEY',
  'S3_SECRET_KEY',
] as const;

export type EnvConfigList = {
  [key: string]: EnvConfig;
};
/**
 * 環境変数から必要な変数を取得して管理しやすいオブジェクトを生成する
 */
export const GetEnvConfigList = (): EnvConfigList => {
  const env = process.env as any;
  const envKeys = ObjectKeys(env)
    .filter((key) => {
      return /ENV\d/.test(key as any as string);
    })
    .sort() as string[];
  // ENV環境の指定されている数をIndex配列にする
  const indexList: string[] = envKeys.reduce((sum, keyName) => {
    const i = String(keyName).replace(/^ENV(\d).*/, '$1');
    if (!sum.includes(i)) sum.push(i);
    return sum;
  }, [] as string[]);
  const envList: EnvConfigList = {};
  const error: string[] = [];
  indexList.forEach((index) => {
    const prefix = `ENV${index}`;
    envList[prefix] = {
      NAME: '',
      ENV: '',
      S3_ENDPOINT: '',
      S3_REGION: '',
      S3_BUCKET_NAME: '',
      S3_ACCESS_KEY: '',
      S3_SECRET_KEY: '',
    };
    baseKeys.forEach((key) => {
      const targetKeyName = `${prefix}_${key}`;
      if (targetKeyName in env) {
        (envList[prefix] as any)[key] = env[targetKeyName];
      } else {
        error.push(`.envに[${targetKeyName}]を設定してください`);
      }
    });
  });
  if (error.length > 0) {
    throw new Error(error.join('\n'));
  }
  return envList;
};
