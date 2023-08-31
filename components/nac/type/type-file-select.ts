/* ---------------------------------------------------------------------------------
  nuxt-app-components
  nac/type/type-file-select.ts
--------------------------------------------------------------------------------- */

import { GetDataUrlByFileInput } from '../lib/nac-func';

export namespace FileSelect {
  export const NamespaceName = 'FileSelect';
  /**
   * 選択したファイルの拡張子チェック用
   * 個別に自由に設定してもOK
   * @typedef {Object} ExtRegExp
   */
  export const ExtRegExp = {
    png: /\.png$/,
    jpeg: /\.jpg$|\.jpeg$/,
    gif: /\.gif$/,
    pdf: /\.pdf$/,
    csv: /\.csv$/,
    text: /\.txt$|\.text$/,
    json: /\.json$/,
  } as const;
  export type ExtRegExp = (typeof ExtRegExp)[keyof typeof ExtRegExp];

  /**
   * Acceptの参考例
   * 個別に自由に設定してもOK
   * @typedef {Object} Accept
   */
  export const Accept = {
    imageAll: 'image/*',
    imagePng: '.png',
    imageJpeg: '.jpeg',
    imageJpg: '.jpg',
    imageGif: '.gif',
    // audioAll: 'audio/*',
    // audioMp3: 'audio/mpeg',
    // videoAll: 'video/*',
    // videoMpeg: 'video/mpeg',
    // videoMp4: 'video/mp4',
    pdf: 'application/pdf',
    textAll: 'text/*',
    textPlain: 'text/plain',
    textCsv: '.csv',
    json: '.json',
  } as const;
  export type Accept = (typeof Accept)[keyof typeof Accept];

  /**
   * ファイル選択モーダル表示のときの引数
   */
  export interface Option {
    /**
     * ファイル選択ダイアログのファイル指定文字列
     * - 個別に自由に設定してもOK
     * - FileSelect.Accept から選んでもOK
     */
    fileAcceptList: (Accept | string)[];
    /**
     * 選択したファイルの拡張子チェック
     * - 個別に自由に設定してもOK
     * - FileSelect.ExtRegExp から選んでもOK
     */
    extRegExpList: (ExtRegExp | RegExp)[];
    multiple: boolean;
  }

  export const InitOption = (): Option => {
    return {
      fileAcceptList: [FileSelect.Accept.imageJpeg, FileSelect.Accept.imageJpg],
      extRegExpList: [FileSelect.ExtRegExp.jpeg],
      multiple: false,
    };
  };
  const initializationError = 'initialization error';

  export class FileSelectItem {
    public option: Option;
    constructor(option: Option = InitOption()) {
      this.option = option;
    }

    public completed = (data: File[] | null) => console.error(initializationError);
    public error = (message: string) => console.error(initializationError);
    public show = () => {
      return new Promise<File[] | null>((resolve, reject) => {
        try {
          this.completed = (data: File[] | null) => {
            // console.log('complete ', data);
            resolve(data);
          };
          this.error = (message: string) => {
            console.error('FileSelectItem > Show error', message);
            reject(message);
          };
        } catch (error) {
          console.error('FileSelectItem > Show', error);
          reject(error);
        }
      });
    };
  }

  export interface Controler {
    InitOption: typeof InitOption;
    GetDataUrlByFileInput: typeof GetDataUrlByFileInput;
    Accept: typeof Accept;
    ExtRegExp: typeof ExtRegExp;
    Show: (option: FileSelect.Option) => Promise<File[] | null>;
  }
}
