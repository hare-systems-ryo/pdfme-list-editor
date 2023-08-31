<script setup lang="ts">
/* ----------------------------------------------------------------------------
pages\index.vue
---------------------------------------------------------------------------- */

// [ node_modules ]
import dayjs from 'dayjs';

// [ vueuse ]
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';
// [nac]
import { Sleep } from '@/components/nac/nac-main';
import { ObjectCompare, ObjectCopy, ObjectKeys } from '@/components/nac/nac-main';
import { ModalControl, InitModalControl, InitModals } from '@/components/nac/nac-main';
// [nac > Modals ]
// ----------------------------------------------------------------------------
import { PdfInfoList, PdfInfo } from '@/com/pdf-list';
// [com]
import { InitPdfTemplate } from '@/com/pdf-designer';
import { PropFunc, InitPropFunc } from '@/com/pdf-designer';
import { SetTemplateTypeSafe } from '@/com/pdf-designer';
import { DefaultFontName } from '@/com/pdf-designer';

// ----------------------------------------------------------------------------

// [ stores ]
const storeApp = useStoreApp();
const storeNac = useStoreNac();
const WindowLoader = storeNac.useWindowLoader();
const Toast = storeNac.useToast();
useHead({ title: 'PDFME List Editor' });
// ----------------------------------------------------------------------------
interface State {
  /** PDF選択モーダル入力値 */
  data: {
    envConfig: {
      EnvCode: string;
      NAME: string;
      ENV: 'production' | 'staging' | 'development' | '';
      S3_BUCKET_NAME: string;
    } | null;
    pdfInfo: PdfInfo | null;
  };
  /** PDF選択モーダル入力値 ※最後にPDF取得したとき */
  diff: {
    envConfig: {
      EnvCode: string;
      NAME: string;
      ENV: 'production' | 'staging' | 'development' | '';
      S3_BUCKET_NAME: string;
    } | null;
    pdfInfo: PdfInfo | null;
  };
}

const state = reactive<State>({
  /** PDF選択モーダル入力値 */
  data: {
    envConfig: null,
    pdfInfo: null,
  },
  /** PDF選択モーダル入力値 ※最後にPDF取得したとき */
  diff: {
    envConfig: null,
    pdfInfo: null,
  },
});
// ----------------------------------------------------------------------------

/**
 * 「PDFを表示する」を押すことができるかどうか
 */
const enableGetPdfFileBtn = computed(() => {
  if (state.data.envConfig === null || state.data.pdfInfo === null) return true;
  return ObjectCompare(state.data, state.diff);
});

// ----------------------------------------------------------------------------
// ストレージ用環境

type EnvConfigMini = {
  EnvCode: string;
  NAME: string;
  ENV: 'production' | 'staging' | 'development' | '';
  S3_BUCKET_NAME: string;
};

type EnvConfigList = {
  [key: string]: EnvConfigMini;
};
// ストレージ用の環境設定
const envConfigList = ref<EnvConfigList>({});
// ストレージ用の環境設定のKey名配列  ex)  Env1 , Env2
const envConfigListKeys = computed(() => {
  return ObjectKeys(envConfigList.value) as string[];
});

// ストレージ用の環境設定の取得
const getEnv = async () => {
  const toastTitle = 'ENV Config取得';
  const { data, error } = await useFetch('/api/get-env', {
    method: 'post',
  });
  if (error.value) {
    console.error(toastTitle, error.value);
    PdfFunc.value.destroy();
    return;
  }
  const res = data.value as EnvConfigList | null;
  if (res === null) {
    Toast.Warning('取得に失敗しました', toastTitle);
    return;
  }
  envConfigList.value = res;
};
getEnv();
// ----------------------------------------------------------------------------

/**
 * 「PDFを表示する」を押したときの挙動
 */
const getPdfFile = async () => {
  const toastTitle = 'PDFテンプレート取得';
  const envConfig = state.data.envConfig;
  const pdfInfo = state.data.pdfInfo;
  if (envConfig === null || pdfInfo === null) return;
  // エラーのときのTemplate
  const defaultTemplate = InitPdfTemplate({ fileName: pdfInfo.fileName });
  try {
    WindowLoader.Show();
    type ApiReq = {
      envCode: string;
      pdfInfo: PdfInfo;
    };
    const req: ApiReq = {
      envCode: envConfig.EnvCode,
      pdfInfo: pdfInfo,
    };
    const { data, error } = await useFetch('/api/pdf-template', {
      method: 'post',
      body: req,
    });
    if (error.value) {
      console.error(toastTitle, error.value);
      PdfFunc.value.destroy();
      return;
    }
    const res = data.value;
    if (res === null || res.template === null) {
      Toast.Warning('PDFが存在しません', toastTitle);
      PdfFunc.value.generate(defaultTemplate);
      return;
    }
    const template = SetTemplateTypeSafe(res.template, pdfInfo.fileName, DefaultFontName);
    PdfFunc.value.generate(template);
    state.diff = ObjectCopy(state.data);
    modal.menu.close();
  } catch (err) {
    console.error(toastTitle, err);
    Toast.Error(String(err), toastTitle);
    PdfFunc.value.generate(defaultTemplate);
  } finally {
    WindowLoader.Hide();
  }
};

/**
 * 「Upload」を押したときの挙動
 */
const uploadPdf = async () => {
  // console.log('uploadPdf', template, basePdf);
  const toastTitle = 'PDFテンプレート保存';
  const envConfig = state.diff.envConfig;
  const pdfInfo = state.diff.pdfInfo;
  if (envConfig === null || pdfInfo === null) return;
  try {
    const { data: template } = PdfFunc.value.getTemplate();
    WindowLoader.Show();
    type ApiReq = {
      envCode: string;
      pdfInfo: PdfInfo;
      template: string;
    };
    template.meta.updateAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const req: ApiReq = {
      envCode: envConfig.EnvCode,
      pdfInfo: pdfInfo,
      template: JSON.stringify(template),
    };
    const { data, error } = await useFetch('/api/pdf-template-upload', {
      method: 'post',
      body: req,
    });
    if (error.value) {
      console.error(toastTitle, error.value);
      return;
    }
    const res = data.value;
    if (res === false) {
      Toast.Warning('保存に失敗しました', toastTitle);
      return;
    }
    Toast.Success('保存しました', toastTitle, 2500);
    PdfFunc.value.setTemplate(template);
  } catch (err) {
    console.error(toastTitle, err);
    Toast.Error(String(err), toastTitle);
  } finally {
    WindowLoader.Hide();
  }
};

/**
 * 「Download Template JSON」を押したときの挙動
 */
const downloadTemplateJson = () => {
  const envConfig = state.diff.envConfig;
  const pdfInfo = state.diff.pdfInfo;
  if (envConfig === null || pdfInfo === null) return;
  const { data } = PdfFunc.value.getTemplate();
  const fileText = JSON.stringify(data, null, 3);
  const blob = new Blob([fileText], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `${pdfInfo.fileName}.json`);
  a.click();
};

/**
 * 「Show Interface」を押したときの挙動
 */
const showInterface = () => {
  const { data } = PdfFunc.value.getTemplate();
  const keys: string[] = [];
  data.schemas.forEach((row) => {
    keys.push(...ObjectKeys(row));
  });
  const text = keys.map((row) => row + ' : string ;').join('\n');
  const interfaceText = `
type InputRow = {
    ${keys.map((row) => row + ' : string ;').join('\n\t')}
}
type Input = InputRow[];`;
  const initFuncText = `
const InitInputRow = () => {
  return {
      ${keys.map((row) => row + ' : ``,').join('\n\t')}
  }
};`;
  modal.interface.state.interface = interfaceText;
  modal.interface.state.initFunc = initFuncText;
  modal.interface.show();
};

/**
 *  PDFのテンプレートコンポーネントの関数用
 */
const PdfFunc = ref<PropFunc>(InitPropFunc());

/**
 *  PDFのテンプレートに変更が加えられたかどうかの監視用
 */
const hasChange = ref(false);

const fileName = computed(() => {
  if (state.diff.pdfInfo === null) return '';
  return state.diff.pdfInfo?.fileName;
});
// - [ Generator ]--------------------------------------------------

const clipboardCopy = (text: string) => {
  // var str = 'コピーする文字';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    Toast.Success('Copy', '', 1500);
  }
};
// ----------------------------------------------------------------------------
// [ Modal ]
interface Modal {
  menu: ModalControl;
  interface: ModalControl<{ interface: string; initFunc: string }>;
}
const modal = reactive<Modal>({
  menu: InitModalControl(),
  interface: InitModalControl({
    state: {
      interface: '',
      initFunc: '',
    },
  }),
});
modal.menu.closeBefore = () => {
  deactivate();
};
modal.menu.showAfter = () => {
  activate();
};

// [ useFocusTrap ]
const focusTrapElm = ref<HTMLElement | null>(null);
const { activate, deactivate } = useFocusTrap(focusTrapElm, { allowOutsideClick: true });
onMounted(async () => {
  InitModals(modal, nextTick);
  WindowLoader.Hide();
  await Sleep(0);
  modal.menu.show();
});
// ----------------------------------------------------------------------------
</script>
<template>
  <client-only>
    <div class="card" :style="`height:${storeApp.windowFixedH}; `">
      <div class="card-header flex-shrink-0 bg-main1 py-1 pe-1" style="height: 50px">
        PDF管理ツール
        <v-btn
          variant="flat"
          color="link"
          size=""
          class="border-white px-3"
          style="height: 36px"
          @click="modal.menu.show()"
        >
          <i class="fa-solid fa-window-restore me-1"></i>
          PDF選択
        </v-btn>
      </div>
      <div class="card-body flex-shrink-1 d-flex flex-column p-1" style="height: calc(100% - 100px)">
        <!-- パンくずリスト -->
        <div class="d-flex border-main1 align-items-center" style="height: 50px">
          <div
            style="position: absolute; inset: 0 0 auto 0; height: 4px"
            class=""
            :class="{
              'bg-error': state.diff.envConfig?.ENV === 'production',
              'bg-warning': state.diff.envConfig?.ENV === 'staging',
              'bg-link': state.diff.envConfig?.ENV === 'development',
            }"
          ></div>
          <div
            style="position: absolute; inset: auto 0 0 0; height: 4px"
            class=""
            :class="{
              'bg-error': state.diff.envConfig?.ENV === 'production',
              'bg-warning': state.diff.envConfig?.ENV === 'staging',
              'bg-link': state.diff.envConfig?.ENV === 'development',
            }"
          ></div>
          <template v-if="state.diff.envConfig === null || state.diff.pdfInfo === null">
            <span class="fw-bold text-error fs-5 px-3">PDF未選択</span>
          </template>
          <template v-else>
            <div class="p-1 lh-1 mx-3">
              <div class="fs-8 fw-bold">
                <span>環境</span>
              </div>
              <div class="fs-6">
                <span class="ms-auto"> [{{ state.diff.envConfig.ENV }}] </span>
              </div>
            </div>
            <div class="p-1 lh-1 mx-3">
              <div class="fs-8 fw-bold">
                <span>Bucket</span>
              </div>
              <div class="fs-6">
                <span>{{ state.diff.envConfig.S3_BUCKET_NAME }}</span>
              </div>
            </div>
            <div class="p-1 lh-1 mx-3">
              <div class="fs-8 fw-bold">
                <span>FilePath</span>
              </div>
              <div class="fs-6">
                <span>{{ state.diff.pdfInfo.fileDir + state.diff.pdfInfo.fileName }}</span>
              </div>
            </div>
            <div class="p-1 lh-1 mx-3">
              <div class="fs-8 fw-bold">
                <span>ファイル名</span>
              </div>
              <div class="fs-6">
                <span>{{ state.diff.pdfInfo.displayName }}</span>
              </div>
            </div>
          </template>
        </div>
        <div class="flex-grow-1 flex-shrink-1 pt-3" style="overflow: hidden">
          <pdf-designer v-model:func="PdfFunc" :file-name="fileName" @has-change="(f) => (hasChange = f)" />
        </div>
      </div>
      <div class="card-footer flex-shrink-0 bg-main1 p-1" style="height: 50px">
        <v-btn
          variant="flat"
          color="download"
          size=""
          style="height: 36px"
          class="border-white py-1 px-3"
          :disabled="state.diff.envConfig === null || state.diff.pdfInfo === null"
          @click="downloadTemplateJson()"
        >
          <i class="fa-solid fa-cloud-arrow-down me-1"></i>Download Template
        </v-btn>
        <v-btn
          variant="flat"
          color="link"
          size=""
          style="height: 36px"
          class="border-white py-1 px-3 ms-1"
          :disabled="state.diff.envConfig === null || state.diff.pdfInfo === null"
          @click="showInterface()"
        >
          <i class="fa-solid fa-window-restore me-1"></i> Show Interface
        </v-btn>

        <v-btn
          variant="flat"
          color="accent1"
          size=""
          style="height: 36px"
          class="border-white py-1 px-3 ms-auto"
          :disabled="!hasChange"
          @click="uploadPdf()"
        >
          Upload
        </v-btn>
      </div>
      <!--  -->
      <v-overlay v-model="modal.menu.isShow" :close-on-back="false" :persistent="true">
        <div class="overlay-modal p-0 p-800-3" :style="`height:${storeApp.windowFixedH}`">
          <div ref="focusTrapElm" class="card">
            <div class="card-header bg-main1 py-1">
              PDF選択
              <v-btn variant="outlined" color="white" size="" class="border-2 py-1 px-3" @click="modal.menu.close()">
                <i class="fa-solid fa-xmark"></i>
                Close
              </v-btn>
            </div>
            <div class="card-body bg-back">
              <div class="">環境選択</div>
              <div class="d-flex mx-n2">
                <template v-for="(key, index) in envConfigListKeys" :key="index">
                  <div class="form-group mx-2">
                    <v-btn
                      variant="flat"
                      class="flex-grow-1"
                      :class="{
                        'bg-error':
                          state.data.envConfig?.NAME === envConfigList[key].NAME &&
                          'production' === envConfigList[key].ENV,
                        'bg-error-light':
                          state.data.envConfig?.NAME !== envConfigList[key].NAME &&
                          'production' === envConfigList[key].ENV,
                        'bg-warning':
                          state.data.envConfig?.NAME === envConfigList[key].NAME &&
                          'staging' === envConfigList[key].ENV,
                        'bg-warning-light':
                          state.data.envConfig?.NAME !== envConfigList[key].NAME &&
                          'staging' === envConfigList[key].ENV,
                        'bg-link':
                          state.data.envConfig?.NAME === envConfigList[key].NAME &&
                          'development' === envConfigList[key].ENV,
                        'bg-link-light':
                          state.data.envConfig?.NAME !== envConfigList[key].NAME &&
                          'development' === envConfigList[key].ENV,
                      }"
                      @click="state.data.envConfig = envConfigList[key]"
                    >
                      {{ envConfigList[key].NAME }}
                    </v-btn>
                  </div>
                </template>
              </div>
              <div class="">PDFファイル選択</div>
              <div class="d-flex mx-n2">
                <template v-for="(row, index) in PdfInfoList" :key="index">
                  <v-btn
                    variant="flat"
                    class="border-main1 mx-1"
                    :class="{
                      'bg-accent1':
                        state.data.pdfInfo?.fileDir === row.fileDir && state.data.pdfInfo?.fileName === row.fileName,
                      'bg-accent1-light':
                        state.data.pdfInfo?.fileDir !== row.fileDir || state.data.pdfInfo?.fileName !== row.fileName,
                    }"
                    @click="state.data.pdfInfo = row"
                  >
                    {{ row.fileDir }}
                    {{ row.fileName }}
                  </v-btn>
                </template>
              </div>
            </div>
            <div class="card-footer bg-main3 py-1">
              <v-btn
                variant="flat"
                class="border-white ms-auto"
                color="accent1"
                :disabled="enableGetPdfFileBtn"
                @click="getPdfFile"
              >
                PDFを表示する
              </v-btn>
            </div>
          </div>
        </div>
      </v-overlay>
      <v-overlay v-model="modal.interface.isShow" :close-on-back="false" :persistent="true">
        <div class="overlay-modal p-0 p-800-3" :style="`height:${storeApp.windowFixedH}`">
          <div ref="focusTrapElmInterface" class="card h-100 w-100">
            <div class="card-header bg-main1 py-1">
              interface
              <v-btn
                variant="outlined"
                color="white"
                size=""
                class="border-2 py-1 px-3"
                @click="modal.interface.close()"
              >
                <i class="fa-solid fa-xmark"></i>
                Close
              </v-btn>
            </div>
            <div class="card-body flex-grow-1 flex-shrink-1 bg-back" style="overflow: auto">
              <div class="d-flex">
                <div class="w-50 p-1" style="white-space: pre-line">
                  <v-btn
                    variant="flat"
                    color="accent1"
                    class="mb-1"
                    @click="clipboardCopy(modal.interface.state.interface)"
                  >
                    Copy
                  </v-btn>
                  <nac-fc-textarea :data="modal.interface.state.interface" readonly :rows="40" />
                </div>
                <div class="w-50 p-1" style="white-space: pre-line">
                  <v-btn
                    variant="flat"
                    color="accent1"
                    class="mb-1"
                    @click="clipboardCopy(modal.interface.state.initFunc)"
                  >
                    Copy
                  </v-btn>
                  <nac-fc-textarea :data="modal.interface.state.initFunc" readonly :rows="40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-overlay>
    </div>
  </client-only>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/_variables.scss';
</style>
