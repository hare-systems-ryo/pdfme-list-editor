<script setup lang="ts">
/* ----------------------------------------------------------------------------
components\pdf-designer.vue
 ---------------------------------------------------------------------------- */

// [ node_modules ]
import { Designer } from '@pdfme/ui';

// [ vueuse ]
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';
// [nac]
import { Sleep } from '@/components/nac/nac-main';
import { ObjectCompare, ObjectCopy } from '@/components/nac/nac-main';
// [com]
import type { PdfTemplate } from '@/com/pdf-designer';
import { InitPdfTemplate } from '@/com/pdf-designer';
import { SetTemplateTypeSafe } from '@/com/pdf-designer';
import { PropFunc } from '@/com/pdf-designer';
import { GetFont } from '@/com/pdf-designer';

// ----------------------------------------------------------------------------
// [nac]
const storeNac = useStoreNac();
const Toast = storeNac.useToast();
// ----------------------------------------------------------------------------

// [ Props ]
interface Props {
  func: PropFunc;
  fileName: string;
}
const props = defineProps<Props>();

// [ emit ]
type Emits = {
  (e: 'update:func', func: PropFunc): void;
  (e: 'close'): void;
  (e: 'update:hoge', value: string): void;
  (e: 'hasChange', value: boolean): void;
};
const emit = defineEmits<Emits>();
// ----------------------------------------------------------------------------
// [ reactive ]

/**
 * reactive
 */
const state = reactive<{
  designer: Designer | null;
  autoSync: boolean;
  // font: 'ipag' | 'ipagp';
  designerOption: {
    font: any;
    lang: 'en' | 'ja';
  };
  data: PdfTemplate;
  diff: PdfTemplate;
  // 更新ループ対策
  beforeData: PdfTemplate;
}>({
  designer: null,
  autoSync: true,
  // font: 'ipag',
  designerOption: {
    font: null,
    lang: 'ja',
  },
  data: InitPdfTemplate(),
  diff: InitPdfTemplate(),
  beforeData: InitPdfTemplate(),
});

/**
 * データ更新の有無
 */
const hasChange = computed(() => {
  return !ObjectCompare(state.data, state.diff);
});

watch(hasChange, () => {
  emit('hasChange', hasChange.value);
});
emit('hasChange', hasChange.value);
// ----------------------------------------------------------------------------
// [ Designer ]

/**
 * Designer Element
 */
const pdfDesiner = ref<HTMLElement | null>(null);

/**
 * Designer
 */
const generateDesigner = async () => {
  // 初期化用フォントが取得完了していない場合があるためこちらでも取得処理を実行
  if (state.designerOption.font === null) {
    state.designerOption.font = await GetFont();
  }
  if (pdfDesiner.value === null) {
    state.designer = null;
    throw new Error('Designer用のHTML Elementが捕捉できませんでした');
  }
  await designerDestroy();
  await nextTick();
  state.designer = new Designer({
    domContainer: pdfDesiner.value,
    template: state.data,
    options: state.designerOption,
  });
  (state.designer as any).onChangeTemplateCallback = onChangeTemplateCallback;
  updateGeneratorTemplate(state.data);
};

const designerDestroy = async () => {
  if (state.designer !== null) {
    state.designer.destroy();
    state.designer = null;
    await nextTick();
  }
};

// ----------------------------------------------------------------------------
// [ スキーマ関係 ]

/**
 * デザイナー側からのテンプレート変更イベント
 */
const onChangeTemplateCallback = (template: PdfTemplate) => {
  //   console.log('onChangeTemplateCallback', template.schemas);
  if (state.autoSync === false) return;
  state.data = ObjectCopy(template);
  // resetTargetList();
  setTimeout(() => {
    if (!ObjectCompare(template.schemas, state.beforeData.schemas)) {
      resetSchemas();
    }
  }, 200);
};

const resetSchemas = () => {
  console.log('resetSchemas', state.data);
  if (state.data.schemas.length === 0) return;
  const data = ObjectCopy(state.data);
  data.columns = data.columns === undefined ? [] : data.columns;
  data.sampledata = data.sampledata === undefined ? [{}] : data.sampledata;
  data.list.forEach((row) => {
    row.targetList.forEach((targetName) => {
      // 各リスト親要素の処理
      if (Object.keys(data.schemas[0]).includes(targetName) === false) {
        throw new Error('リストの基準要素が見つかりません。');
      }
      const base = ObjectCopy(data.schemas[0][targetName]);
      const sampledata = (data.sampledata as any)[0][targetName];
      // 既存該当要素の削除
      const schemasKeysList = Object.keys(data.schemas[0]);
      schemasKeysList.forEach((schemasKey) => {
        if (schemasKey.replace(/\d{1,}$/, '') === targetName.replace(/\d{1,}$/, '')) {
          delete data.schemas[0][schemasKey];
        }
      });
      data.columns = (data.columns as string[]).filter((columnKey) => {
        if (columnKey.replace(/\d{1,}$/, '') === targetName.replace(/\d{1,}$/, '')) {
          return false;
        } else {
          return true;
        }
      });
      Object.keys((data.sampledata as { [x: string]: string }[])[0]).forEach((sampleDataKey) => {
        if (sampleDataKey.replace(/\d{1,}$/, '') === targetName.replace(/\d{1,}$/, '')) {
          delete (data.sampledata as { [x: string]: string }[])[0][sampleDataKey];
        }
      });
      // ここで生成する
      for (let i = 0; i < row.count; i++) {
        const name = targetName.replace(/\d{1,}$/, String(i));
        const insertObj = ObjectCopy(base);
        // console.log('copy Name', name, insertObj);
        insertObj.position.y = base.position.y + row.span * i;
        data.schemas[0][name] = insertObj;
        (data.columns as any).push(name);
        (data.sampledata as any)[0][name] = sampledata;
      }
    });
  });
  updateGeneratorTemplate(data, false);
};

/**
 * デザイナーを [ 引数:template ] で再描画
 */
const updateGeneratorTemplate = (template: PdfTemplate, force = false) => {
  if (!ObjectCompare(template, state.beforeData) || force === true) {
    state.beforeData = ObjectCopy(template);
    if (state.designer !== null) {
      state.designer.updateTemplate(ObjectCopy(template));
    }
  }
};

/**
 *  要素のうちListに含まれるもの
 */
const selectedItemList = computed<string[]>(() => {
  const selectedTargetList: string[] = [];
  state.data.list.forEach((row) => {
    selectedTargetList.push(...row.targetList);
  });
  return selectedTargetList;
});

/**
 * List管理していないschema要素のリスト
 * - List管理化できる要素の名称に指定がある
 * - 名称ルール：「数値以外＋0」となっていること
 */
const unSelectedItemList = computed<{ id: number; text: string }[]>(() => {
  if (state.data.schemas.length === 0) return [];
  const list: { id: number; text: string }[] = [];
  const excludeList = selectedItemList.value;
  Object.keys(state.data.schemas[0]).forEach((key, index) => {
    if (/[^0-9０-９]0$/.test(key) && !excludeList.includes(key)) {
      list.push({ id: index, text: key });
    }
  });
  return list.sort((a, b) => {
    if (a.text > b.text) {
      return 1;
    } else if (a.text < b.text) {
      return -1;
    }
    return 0;
  });
});

/**
 *  リスト追加の選択肢の値捕捉用
 */
const setlectedText = ref('');
/**
 *  リスト追加の選択肢の値捕捉用
 */
const setlectedValue = ref(null);

/**
 *  リスト管理要素の初期値
 */
const InitListItem = (): PdfTemplate['list'][0] => {
  return {
    targetList: [],
    span: 10,
    count: 1,
  };
};
/**
 *  リスト管理要素の追加
 */
const addListItem = () => {
  state.data.list.push(InitListItem());
  updateGeneratorTemplate(state.data, true);
};

/**
 *  リスト項目に特定の予想を追加する
 */
const targetListAdd = (row: PdfTemplate['list'][0]) => {
  const value = setlectedValue.value;
  const name = setlectedText.value;
  if (value === null) return;
  setlectedValue.value = null;
  const list = ObjectCopy(row.targetList);
  list.push(name);
  row.targetList = list.sort();
  resetSchemas();
};

/**
 *  リスト項目の特定の予想を削除する
 */
const targetListItemRemove = (row: PdfTemplate['list'][0], name: string) => {
  row.targetList = row.targetList.filter((key) => {
    if (key === name) {
      return false;
    } else {
      return true;
    }
  });
  // 既存該当要素の削除
  const schemasKeysList = Object.keys(state.data.schemas[0]);
  schemasKeysList.forEach((schemasKey) => {
    if (schemasKey !== name && schemasKey.replace(/\d{1,}$/, '') === name.replace(/\d{1,}$/, '')) {
      delete state.data.schemas[0][schemasKey];
    }
  });
  resetSchemas();
};

// ----------------------------------------------------------------------------
// [ ファイルレベルでの変更差し替え操作 ]

/**
 *  BasePDFの差し替え
 */
const changeBasePDF = async () => {
  //   const { basePdf, ...template } = ObjectCopy(state.data);
  //   console.log(template);
  const FileSelect = storeNac.useFileSelect();
  const option = FileSelect.InitOption();
  option.fileAcceptList = [FileSelect.Accept.pdf];
  option.extRegExpList = [FileSelect.ExtRegExp.pdf];
  option.multiple = false;
  const fileList = await FileSelect.Show(option);
  if (fileList === null || fileList.length === 0) return;
  const dataUrl = await FileToDataUrl(fileList[0]);
  state.data.basePdf = dataUrl;
  updateGeneratorTemplate(state.data);
  generateDesigner();
};

/**
 *  Templateの差し替え
 */
const changeTemplate = async () => {
  if (state.designerOption.font === null) {
    state.designerOption.font = await GetFont();
  }
  const fontName = Object.keys(state.designerOption.font)[0];
  const FileSelect = storeNac.useFileSelect();
  const option = FileSelect.InitOption();
  option.fileAcceptList = [FileSelect.Accept.json];
  option.extRegExpList = [FileSelect.ExtRegExp.json];
  option.multiple = false;
  const fileList = await FileSelect.Show(option);
  if (fileList === null || fileList.length === 0) return;
  const templateJson = JSON.parse(await fileToText(fileList[0]));
  const template = SetTemplateTypeSafe(templateJson, props.fileName, fontName);
  setTemplate(template);
  // setTemplate(template);
  updateGeneratorTemplate(template, true);
};

const FileToDataUrl = (file: File) => {
  return new Promise<any>((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        return resolve(String(reader.result));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      return reject(error);
    }
  });
};
const fileToText = (file: File) => {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(String(reader.result));
    };
    reader.readAsText(file);
  });
};

// ----------------------------------------------------------------------------
// 親コンポーネントへの関数渡し
const generate = (template: PdfTemplate) => {
  state.data = template;
  state.diff = ObjectCopy(template);
  generateDesigner();
};

const getTemplate = (): { data: PdfTemplate; diff: PdfTemplate } => {
  return ObjectCopy({ data: state.data, diff: state.diff });
};
const setTemplate = (template: PdfTemplate) => {
  state.data = template;
  state.diff = ObjectCopy(template);
};
emit('update:func', { generate, destroy: designerDestroy, getTemplate, setTemplate });
// ----------------------------------------------------------------------------

onMounted(async () => {
  state.designerOption.font = await GetFont();
  await Sleep(0);
});
// ----------------------------------------------------------------------------
</script>
<template>
  <div class="h-100">
    <div class="row h-100">
      <div class="col-9 h-100">
        <div ref="pdfDesiner" class="h-100 bg-gray"></div>
      </div>
      <div class="col-3">
        <div class="fs-8">デザイナー側で編集する場合、[Auto Sync]をOFFにすると挙動が軽くなる。</div>
        <div class="form-group">
          <nac-fc-toggle-switch
            :data="state.autoSync ? 1 : 0"
            placeholder="Auto Sync"
            class="w-50"
            @value-change="(v) => (state.autoSync = v === 1)"
          />
          <v-btn
            :disabled="state.autoSync"
            variant="flat"
            color="accent1"
            class="border-main1 flex-grow-0 w-50"
            @click.stop="resetSchemas()"
          >
            リスト更新
          </v-btn>
        </div>
        <div class="my-2">
          <nac-fc-datepicker
            :data="state.data.meta.updateAt"
            data-format="YYYY-MM-DD HH:mm:ss"
            show-format="YYYY-MM-DD(ddd) HH:mm:ss"
            :disabled="true"
            placeholder="更新日時"
          />
          <nac-fc-textarea v-model:data="state.data.meta.note" class="mt-3" :rows="10" placeholder="memo" />
        </div>
        <div class="mt-2 d-flex">
          <v-btn variant="flat" color="accent1" class="border-main1" @click.stop="changeBasePDF()"> BasePDF変更 </v-btn>
          <v-btn variant="flat" color="accent1" class="border-main1 ms-1" @click.stop="changeTemplate()">
            Template変更
          </v-btn>
        </div>
        <div class="mt-2 d-flex">
          <v-btn variant="flat" color="accent1" class="border-main1" @click.stop="addListItem()">リスト追加</v-btn>
        </div>
        <div class="my-2">
          <div class="list-group border-accent1">
            <template v-for="(row, index) in state.data.list" :key="index">
              <div class="list-group-item border-accent1 bg-theme2">
                <div class="form-group">
                  <nac-fc-valuebox
                    v-model:data="row.count"
                    placeholder="count"
                    :min="1"
                    :max="999"
                    :step="1"
                    :nullable="false"
                    :is-show-btn-control="true"
                    class="w-50"
                    @warn="(message: string) => Toast.Error(message, '入力値エラー', 2500)"
                    @value-change="resetSchemas()"
                  />
                  <nac-fc-valuebox
                    v-model:data="row.span"
                    placeholder="span"
                    :min="0"
                    :max="50"
                    :step="0.01"
                    :nullable="false"
                    unit="mm"
                    :digits="2"
                    :is-show-btn-control="true"
                    class="w-50"
                    @value-change="resetSchemas()"
                    @warn="(message: string) => Toast.Error(message, '入力値エラー', 2500)"
                  />
                </div>
                <nac-fc-select
                  v-model:data="setlectedValue"
                  v-model:text="setlectedText"
                  class="mt-1"
                  placeholder="リスト対象追加"
                  :require="false"
                  :disabled="false"
                  :list="unSelectedItemList"
                  @value-change="(a: any, b: any) => targetListAdd(row)"
                />
                <ul v-if="row.targetList.length > 0" class="list-group mt-2 ms-4">
                  <div
                    v-for="(targetName, index2) in row.targetList"
                    :key="index2"
                    class="list-group-item d-flex justify-content-between align-items-center"
                  >
                    {{ targetName }}
                    <span class="px-2 py-1 cursor-pointer" @click="targetListItemRemove(row, targetName)">
                      <i class="fas fa-times text-danger"></i>
                    </span>
                  </div>
                </ul>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/_variables.scss';
</style>
