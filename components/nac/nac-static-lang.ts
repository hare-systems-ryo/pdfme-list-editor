//  ------------------------------------------------

export const NacStaticLangCom = {
  systemError: { ja: 'システムエラー', en: 'System Error!' },
} as const;

export const NacStaticLangVfc = {
  requireText: { ja: '必須', en: 'Require' },
  warnTitle: { ja: '入力値の警告', en: 'Check your input value.' },
} as const;
export const NacStaticLangCheckList = {
  display: {
    notExsitError: { ja: '選択された値が選択肢に含まれません。', en: 'Not included in the choices.' },
  },
} as const;

export const NacStaticLangDatePicker = {
  error: {
    outObInputRangeTitle: { ja: '入力値エラー', en: 'Input Value Errors.' },

    outObInputRangeMessage: { ja: '入力範囲外です', en: 'Out of input range.' },
  },
} as const;

export const NacStaticLangSelect = {
  props: {
    nullText: { ja: '[未選択]', en: 'Please Select.' },
  },
  display: {
    error: { ja: 'エラー', en: 'Error!' },
    nullableError: { ja: '必須項目です', en: 'Required Fields! Please Select!' },
    notExsitError: { ja: '選択された値が選択肢に含まれません。', en: 'Not included in the choices.' },
    deletedItemSelectToastMessage: { ja: '別の選択肢を選んでください。', en: 'Choose another option.' },
    deletedItemSelectToastTitle: { ja: '削除済み選択肢', en: 'deleted option' },
    validError: {
      ja: '{placeholder}のListにID重複が見られます。',
      en: 'ID duplication is found in List {placeholder}',
    },
  },
  item: {
    hiddenItemShow: { ja: '非表示項目を表示', en: 'Show hidden items' },
    hiddenItemHide: { ja: '非表示項目を隠す', en: 'Hide hidden items' },
  },
} as const;

export const NacStaticLangSignature = {
  pageUnitSelect: {
    ja: ' {value}件表示',
    en: '{value}',
  },
} as const;

export const NacStaticLangTextarea = {
  props: {
    maxRowsUnit: { ja: '行', en: 'Row' },
  },
} as const;

export const NacStaticLangToggleSwitch = {
  props: {
    leftLabel: { ja: 'OFF', en: 'OFF' },
    rightLabel: { ja: 'ON', en: 'ON' },
  },
} as const;
export const NacStaticLangToggleValuebox = {
  validErrorTitle: {
    ja: '入力値の警告',
    en: 'Input Value Errors',
  },
  validErrorNullValue: {
    ja: 'nullは許可されていません。',
    en: 'null is not allowed.',
  },
  validErrorMinValue: {
    ja: '[{value}]以下の数値は入力できません',
    en: 'No value less than {value} can be entered.',
  },
  validErrorMaxValue: {
    ja: '[{value}]以上の数値は入力できません',
    en: 'No value greater than {value} can be entered.',
  },
} as const;

export const NacStaticLangTableHeader = {
  pageUnitSelect: {
    ja: ' {value}件表示',
    en: '{value}',
  },
  resultDisplay: {
    ja: '検索結果',
    en: 'Result.',
  },
  resultDisplayFilter: {
    ja: '(絞り込み)',
    en: ' has filter',
  },
  displayCountUnit: {
    ja: '件',
    en: '.',
  },
  displayCount: {
    ja: '表示数',
    en: 'Page Size.',
  },
  sumPage: {
    ja: '合計 {value} ページ',
    en: 'Total {value} pages.',
  },
  spPagePrevious: {
    ja: '前ページ',
    en: 'Prev Page.',
  },
  spPageNext: {
    ja: '次ページ',
    en: 'Next Page.',
  },
} as const;

// ------------------------------------------------------
