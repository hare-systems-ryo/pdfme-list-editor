/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/nac-main.ts
// ----------------------------------------------------------------------------

[使用方法]
  import {  } from '@/components/nac/nac-main';

---------------------------------------------------------------------------- */
// [ nac-store ]
import { _useStoreNac } from './nac-store';
// [ type ]
export { Dialog } from './type/type-dialog';
export { Toast } from './type/type-toast';
export { FileSelect } from './type/type-file-select';
export { WindowLoader } from './type/type-window-loader';
export type { SelectItem, SelectItemOrigin } from './type/type-select';
export { Signature } from './type/type-signature';
export { TypeTabulator } from './type/type-tabulator';
export { DragList } from './type/type-drag-list';

// [ lib ]
export { Themes } from './lib/nac-color-theme';
export { InitModalControl, InitModals } from './lib/nac-modal-control';
export type { ModalControl } from './lib/nac-modal-control';

// [ lib-func / 時間 ]
export { Sleep, SetTime, GetTime, StopWatch } from './lib/nac-func';
// [ lib-func / 未分類 ]
export { IsMobile } from './lib/nac-func';
export { GenerateUniqeKey } from './lib/nac-func';
export { GenerateUUID } from './lib/nac-func';

// [ lib-func / 多言語対応 ]
export type { MultiLang } from './lib/nac-func';
export { GetTextByMultiLang } from './lib/nac-func';
export { JoinMultiLang } from './lib/nac-func';
// [ lib-func / Object関連 ]
export { ObjectCompare } from './lib/nac-func';
export { ObjectCopy } from './lib/nac-func';
export { ObjectValues } from './lib/nac-func';
export { ObjectKeys } from './lib/nac-func';
export { ListIdSort } from './lib/nac-func';
export { FlatObj } from './lib/nac-func';

// [ lib-func / 変換 ]
export { InsertComma } from './lib/nac-func';
export { InsertCommaK } from './lib/nac-func';
export { ToString } from './lib/nac-func';
export { ToStringNullable } from './lib/nac-func';
export { CutLen } from './lib/nac-func';
export { CutLenB } from './lib/nac-func';
export { PaddingLeft } from './lib/nac-func';
export { PaddingRight } from './lib/nac-func';

export { Int } from './lib/nac-func';
export { IntNullable } from './lib/nac-func';
export { ArrayIntNullable } from './lib/nac-func';
export { ArrayInt } from './lib/nac-func';
export { ArrayString } from './lib/nac-func';

export { Float } from './lib/nac-func';
export { FloatNullable } from './lib/nac-func';
export { DayjsFormat } from './lib/nac-func';
export { DayjsFormatNullable } from './lib/nac-func';
export { Wareki } from './lib/nac-func';
export { WarekiToYYYYMMDD } from './lib/nac-func';

// [ lib-func / データ変換 ※画像データ、ファイルデータなど ]
export { ConvertBlobToString } from './lib/nac-func';
export { ConvertBlobToArrayBuffer } from './lib/nac-func';
export { ComvertFileToImageDataURL } from './lib/nac-func';
export { ConvertBlobToDataUrl } from './lib/nac-func';
export { ConvertResizeDataUrl } from './lib/nac-func';
export { GetDataUrlByFileInput } from './lib/nac-func';
export { ResizeDataUrlToDataUrl } from './lib/nac-func';

export const useStoreNac = _useStoreNac;
export type useStoreNac = typeof _useStoreNac;
