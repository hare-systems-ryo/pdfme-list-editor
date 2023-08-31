/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/lib/nac-func.ts
---------------------------------------------------------------------------- */
//  [node-modules]

import crypto from 'crypto';
import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';

// ----------------------------------------------------------------------------
// [ lib-func / 時間 ]

const convertms = (i: any) => {
  const a = String(i).split('.');
  if (a.length !== 2) {
    return i + '.000';
  } else {
    let ret = a[0];
    ret += '.';
    if (a[1].length === 1) {
      return ret + a[1] + '00';
    } else if (a[1].length === 2) {
      return ret + a[1] + '0';
    } else if (a[1].length === 3) {
      return ret + a[1];
    } else {
      return ret + a[1].slice(-3);
    }
  }
};

export class StopWatch {
  private hrstart: [number, number];
  constructor() {
    this.hrstart = process.hrtime();
  }

  public GetTime = (): string => {
    const hrend = process.hrtime(this.hrstart);
    const time = convertms(Math.floor((hrend[1] / 1000000) * 1000) / 1000);
    return ('___' + hrend[0] + 's').slice(-4) + '' + ('_________' + time).slice(-8);
  };
}

export const SetTime = () => {
  return process.hrtime();
};

export const GetTime = (start: [number, number]) => {
  const hrend = process.hrtime(start);
  const time = convertms(Math.floor((hrend[1] / 1000000) * 1000) / 1000);
  return ('___' + hrend[0] + 's').slice(-4) + '' + ('_________' + time).slice(-8);
};

/**
 * 一定時間処理を待機
 */
export const Sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

// [ lib-func / 未分類 ]

/**
 * マウント後に実行すること
 */
export const IsMobile = () => {
  if (navigator === undefined) return false;
  const userAgent = navigator.userAgent;
  if (
    userAgent.indexOf('iPhone') > 0 ||
    userAgent.indexOf('iPod') > 0 ||
    (userAgent.indexOf('Android') > 0 && userAgent.indexOf('Mobile') > 0)
  ) {
    return true;
  } else if (userAgent.indexOf('iPad') > 0 || userAgent.indexOf('Android') > 0) {
    return true;
  } else {
    return false;
  }
};

/**
 * ユニークな文字列を生成する
 */
export const GenerateUniqeKey = (len = 32): string => {
  const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const word = len < 14 ? 14 : len - 15;
  return (
    dayjs().format('YYYYMMDDHHmmssSSS') +
    '_' +
    Array.from(Array(word))
      .map(() => S[Math.floor(Math.random() * S.length)])
      .join('')
  );
};

/**
 * ユニークな文字列を生成する
 */
export const GenerateUUID = (): string => {
  return crypto.randomUUID();
};

// ----------------------------------------------------------------------------
// [ 多言語対応 ]

export type MultiLang = string | { [key: string]: string };
export const GetTextByMultiLang = (text: MultiLang, lang: string | undefined) => {
  // console.log(`GetTextByMultiLang = ${lang}`, text);
  if (lang === undefined) {
    lang = 'ja';
  }
  const isObject = (value: any) => {
    return value !== null && typeof value === 'object';
  };
  const textIsObject = isObject(text);
  if (textIsObject === true) {
    if (lang in (text as any)) {
      return (text as { [key: string]: string })[lang];
    } else {
      console.error(`言語定義エラー設定を見直してください。lang=${lang}`, text);
      return JSON.stringify(text);
    }
  } else {
    return String(text);
  }
};

export const JoinMultiLang = (list: MultiLang[], seq = '\n') => {
  const keys: string[] = ['ja', 'en'];
  list.forEach((row) => {
    if (typeOf(row) === 'object') {
      ObjectKeys(row as { [key: string]: string }).forEach((key) => {
        if (!keys.includes(key as string)) {
          keys.push(key as string);
        }
      });
    }
  });
  return list.reduce((sum, row) => {
    const ins = typeOf(row) === 'object' ? row : { ja: `${row}`, en: `${row}` };
    keys.forEach((key) => {
      if (!(key in sum)) {
        sum[key] = (ins as any)[key];
      } else if (sum[key].length === 0) {
        sum[key] += (ins as any)[key];
      } else {
        sum[key] += seq + (ins as any)[key];
      }
    });
    return sum;
  }, {} as any);
};

// ----------------------------------------------------------------------------
// [ Object関連 ]
/**
 * オブジェクトの比較用
 * @param a 比較オブジェクト
 * @param b 比較オブジェクト
 * @returns オブジェクトが異なる場合[ false ]を返す
 */
export const ObjectCompare = (a: any, b: any): boolean => {
  if (JSON.stringify(a) === JSON.stringify(b)) return true;
  const objectSort = (obj: any) => {
    if (obj === null) {
      return null;
    }
    // ソートする
    const sorted = Object.entries(obj).sort();
    for (const i in sorted) {
      const val = sorted[i][1];
      if (typeof val === 'object') {
        sorted[i][1] = objectSort(val);
      }
    }
    return sorted;
  };
  const aJSON = JSON.stringify(objectSort(a));
  const bJSON = JSON.stringify(objectSort(b));
  return aJSON === bJSON;
};

/**
 * オブジェクトをJSON経由でコピーします
 */
export const ObjectCopy = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * オブジェクトのキー配列を返します
 */
export const ObjectKeys = <T>(obj: T): (keyof T)[] => {
  return Object.keys(obj as any) as (keyof T)[];
};
/**
 * オブジェクトのキー配列を返します
 */
export const ObjectValues = <T>(obj: T): T[keyof T][] => {
  return Object.values(obj as any) as T[keyof T][];
};

/**
 * 配列の並び替え
 * @param baseList 並び替えをするリスト
 * @param idList 並び替えの基準となるリスト
 * @returns 並び替え結果
 */
export const ListIdSort = (baseList: { id: number; [key: string]: any }[], idList: number[]): number[] => {
  const listOk: number[] = [];
  const listNg: number[] = [];
  const tList: number[] = [];
  baseList.forEach((row: any) => tList.push(row.id));
  idList.forEach((row) => {
    if (tList.includes(row) === true) {
      listOk.push(row);
    } else {
      listNg.push(row);
    }
  });
  const ret: number[] = [];
  tList.forEach((id) => {
    if (listOk.includes(id) === true) {
      ret.push(id);
    }
  });
  listNg.forEach((id) => ret.push(id));
  return ret;
};

/**
 * オブジェクトの階層をフラットにします。
 */
export const FlatObj = (obj: any, prefix = ''): { [key: string]: any } => {
  const flattedObj: any = {};
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const preKey = prefix + key + '.';
      Object.assign(flattedObj, FlatObj(value, preKey));
    } else {
      const newKey = prefix + key;
      flattedObj[newKey] = value;
    }
  });
  return flattedObj;
};

// ----------------------------------------------------------------------------
// [ 変換 ]
const typeOf = (obj: any) => {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
};

/**
 * 数値をカンマを挿入した文字列に変換する
 * @param  num 数値
 * @returns カンマが挿入された文字列
 */
export const InsertComma = (num: number | string | null, digits = 0) => {
  if (num === null) {
    num = '0';
  }
  const numString = String(num).replace(/,/g, '');
  const delimitExp = /(\d)(?=(\d{3})+$)/g; //
  const decimalDelimitExp = /(\d)(?=(\d{3})+(\.\d+))/g; //
  let ret = '';
  if (numString.includes('.')) {
    ret = numString.replace(decimalDelimitExp, '$1,');
  } else {
    ret = numString.replace(delimitExp, '$1,');
  }
  if (digits === 0) return ret;
  const d = Int(numString) < 0 ? digits + 1 : digits;
  if (numString.includes('.')) {
    const m = ret.replace(/[0-9]+\./g, '');
    if (m.length < d) {
      ret = `${ret}${Array(d + 1 - m.length).join('0')}`;
    }
  } else {
    ret = `${ret}.${Array(digits + 1).join('0')}`;
  }
  return ret;
};
/**
 * 数値をカンマを挿入した文字列に変換する
 * @param  num 数値
 * @returns カンマが挿入された文字列
 */
export const InsertCommaK = (num: number | string | null) => {
  num = Int(num) * 100;
  num = InsertComma(num);
  return num.replace(/(.*)\d{2}$/, '$1');
};

export const ToString = (value: any): string => {
  try {
    if (value === null || value === undefined) return '';
    let text = '';
    switch (typeOf(value)) {
      case 'array':
      case 'object':
        text = '\n' + JSON.stringify(value, null, 2);
        break;
      default:
        text = `${value}`;
    }
    return text;
  } catch {
    return '';
  }
};

export const ToStringNullable = (value: any): string | null => {
  try {
    if (value === null || value === undefined) return null;
    let text = '';
    switch (typeOf(value)) {
      case 'array':
      case 'object':
        text = '\n' + JSON.stringify(value, null, 2);
        break;
      default:
        text = `${value}`;
    }
    return text;
  } catch {
    return '';
  }
};

/**
 * 指定した文字数にカットした文字を返却する
 * @param  text 対象の文字列
 * @param  len カットしたい文字数
 * @param  addWard 省略文字（省略した場合「...」）
 * @returns カンマが挿入された文字列
 */
export const CutLen = (text: string, len: number, addWard = '') => {
  if (text === null) return '';
  if (len === 0) return text;
  return text.substring(0, len) + addWard;
};

export const LenB = (str: string) => {
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    str[i].match(/[ -~]/) ? (len += 1) : (len += 2);
  }
  return len;
};

/**
 * 指定した文字数にカットした文字を返却する
 * @param  text 対象の文字列
 * @param  len カットしたい文字数(バイト計算)
 * @param  w 省略文字（省略した場合「...」）
 * @returns カンマが挿入された文字列
 */
export const CutLenB = (text: string, len: number, w: string | undefined = undefined) => {
  if (text === null) return '';
  if (len === 0) return '';
  w = w === undefined ? '...' : w;
  let tempStr = '';
  for (let i = 0; i < text.length; i++) {
    if (text[i].match(/[ -~]/)) {
      // 半角
      if (LenB(tempStr + w) + 1 > len) {
        break;
      }
    } else if (LenB(tempStr + w) + 2 > len) {
      // 全角
      break;
    }
    tempStr += text[i];
  }
  text = tempStr + w;
  return text;
};

/**
 * 指定した文字数にカットした文字を返却する
 * @param  text 対象の文字列
 * @param  len カットしたい文字数(バイト計算)
 * @param  w 埋める文字 半角で指定すること
 * @returns カンマが挿入された文字列
 */
export const PaddingLeft = (text: string | number | null, len: number, w: string, ryaku = ''): string => {
  text = text == null ? '' : String(text);
  const textlen = LenB(text);
  len = len - LenB(ryaku);
  if (textlen <= len) {
    return w.repeat(len - textlen) + text;
  } else {
    let str = '';
    for (let i = 0; i < text.length; i++) {
      if (text[text.length - i - 1].match(/[ -~]/)) {
        // 半角
        if (LenB(str) + 1 > len) {
          break;
        }
      } else if (LenB(str) + 2 > len) {
        // 全角
        break;
      }
      str = text[text.length - i - 1] + str;
    }
    text = str;
    return ryaku + w.repeat(len - LenB(text)) + text;
  }
};

/**
 * 指定した文字数にカットした文字を返却する
 * @param  text 対象の文字列
 * @param  len カットしたい文字数(バイト計算)
 * @param  w 埋める文字
 * @returns カンマが挿入された文字列
 */
export const PaddingRight = (text: string | number | null, len: number, w: string, ryaku = ''): string => {
  text = text == null ? '' : String(text);
  const textlen = LenB(text);
  len = len - LenB(ryaku);
  if (textlen <= len) {
    return text + w.repeat(len - textlen);
  } else {
    let str = '';
    for (let i = 0; i < text.length; i++) {
      if (text[i].match(/[ -~]/)) {
        // 半角
        if (LenB(str) + 1 > len) {
          break;
        }
      } else if (LenB(str) + 2 > len) {
        // 全角
        break;
      }
      str = str + text[i];
    }
    text = str;
    return text + w.repeat(len - LenB(text)) + ryaku;
  }
};

export const Int = (i: any): number => {
  try {
    const str = String(i).replace(/(\\|,|-$)/g, '');
    const num = parseInt(str, 10);
    if (isNaN(num)) {
      return 0;
    } else {
      return num;
    }
  } catch (error) {
    console.error(`Comvert.Int(${i})`, i, error);
    return 0;
  }
};

export const IntNullable = (i: any): number | null => {
  try {
    if (i === null) return null;
    if (i === '') return null;
    const str = String(i).replace(/(\\|,|-$)/g, '');
    const num = parseInt(str, 10);
    if (isNaN(num)) {
      return null;
    } else {
      return num;
    }
  } catch (error) {
    console.error(`IntNullable(${i})`, { i, error });
    return null;
  }
};

export const ArrayIntNullable = (list: any) => {
  //
  if (!(typeof list === 'object' && list !== null && Array.isArray(list))) {
    console.error('変換失敗 >> (number|null)[]', list);
    return [];
  }
  return list.map((row) => {
    return IntNullable(row);
  });
};
export const ArrayInt = <T = number[]>(list: T, length?: number | undefined) => {
  //
  if (!(typeof list === 'object' && list !== null && Array.isArray(list))) {
    console.error('変換失敗 >> (number|null)[]', list);
    return [] as T;
  }
  const ret = list
    .filter((row) => IntNullable(row) !== null)
    .map((row) => {
      return Int(row) as T;
    });
  if (ret.length !== list.length) {
    console.error('変換失敗 >> (number|null)[]', list);
    return [] as T;
  }
  if (length !== undefined && ret.length !== length) {
    console.error('変換失敗 >> (number|null)[]', list);
    return [] as T;
  }
  return ret as T;
};

export const ArrayString = (list: any) => {
  //
  if (!(typeof list === 'object' && list !== null && Array.isArray(list))) {
    console.error('変換失敗 >> (number|null)[]', list);
    return [];
  }
  return list
    .map((row) => {
      return String(row);
    })
    .filter((row) => row);
};

export const Float = (i: any, digits = 0): number => {
  try {
    const str = `${String(i).replace(/(\\|,|-$)/g, '')}`;
    const num = new BigNumber(str);
    if (isNaN(num.toNumber())) {
      return 0;
    } else {
      return num.dp(digits).toNumber();
    }
  } catch (error) {
    console.error(`Float(${i})`, { i, digits, error });
    return 0;
  }
};
export const FloatNullable = (i: any, digits = 0): number | null => {
  try {
    // console.log('hoge')
    if (i === null) return null;
    if (i === '') return null;
    BigNumber.config({
      ROUNDING_MODE: BigNumber.ROUND_DOWN, // 切り上げ
    });
    const str = `${String(i).replace(/(\\|,|-$)/g, '')}`;
    const num = new BigNumber(str);
    if (isNaN(num.toNumber())) {
      return null;
    } else {
      return num.dp(digits).toNumber();
    }
  } catch (error) {
    console.error(`FloatNullable(${i})`, { i, digits, error });
    return null;
  }
};

/**
 * 不確定な日付データをフォーマットされた日付に変換される
 * @param  date 文字列、日付オブジェクト
 * @returns 変換OKならmomentオブジェクト経由で指定したフォーマット、それ以外は空文字
 */
export const DayjsFormat = (date: string | null | Date, f = 'YYYY-MM-DD HH:mm:ss.SSS', nullText = ''): string => {
  try {
    if (date === null) return nullText;
    if (date === '') return nullText;
    if (/Date/.test(Object.prototype.toString.call(date)) === true) {
      return dayjs(date).format(f);
    }
    date = String(date).replace(/\//g, '-');
    if (dayjs(date).isValid() === false) {
      return nullText;
    }
    return dayjs(date).format(f);
  } catch {
    return nullText;
  }
};

/**
 * 不確定な日付データをフォーマットされた日付に変換される
 * @param  date 文字列、日付オブジェクト
 * @returns 変換OKならmomentオブジェクト経由で指定したフォーマット、それ以外は空文字
 */
export const DayjsFormatNullable = (date: string | null | Date, f = 'YYYY-MM-DD HH:mm:ss.SSS'): string | null => {
  try {
    if (date === null) return null;
    if (date === '') return null;
    if (/Date/.test(Object.prototype.toString.call(date)) === true) {
      return dayjs(date).format(f);
    }
    date = String(date).replace(/\//g, '-');
    if (dayjs(date).isValid() === false) {
      return null;
    }
    return dayjs(date).format(f);
  } catch {
    return null;
  }
};

export const Wareki = (
  yyyy: any,
  withoutUnit = false,
  nullText = '',
  len: number | undefined = undefined,
  lang = 'ja'
): string => {
  try {
    const unit = lang === 'ja' ? '年' : 'y';
    if (yyyy === undefined || yyyy == null) return nullText;
    yyyy = Int(yyyy);
    if (yyyy > 2019) {
      if (withoutUnit) {
        if (len === undefined) {
          return `R${String(yyyy - 2018)}`;
        } else {
          return `R${PaddingLeft(String(yyyy - 2018), len, '0')}`;
        }
      } else {
        return `R${String(yyyy - 2018)} (${String(yyyy)}${unit})`;
      }
    } else if (yyyy === 2019) {
      if (withoutUnit) {
        return `R1/H31`;
      } else {
        return `R1/H31 (${String(yyyy)}年)`;
      }
    } else if (yyyy > 1989) {
      if (withoutUnit) {
        if (len === undefined) {
          return `H${String(yyyy - 1988)}`;
        } else {
          return `H${PaddingLeft(String(yyyy - 1988), len, '0')}`;
        }
      } else {
        return `H${String(yyyy - 1988)} (${String(yyyy)}${unit})`;
      }
    } else if (yyyy === 1989) {
      if (withoutUnit) {
        return `H1/S64`;
      } else {
        return `H1/S64 (${String(yyyy)}${unit})`;
      }
    } else if (yyyy > 1926) {
      if (withoutUnit) {
        if (len === undefined) {
          return `S${String(yyyy - 1925)}`;
        } else {
          return `S${PaddingLeft(String(yyyy - 1925), len, '0')}`;
        }
      } else {
        return `S${String(yyyy - 1925)} (${String(yyyy)}${unit})`;
      }
    } else {
      return `${String(yyyy)}`;
    }
  } catch {
    return nullText;
  }
};

export const WarekiToYYYYMMDD = (wareki: string | null): number => {
  try {
    let YYYYMMDD = '';
    if (wareki === null || wareki === '') return 0;
    // 和暦→YYYY変換
    const arr = wareki.replace(/日/g, '').replace(/月/g, '-').replace(/年/g, '-').split('-');
    if (arr.length > 0) {
      if (/令和/.test(arr[0]) === true) {
        YYYYMMDD += String(Int(arr[0].replace(/令和/g, '')) + 2018);
      } else if (/平成/.test(arr[0]) === true) {
        YYYYMMDD += String(Int(arr[0].replace(/平成/g, '')) + 1988);
      } else if (/昭和/.test(arr[0]) === true) {
        YYYYMMDD += String(Int(arr[0].replace(/昭和/g, '')) + 1925);
      }
    }
    if (YYYYMMDD.length === 0) return 0;
    // 念の為桁数を揃える
    YYYYMMDD = ('0000' + YYYYMMDD).slice(-4);
    // 月日の変換
    for (let i = 1; i <= 2; i++) {
      if (arr.length > i && arr[i] !== '') {
        YYYYMMDD += ('00' + arr[i]).slice(-2);
      } else {
        YYYYMMDD += '00';
      }
    }
    // console.log('arr', arr);
    // console.log('変換後', wareki, YYYYMMDD);
    return Int(YYYYMMDD);
  } catch (error: any) {
    console.error(error);
    return 0;
  }
};

// ----------------------------------------------------------------------------
// [ データ変換 ※画像データ、ファイルデータなど ]

/**
 *  * Blobから文字列への変換
 */
export const ConvertBlobToString = (dat: any) => {
  return new Promise<string>((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(String(reader.result));
      };
      reader.onerror = () => {
        reject(new Error('ファイルの読み込みに失敗しました。'));
      };
      reader.readAsText(dat);
    } catch (error) {
      const errorMessage = `ConvertBlobToString:エラー\n${error}`;
      reject(errorMessage);
    }
  });
};

/**
 *  * BlobからArrayBufferへの変換
 */
export const ConvertBlobToArrayBuffer = (dat: any) => {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as ArrayBuffer);
      };
      reader.onerror = () => {
        reject(new Error('ファイルの読み込みに失敗しました。'));
      };
      reader.readAsArrayBuffer(dat);
    } catch (error) {
      const errorMessage = `ConvertBlobToString:エラー\n${error}`;
      reject(errorMessage);
    }
  });
};

/**
 * 画像サイズのリサイズ
 * @param arg.dataURL 画像のDataURL文字列
 * @param arg.maxWidth 最大幅 推奨1920 (単位はpx)
 * @param arg.maxHeight 最大高さ 推奨1920 (単位はpx)
 *
 * @example
 *    const dataURL = await ResizeDataUrlToDataUrl({
 *      dataURL: dataURL,
 *      maxWidth: 1920,
 *      maxHeight: 1920,
 *    });
 *    //なにか処理
 *  }
 * @throws {Exception} 例外の説明
 * 文字列をthrowします
 */
export const ResizeDataUrlToDataUrl = (arg: {
  dataURL: string;
  maxWidth: number;
  maxHeight: number;
}): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      let canvas;
      let ctx;
      try {
        let MaxWidth = arg.maxWidth;
        let MaxHeight = arg.maxHeight;
        if (image.width < MaxWidth) {
          MaxWidth = image.width;
        }
        if (image.height < MaxHeight) {
          MaxHeight = image.height;
        }
        let width;
        let height;
        if (image.width > image.height) {
          // 横長の画像は横のサイズを指定値にあわせる
          const ratio = image.height / image.width;
          width = MaxWidth;
          height = MaxWidth * ratio;
        } else {
          // 縦長の画像は縦のサイズを指定値にあわせる
          const ratio = image.width / image.height;
          width = MaxHeight * ratio;
          height = MaxHeight;
        }
        canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(image, 0, 0, width, height);
        }
        resolve(canvas.toDataURL('image/jpeg'));
      } catch (error) {
        reject(new Error(`ResizeDataUrlToDataUrl:エラー\n${error}`));
      } finally {
        canvas = null;
        ctx = null;
      }
    };
    image.onerror = (error) => {
      reject(String(error));
    };
    image.src = String(arg.dataURL);
  });
};

/**
 * ファイルオブジェクトから画像DataURLを取得する
 * @param arg.file Fileオブジェクト
 * @param arg.maxWidth 最大幅 推奨1920 (単位はpx)
 * @param arg.maxHeight 最大高さ 推奨1920 (単位はpx)
 *
 * @example
 *    const dataURL = await ComvertFileToImageDataURL({
 *      file: file,
 *      maxWidth: 1920,
 *      maxHeight: 1920,
 *    });
 *    //なにか処理
 *  }
 * @throws {Exception} 例外の説明
 * 文字列をthrowします
 */
export const ComvertFileToImageDataURL = async (arg: {
  file: File;
  maxWidth: number;
  maxHeight: number;
}): Promise<string> => {
  const file = arg.file;
  const maxWidth = arg.maxHeight;
  const maxHeight = arg.maxHeight;
  const originalDataURL = await ConvertBlobToDataUrl(file);
  return await ResizeDataUrlToDataUrl({ dataURL: originalDataURL, maxHeight: maxHeight, maxWidth: maxWidth });
};

/**
 *   Blob | File からDataUrlへの変換
 */
export const ConvertBlobToDataUrl = (data: Blob | File) => {
  return new Promise<string>((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(String(reader.result));
      };
      reader.onerror = (error) => {
        reject(new Error(`ファイルの読み込みに失敗しました。:エラー\n${error}`));
      };
      reader.readAsDataURL(data);
    } catch (error) {
      const errorMessage = `ConvertBlobToDataUrl:エラー\n${error}`;
      reject(errorMessage);
    }
  });
};

/**
 *  fileオブジェクトから最大画像サイズを指定してDataUrlを生成する
 */
export const GetDataUrlByFileInput = async (imgfile: File, option = { maxWidth: 1980, maxHeight: 1980 }) => {
  const dataUrl = await ConvertBlobToDataUrl(imgfile);
  if (dataUrl === null) return null;
  return await ConvertResizeDataUrl(dataUrl);
};

/**
 *   dataUrl から dataUrl への縮小変換
 */
export const ConvertResizeDataUrl = (dataUrl: string, option = { maxWidth: 1980, maxHeight: 1980 }) => {
  return new Promise<string | null>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        let MaxWidth = option.maxWidth; // 1980;
        let MaxHeight = option.maxHeight; // 1980;
        if (image.width < MaxWidth) {
          MaxWidth = image.width;
        }
        if (image.height < MaxHeight) {
          MaxHeight = image.height;
        }
        let width;
        let height;
        if (image.width > image.height) {
          // 横長の画像は横のサイズを指定値にあわせる
          const ratio = image.height / image.width;
          width = MaxWidth;
          height = MaxWidth * ratio;
        } else {
          // 縦長の画像は縦のサイズを指定値にあわせる
          const ratio = image.width / image.height;
          width = MaxHeight * ratio;
          height = MaxHeight;
        }
        let canvas: HTMLCanvasElement = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        if (ctx) {
          ctx.drawImage(image, 0, 0, width, height);
        }
        resolve(canvas.toDataURL('image/jpeg'));
        ctx = null;
        (canvas as any) = null;
      } catch (error) {
        reject(error);
      }
    };
    image.src = String(dataUrl);
  });
};
