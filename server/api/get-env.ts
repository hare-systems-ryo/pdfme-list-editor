/* ----------------------------------------------------------------------------
server\api\get-env.ts
---------------------------------------------------------------------------- */

import { GetEnvConfigList } from '@/server/lib/env-config';
import { ObjectKeys } from '@/components/nac/nac-main';

/**
 * 本家のEnvConfigからいらない情報を削除したもの
 */
type EnvConfigMini = {
  EnvCode: string;
  NAME: string;
  ENV: 'production' | 'staging' | 'development' | '';
  S3_BUCKET_NAME: string;
};
type ApiRes = {
  [key: string]: EnvConfigMini;
};
// ----------------------------------------------------------------------------
const ct = `server > api > get-env.ts`;

export default defineEventHandler((event) => {
  const ret: ApiRes = {};
  try {
    const envConfigList = GetEnvConfigList();
    const envkeys = ObjectKeys(envConfigList) as string[];
    envkeys.forEach((envkey) => {
      const { NAME, ENV, S3_BUCKET_NAME } = envConfigList[envkey];
      if (ENV !== '') {
        ret[envkey] = { EnvCode: envkey, NAME, ENV, S3_BUCKET_NAME };
      } else {
        throw new Error('ENVが正しく設定されていません。');
      }
    });
    console.log(ct, 'Completed');
    return ret;
  } catch (err: any) {
    console.error(ct, err.message);
    return ret;
  }
});
