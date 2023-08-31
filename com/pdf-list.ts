/* ----------------------------------------------------------------------------
com\pdf-list.ts
---------------------------------------------------------------------------- */

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
    displayName: 'PDFテスト用1',
  },
  {
    fileDir: 'pdf-template/',
    fileName: 'pdf-sample-2',
    displayName: 'PDFテスト用2',
  },
].sort((a, b) => {
  if (a.fileDir > b.fileDir) return 1;
  if (a.fileDir < b.fileDir) return -1;
  if (a.fileName > b.fileName) return 1;
  if (a.fileName < b.fileName) return -1;
  return 0;
});
