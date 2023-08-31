/* ---------------------------------------------------------------------------------
  nuxt-app-components
  nac/type/type-toast.ts
--------------------------------------------------------------------------------- */
import { MultiLang } from '../lib/nac-func';
export namespace Toast {
  export const NamespaceName = 'Toast';
  export const Theme = {
    Success: 'success',
    Info: 'info',
    Warning: 'warning',
    Error: 'error',
  } as const;
  export type Theme = (typeof Theme)[keyof typeof Theme];

  export interface Message {
    key: string;
    title: MultiLang;
    message: MultiLang;
    isShow: boolean;
    hideAfter: number;
    barWidth: number;
    theme: Theme;
  }

  export interface Controler {
    Success: (message: MultiLang, title: MultiLang, hideAfter?: number) => void;
    Info: (message: MultiLang, title: MultiLang, hideAfter?: number) => void;
    Warning: (message: MultiLang, title: MultiLang, hideAfter?: number) => void;
    Error: (message: MultiLang, title: MultiLang, hideAfter?: number) => void;
  }
}
