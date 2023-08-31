/* ----------------------------------------------------------------------------
server\api\pdf-template-upload.ts
---------------------------------------------------------------------------- */

// [nac]
import { ToString } from '@/components/nac/nac-main';
// [com]
import { PdfInfo } from '@/com/pdf-list';
// [server]
import { GetEnvConfigList, EnvConfig } from '@/server/lib/env-config';
import { PutObject } from '@/server/lib/bucket';
// ----------------------------------------------------------------------------
type ApiReq = {
  envCode: string;
  pdfInfo: PdfInfo;
  template: string;
};
// ----------------------------------------------------------------------------
const ct = `server > api > pdf-template-upload.ts`;
export default defineEventHandler(async (event) => {
  try {
    if (process.client && event.node.req.method !== 'post') {
      return false;
    }
    const apiReq: ApiReq = await readBody(event);
    const envCode = apiReq.envCode;
    const envConfigList = GetEnvConfigList();
    if (!(envCode in envConfigList)) {
      throw new Error('環境指定に問題があります。');
    }
    const envConfig: EnvConfig = (envConfigList as any)[envCode];
    const pdfInfo = apiReq.pdfInfo;
    const template = ToString(apiReq.template);
    // Templateの構造体ファイル
    const fileKey = pdfInfo.fileDir + pdfInfo.fileName + '.json';
    await PutObject(envConfig, fileKey, template, 'application/json');
    // リクエスト展開
    return true;
  } catch (err: any) {
    console.error(ct, err.message);
    return false;
  }
});
