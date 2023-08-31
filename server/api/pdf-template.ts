/* ----------------------------------------------------------------------------
server\api\pdf-template.ts
---------------------------------------------------------------------------- */

// [com]
import type { PdfTemplate } from '@/com/pdf-designer';
import { InitPdfTemplate } from '@/com/pdf-designer';
import { PdfInfo } from '@/com/pdf-list';
// [server]
import { GetEnvConfigList, EnvConfig } from '@/server/lib/env-config';
import { GetObjectToString, ListObject, PutObject } from '@/server/lib/bucket';
// ----------------------------------------------------------------------------
type ApiReq = {
  envCode: string;
  pdfInfo: PdfInfo;
};
type ApiRes = {
  template: PdfTemplate | null;
};
// ----------------------------------------------------------------------------
const ct = `server > api > pdf-template.ts`;
export default defineEventHandler(async (event) => {
  const ret: ApiRes = {
    template: null,
  };
  try {
    const apiReq: ApiReq = await readBody(event);
    const envCode = apiReq.envCode;
    const envConfigList = GetEnvConfigList();
    if (!(envCode in envConfigList)) {
      throw new Error('環境指定に問題があります。');
    }
    const envConfig: EnvConfig = (envConfigList as any)[envCode];
    const pdfInfo = apiReq.pdfInfo;
    ret.template = InitPdfTemplate({ fileName: pdfInfo.fileName });
    // Templateの構造体ファイル
    const fileKey = pdfInfo.fileDir + pdfInfo.fileName + '.json';
    const templateFileInfo = await ListObject(envConfig, fileKey);
    if (templateFileInfo.Contents === undefined || templateFileInfo.Contents.length === 0) {
      // ファイルなし
      await PutObject(envConfig, fileKey, JSON.stringify(ret.template), 'application/json');
    } else {
      // ファイルあり
      const jsontext = await GetObjectToString(envConfig, fileKey);
      ret.template = JSON.parse(jsontext) as PdfTemplate;
    }
    return ret;
  } catch (err: any) {
    console.error(ct, err);
    return ret;
  }
});
