/* ---------------------------------------------------------------------------------
  nuxt-app-components
  nac/type/type-dialog.ts
--------------------------------------------------------------------------------- */

import { Themes as _theme } from '../lib/nac-color-theme';
import { MultiLang } from '../nac-main';

export namespace Dialog {
  export const NamespaceName = 'Dialog';
  export const DefaultValue = {
    zindex: 3000,
  };

  export const Result = {
    left: 'left',
    right: 'right',
    cancel: 'cancel',
  } as const;
  export type Result = (typeof Result)[keyof typeof Result];

  export const Themes = _theme;
  export type Themes = _theme;

  /**
   * Option interface
   */
  export interface Option {
    zindex: number;
    themeHeaderBg: Themes;
    timeout: number;
    defaultBtn: 'left' | 'right' | 'cancel' | null;
    btnLeft: {
      isShow: boolean;
      title: MultiLang;
      theme: Themes;
    };
    btnRight: {
      isShow: boolean;
      title: MultiLang;
      theme: Themes;
    };
    btnCancel: {
      isShow: boolean;
      title: MultiLang;
      theme: Themes;
    };
  }

  /**
   * Option 初期化
   * Store経由で利用する
   */
  export const InitOption = (): Option => {
    return {
      zindex: 10001,
      themeHeaderBg: Themes.main1,
      timeout: 0,
      defaultBtn: 'right',
      btnLeft: {
        isShow: true,
        title: 'no',
        theme: Themes.dark,
      },
      btnRight: {
        isShow: true,
        title: 'Yes',
        theme: Themes.accent1,
      },
      btnCancel: {
        isShow: true,
        title: '',
        theme: Themes.white,
      },
    };
  };

  export interface DialogListItem {
    ts: string;
    data: Dialog.DialogItem;
  }

  export interface DialogItem {
    message: MultiLang;
    title: MultiLang;
    option: Dialog.Option;
    counter: number;
    timeout: boolean;
    show: () => Promise<Dialog.Result>;
    leftBtnClick: () => void;
    rightBtnClick: () => void;
    cancelBtnClick: () => void;
  }
  export class DialogItem {
    public message: MultiLang;
    public title: MultiLang;
    public option: Dialog.Option;
    public counter: number;
    public timeout: boolean;

    constructor(message: MultiLang, title: MultiLang, option: Dialog.Option = Dialog.InitOption()) {
      this.message = message;
      this.title = title;
      this.option = option;
      this.counter = -1;
      this.timeout = false;
    }

    public leftBtnClick = () => console.log();
    public rightBtnClick = () => console.log();
    public cancelBtnClick = () => console.log();
    public show = () => {
      return new Promise<Dialog.Result>((resolve, reject) => {
        this.leftBtnClick = () => {
          resolve(Dialog.Result.left);
        };
        this.rightBtnClick = () => {
          resolve(Dialog.Result.right);
        };
        this.cancelBtnClick = () => {
          resolve(Dialog.Result.cancel);
        };
      });
    };
  }

  export interface Controler {
    InitOption: typeof InitOption;
    Themes: typeof Dialog.Themes;
    Result: typeof Dialog.Result;
    Show: (message: MultiLang, title: MultiLang, option: Dialog.Option) => Promise<Dialog.Result>;
  }
}
