import { Font } from '@pdfme/ui';
import { Template, Designer, Form, Viewer } from '@pdfme/ui';

import { generate, BLANK_PDF } from '@pdfme/generator';

export const DefaultFontName = 'ipag';
export const GetFont = async () => {
  return {
    ipag: {
      data: await fetch('/assets/font/ipag.ttf').then((res) => res.arrayBuffer()),
      fallback: true,
    },
    ipagp: {
      data: await fetch('/assets/font/ipagp.ttf').then((res) => res.arrayBuffer()),
    },
  };
};

export interface PdfTemplate extends Template {
  fileName: string | null;
  fontName: string | undefined;
  basePdf: string;
  meta: { note: string; updateAt: string | null };
  list: {
    targetList: string[];
    span: number;
    count: number;
  }[];
}

export const InitPdfTemplate = (arg?: { fileName?: string; fontName?: string; basePdf?: string }): PdfTemplate => {
  const fileName = arg === undefined || arg.fileName === undefined ? null : arg.fileName;
  const fontName = arg === undefined || arg.fontName === undefined ? 'ipag' : arg.fontName;
  const basePdf = arg === undefined || arg.basePdf === undefined ? BLANK_PDF : arg.basePdf;
  return {
    fileName: fileName,
    fontName: fontName,
    meta: {
      note: '',
      updateAt: null,
    },
    basePdf: basePdf,
    columns: undefined,
    sampledata: undefined,
    schemas: [],
    list: [],
  };
};

export type PropFunc = {
  generate: (template: PdfTemplate) => void;
  destroy: () => void;
  getTemplate: () => { data: PdfTemplate; diff: PdfTemplate };
  setTemplate: (template: PdfTemplate) => void;
};

export const InitPropFunc = (): PropFunc => {
  return {
    generate: (template: PdfTemplate) => {},
    destroy: () => {},
    getTemplate: () => ({ data: InitPdfTemplate(), diff: InitPdfTemplate() }),
    setTemplate: (template: PdfTemplate) => {},
  };
};

/**
 * 任意のテンプレートデータを型チェックして適切な状態で返却する
 */
export const SetTemplateTypeSafe = (template: PdfTemplate, fileName: string, defaultFontName: string): PdfTemplate => {
  const baseTemplate = InitPdfTemplate();
  baseTemplate.fileName = fileName;
  // basePdf
  if ('basePdf' in template) {
    baseTemplate.basePdf = template.basePdf;
  }
  // fontName
  if ('fontName' in template) {
    baseTemplate.fontName = template.fontName;
  } else {
    baseTemplate.fontName = defaultFontName;
  }
  if ('meta' in template && 'note' in template.meta) {
    baseTemplate.meta.note = template.meta.note;
  }
  if ('meta' in template && 'updateAt' in template.meta) {
    baseTemplate.meta.updateAt = template.meta.updateAt;
  }
  // schemas
  if ('schemas' in template) {
    baseTemplate.schemas = template.schemas;
  }
  if (baseTemplate.schemas.length > 0) {
    // columns
    if ('columns' in template) {
      baseTemplate.columns = template.columns;
    } else {
      baseTemplate.columns = [];
      if (template.schemas.length > 0) {
        template.schemas.forEach((row: any) => {
          Object.keys(row).forEach((key) => {
            (baseTemplate.columns as string[]).push(key);
          });
        });
      }
    }
    // sampledata
    if ('sampledata' in template) {
      baseTemplate.sampledata = template.sampledata;
    } else {
      baseTemplate.sampledata = [];
      if (template.schemas.length > 0) {
        template.schemas.forEach((row: any) => {
          const sampleData: any = {};
          Object.keys(row).forEach((key) => {
            sampleData[key] = 'sample data';
          });
          (baseTemplate.sampledata as any).push(sampleData);
        });
      }
    }
  }

  // schemas
  if ('list' in template) {
    baseTemplate.list = template.list;
  }
  return baseTemplate;
};
