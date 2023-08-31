import { Sleep } from '../nac-main';
import { Int } from '../nac-main';
export namespace TypeTabulator {
  /**
   * セル内部にボタンを配置した時用
   */
  export const cellMouseOut = (e: any, column: any) => {
    const elm = e.target as any;
    // テーブル自体が補足されてoverlayが複数取得できる場合がありえる
    const overlays = elm.querySelectorAll('span.overlay');
    Array.from(overlays).forEach((child: any) => {
      child.classList.remove('flash');
    });
  };

  /**
   * セル内部にボタンを配置した時用
   */
  export const cellMouseUp = (e: any, column: any) => {
    const elm = e.target as any;
    const overlays = elm.querySelectorAll('span.overlay');
    Array.from(overlays).forEach((child: any) => {
      child.classList.remove('flash');
    });
  };

  /**
   * セル内部にボタンを配置した時用
   */
  export const cellMouseDown = (e: any, column: any) => {
    const elm = e.target as any;
    if (elm.classList.contains('table-cell-btn') === true) {
      const offsetX = e.offsetX;
      const offsetY = e.offsetY;
      const width = Int(elm.clientWidth) + 20;
      const overlays = elm.querySelectorAll('span.overlay');
      Array.from(overlays).forEach((child: any) => {
        child.style.top = `${-width + offsetY}px`;
        child.style.left = `${-width + offsetX}px`;
        child.style.width = `${width * 2}px`;
        child.style.height = `${width * 2}px`;
        child.classList.add('flash');
        setTimeout(() => child.classList.remove('flash'), 10000);
      });
    }
  };

  export interface SortItem<T> {
    key: T;
    order: 1 | -1;
  }

  export const ColumnsPropsDisplay = {
    headerSort: false,
    download: false,
  };
  export const ColumnsDisplay = (field: string | undefined = undefined, width: number | undefined = undefined) => {
    return {
      headerSort: false,
      download: false,
      field: field,
      width: width === undefined ? undefined : String(width),
    };
  };

  export const InitEmitFunc = () => {
    return {
      tableExcelDownload: async () => {
        console.error('初期化が完了していませんんんんん');
        await Sleep(1);
      },
      tableReBuild: () => {
        console.error('初期化が完了していません');
      },
      tableRedraw: () => {
        console.error('初期化が完了していません');
      },
      tableRefresh: () => {
        console.error('初期化が完了していません');
      },
    };
  };

  export const Option = (option?: any) => {
    return {
      locale: 'ja',
      langs: {
        ja: {
          columns: {},
          data: {
            loading: 'Loading', // data loader text
            error: 'Error', // data error text
          },
          groups: {
            item: 'item', // the singular  for item
            items: 'items', // the plural for items
          },
          pagination: {
            page_size: '表示件数',
            page_title: 'Show Page',
            first: '', // text for the first page button
            first_title: '最初のページ', // tooltip text for the first page button
            last: '',
            last_title: '最後のページ',
            prev: '',
            prev_title: 'Prev Page',
            next: '',
            next_title: 'Next Page',
            all: 'All',
            counter: {
              showing: 'Showing',
              of: 'of',
              rows: 'rows',
              pages: 'pages',
            },
          },
        },
        en: {
          columns: {},
          data: {
            loading: 'Loading', // data loader text
            error: 'Error', // data error text
          },
          groups: {
            item: 'item', // the singular  for item
            items: 'items', // the plural for items
          },
          pagination: {
            page_size: 'Page Size ',
            page_title: 'Show Page',
            first: '', // text for the first page button
            first_title: 'First', // tooltip text for the first page button
            last: '',
            last_title: 'Last',
            prev: '',
            prev_title: 'Prev ',
            next: '',
            next_title: 'Next',
            all: 'All',
            counter: {
              showing: 'Showing',
              of: 'of',
              rows: 'rows',
              pages: 'pages',
            },
          },
        },
      },
      layout: 'fitColumns',
      downloadConfig: {
        columnHeaders: true, // do not include column headers in downloaded table
        columnGroups: false, // do not include column groups in column headers for downloaded table
        rowGroups: false, // do not include row groups in downloaded table
        columnCalcs: false, // do not include column calcs in downloaded table
        dataTree: false, // do not include data tree in downloaded table
      },
      // pagination: true,
      // paginationSize: 20,
      // paginationSizeSelector: [20, 50, 100],
      // clipboard: true,
      ...option,
    };
  };
}
