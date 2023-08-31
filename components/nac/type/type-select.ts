/* ---------------------------------------------------------------------------------
  nuxt-app-components
  nac/type/type-select.ts
--------------------------------------------------------------------------------- */

import { MultiLang } from '../lib/nac-func';

export interface SelectItem {
  readonly id: number;
  /**
   * 多言語の場合は多言語のオブジェクトをセットする
   */
  readonly text: MultiLang;
  /**
   * 多言語の場合は多言語のオブジェクトをセットする
   */
  readonly note?: MultiLang;
  /**
   * 画像用URL
   */
  imgUrl?: string;
  /**
   * 非表示 : true =非表示、ただし選択要素は表示する
   */
  isHidden?: boolean;
  /**
   * 削除非表示 : true = 非表示、ただし選択要素は表示する
   */
  isDeleted?: boolean;
  /**
   * 太字設定 || true 太字
   */
  isBold?: boolean;
  /**
   * 表示順 未実装、事前に並び替えすること
   */
  order?: number;
}

export interface SelectItemOrigin {
  readonly id: number | null;
  /**
   * 多言語の場合は多言語のオブジェクトをセットする
   */
  readonly text: MultiLang;
  /**
   * 多言語の場合は多言語のオブジェクトをセットする
   */
  readonly note?: MultiLang;
  /**
   * 多言語の場合は多言語のオブジェクトをセットする
   */
  // text: string | { [key: string]: string };
  /**
   * 画像用URL
   */
  imgUrl: string | null;
  /**
   * 非表示 : true =非表示、ただし選択要素は表示する
   */
  isHidden: boolean;
  /**
   * 削除非表示 : true = 非表示、ただし選択要素は表示する
   */
  isDeleted: boolean;
  /**
   * 太字設定 || true 太字
   */
  isBold: boolean;
  isControl: boolean;
}
