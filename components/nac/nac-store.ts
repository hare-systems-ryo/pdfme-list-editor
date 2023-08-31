/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/nac-store.ts

// ----------------------------------------------------------------------------

[使用方法]
  import { useStoreNac } from '@/components/nac/nac-main';
  const storeNac = useStoreNac();

---------------------------------------------------------------------------- */

// [ node_modules ]
import dayjs from 'dayjs';
import { defineStore } from 'pinia';
// [ lib ]
import { GenerateUniqeKey } from './lib/nac-func';
import { GetDataUrlByFileInput } from './lib/nac-func';
import { MultiLang } from './lib/nac-func';
// [ type ]
import { Toast } from './type/type-toast';
import { Dialog } from './type/type-dialog';
import { FileSelect } from './type/type-file-select';
import { WindowLoader } from './type/type-window-loader';
import { Signature } from './type/type-signature';
// ----------------------------------------------------------------------------
export interface StoreState {
  lang: 'ja' | 'en';
  state: {
    uid: string;
  };
  windowLoader: {
    state: {
      isShow: boolean;
      zindex: number;
    };
  };
  toast: {
    state: {
      id: number;
      pendingList: Toast.Message[];
      zindex: number;
    };
  };
  dialog: {
    state: {
      pendingList: {
        ts: string;
        data: Dialog.DialogItem;
      }[];
    };
  };
  fileSelect: {
    state: {
      pendingList: {
        ts: string;
        data: FileSelect.FileSelectItem;
      }[];
    };
  };
  signature: {
    state: {
      controlList: {
        controlId: string;
        control: Signature.SignatureControl;
      }[];
    };
  };
}
// ----------------------------------------------------------------------------
export const _useStoreNac = defineStore({
  id: 'storeNac',
  state: (): StoreState => {
    return {
      lang: 'ja',
      state: {
        uid: '',
      },
      windowLoader: {
        state: {
          isShow: false,
          zindex: 10000,
        },
      },
      toast: {
        state: {
          id: 0,
          pendingList: [],
          zindex: 10002,
        },
      },
      dialog: {
        state: {
          pendingList: [],
        },
      },
      fileSelect: {
        state: {
          pendingList: [],
        },
      },
      signature: {
        state: {
          controlList: [],
        },
      },
    };
  },
  // ----------------------------------------------------------------------------
  actions: {
    /**
     * WindowLoader
     *  @example
     *  const WindowLoader = storeNac.useWindowLoader();
     *  WindowLoader.Show();
     *  WindowLoader.Hide();
     */
    useWindowLoader(): WindowLoader.Controler {
      const state = this.windowLoader.state;
      return {
        Show: () => {
          state.isShow = true;
        },
        Hide: () => {
          state.isShow = false;
        },
      } as WindowLoader.Controler;
    },
    // ----------------
    toastShow(message: MultiLang, title: MultiLang, hideAfter: number, theme: Toast.Theme) {
      // toast.state.id++;
      const toast = this.toast;
      const newToast: Toast.Message = {
        key: GenerateUniqeKey() + `${toast.state.id}`,
        isShow: true,
        title: title,
        message: message,
        hideAfter: hideAfter,
        barWidth: 0,
        theme: theme,
      };
      toast.state.pendingList.push(newToast);
    },
    toastDeleteByKeyList(keyList: string[]) {
      const toast = this.toast;
      keyList.forEach((key) => {
        const count = toast.state.pendingList.length;
        for (let i = 0; i < count; i++) {
          if (toast.state.pendingList[i].key === key) {
            toast.state.pendingList.splice(i, 1);
            break;
          }
        }
      });
    },
    /**
     * Toast
     *  @example
     *  const Toast = storeNac.useToast();
     *  // 消える時間ミリ秒 、0 だと消えない 省略可能
     *  const time = 2500;
     *  Toast.Success('Success', 'title', time);
     *  Toast.Info('Info', 'title', time);
     *  Toast.Warning('Warning', 'title', time);
     *  Toast.Error('Error', 'title', time);
     */
    useToast(): Toast.Controler {
      const toastShow = this.toastShow;
      const controler: Toast.Controler = {
        Success: (message: MultiLang, title: MultiLang, hideAfter = 0) => {
          toastShow(message, title, hideAfter, Toast.Theme.Success);
        },
        Info: (message: MultiLang, title: MultiLang, hideAfter = 0) => {
          toastShow(message, title, hideAfter, Toast.Theme.Info);
        },
        Warning: (message: MultiLang, title: MultiLang, hideAfter = 0) => {
          toastShow(message, title, hideAfter, Toast.Theme.Warning);
        },
        Error: (message: MultiLang, title: MultiLang, hideAfter = 0) => {
          toastShow(message, title, hideAfter, Toast.Theme.Error);
        },
      };
      return controler;
    },
    // -----------------------------------------------------
    /**
     * Dialog
     *  @example
     *  const Dialog = storeNac.useDialog();
     *  // Dialog Option
     *  const option = Dialog.InitOption();
     *  option.themeHeaderBg = Dialog.Themes.main1;
     *  option.timeout = 3;
     *  option.btnCancel.isShow = true;
     *  option.btnCancel.title = '';
     *  option.btnCancel.theme = Dialog.Themes.white;
     *  option.btnLeft.isShow = true;
     *  option.btnLeft.title = 'No';
     *  option.btnLeft.theme = Dialog.Themes.error;
     *  option.btnRight.isShow = true;
     *  option.btnRight.title = 'OK';
     *  option.btnRight.theme = Dialog.Themes.main1;
     *  // Dialog ここで表示
     *  const ret = await Dialog.Show('message:testDialog1', 'title', option);
     *  // ret : Dialog.Result  >> 'left' | 'right' | 'cancel'
     */
    useDialog(): Dialog.Controler {
      const storeState = this.dialog.state;
      const getTs = (): string => {
        const ts = GenerateUniqeKey() + dayjs().format('x');
        if (storeState.pendingList.map((row) => row.ts).includes(ts)) {
          return getTs();
        }
        return ts;
      };
      const controler: Dialog.Controler = {
        InitOption: Dialog.InitOption,
        Themes: Dialog.Themes,
        Result: Dialog.Result,
        Show: async (message: MultiLang, title: MultiLang, option: Dialog.Option = Dialog.InitOption()) => {
          const item = new Dialog.DialogItem(message, title, option);
          const ts = getTs();
          storeState.pendingList.push({
            ts: ts,
            data: item,
          });
          const ret = await item.show();
          storeState.pendingList = storeState.pendingList.filter((row) => row.ts !== ts);
          return ret;
        },
      };
      return controler;
    },
    /**
     * FileSelect
     *  @example
     *  const FileSelect = storeNac.useFileSelect();
     *  const option = FileSelect.InitOption();
     *  option.fileAcceptList = [
     *    FileSelect.Accept.imageJpeg,
     *    FileSelect.Accept.imageJpg,
     *    FileSelect.Accept.imagePng,
     *  ];
     *  option.extRegExpList = [FileSelect.ExtRegExp.jpeg];
     *  option.multiple = false;
     *  const fileList = await FileSelect.Show(option);
     *  if (fileList === null || fileList.length !== 1) return;
     *  const dataUrl = await FileSelect.GetDataUrlByFileInput(fileList[0], {
     *    maxWidth: 3840,
     *    maxHeight: 2160,
     *  });
     *  importImageDataUrl.value = dataUrl;
     *  console.log('testFileSelect', fileList);
     */
    useFileSelect(): FileSelect.Controler {
      const storeState = this.fileSelect.state;
      const getTs = (): string => {
        const ts = GenerateUniqeKey() + dayjs().format('x');
        if (storeState.pendingList.map((row) => row.ts).includes(ts)) {
          return getTs();
        }
        return ts;
      };
      const control: FileSelect.Controler = {
        InitOption: FileSelect.InitOption,
        GetDataUrlByFileInput: GetDataUrlByFileInput,
        Accept: FileSelect.Accept,
        ExtRegExp: FileSelect.ExtRegExp,
        Show: async (option: FileSelect.Option = FileSelect.InitOption()) => {
          const item = new FileSelect.FileSelectItem(option);
          const ts = getTs();
          storeState.pendingList.push({
            ts: ts,
            data: item,
          });
          const ret = await item.show();
          setTimeout(() => {
            storeState.pendingList = storeState.pendingList.filter((row) => row.ts !== ts);
          }, 10);
          return ret;
        },
      };
      return control;
    },
  },
});
//
