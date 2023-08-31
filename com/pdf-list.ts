/* ----------------------------------------------------------------------------
com\pdf-list.ts
---------------------------------------------------------------------------- */

import { GenerateUUID } from '@/components/nac/nac-main';

export type Pdf = {
  key: '';
};

export type AppListRow = {
  appName: string;
  env: {
    backetName: string;
    env: 'production' | 'staging' | 'development';
  }[];
  pdf: {
    pdfFileKey: string;
    templateFileKey: string;
  }[];
};
export type PdfList = AppListRow[];

export const PdfList: PdfList = [
  {
    // id: 'inspireApps',
    appName: 'INSPIRE APPS',
    env: [
      {
        backetName: 'inspire-app-dev-ryo',
        env: 'development',
      },
      {
        backetName: 'inspire-app-staging',
        env: 'staging',
      },
      {
        backetName: 'inspire-app-production',
        env: 'production',
      },
    ],
    pdf: [
      {
        // name: 'サンプル',
        pdfFileKey: 'pdf-template/pdf-sample.pdf',
        templateFileKey: 'pdf-template/pdf-sample.json',
      },
    ],
  },
  {
    // id: 'test',
    appName: 'test',
    env: [
      {
        backetName: 'inspire-app-dev-ryo',
        env: 'development',
      },
    ],
    pdf: [
      {
        // name: '',
        pdfFileKey: 'pdf-template/pdf-sample.pdf',
        templateFileKey: 'pdf-template/pdf-sample.json',
      },
    ],
  },
];

export type PdfInfo = {
  // ファイルを保管しているディレクトリ /で終わる
  fileDir: string;
  /**
   * ファイル名（拡張子除く.json）
   */
  fileName: string;
  /**
   * ファイル表示名 エディタで選択中に表示するテキスト
   */
  displayName: string;
};

export const PdfInfoList: PdfInfo[] = [
  {
    fileDir: 'pdf-template/',
    fileName: 'pdf-sample-1',
    displayName: 'pdf-sample-1',
  },
  {
    fileDir: 'pdf-template/',
    fileName: 'pdf-sample-2',
    displayName: 'pdf-sample-1',
  },
];
