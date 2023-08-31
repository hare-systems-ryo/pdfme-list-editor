/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/fc/type-signature.ts
---------------------------------------------------------------------------- */

import { Sleep } from '../lib/nac-func';
// [ nac-stroe ]
import { useStoreNac } from '../nac-main';

export namespace Signature {
  export const NamespaceName = 'Signature';
  // ----------------------------------------------------------------------------

  export const DrawType = {
    Pen: 'source-over',
    Eraser: 'destination-out',
  } as const;
  export type DrawType = (typeof DrawType)[keyof typeof DrawType];

  export const DefaultValue = {
    size: {
      w: 1400,
      h: 250,
    },
    drawColor: '#000000',
    drawWidthPen: 2,
    drawWidthEraser: 24,
    pen: {
      lineWidth: {
        pen: 2,
        eraser: 24,
      },
    },
  } as const;

  export interface SignatureControl {
    state: {
      size: {
        w: number;
        h: number;
      };
      draw: {
        type: Signature.DrawType;
        color: string;
        lineWidth: {
          pen: number;
          eraser: number;
        };
      };
    };
    Reset: () => void;
    GetImage: () => string | null;
    SetImage: (dataUrl: string | null) => Promise<boolean>;
  }

  export const InitDrawValue = (): SignatureControl['state']['draw'] => {
    return {
      type: DrawType.Pen,
      color: '#000000',
      lineWidth: {
        pen: 2,
        eraser: 24,
      },
    };
  };

  export const InitControl = (): SignatureControl => {
    return {
      state: {
        size: {
          w: 1400,
          h: 250,
        },
        draw: InitDrawValue(),
      },
      // SetPenType: () => console.error('before init')
      Reset: () => console.error('before init'),
      GetImage: () => {
        console.error('before init');
        return null;
      },
      SetImage: async (dataUrl: string | null) => {
        console.error('before init');
        await Sleep(0);
        return false;
      },
    };
  };
  // export namespace Type {
  //   export interface ConstructorArg {
  //     size?: {
  //       w?: number;
  //       h?: number;
  //     };
  //   }
  //   export interface State {
  //     size: {
  //       w: number;
  //       h: number;
  //     };
  //     pen: {
  //       type: PenType;
  //       lineWidth: {
  //         pen: number;
  //         eraser: number;
  //       };
  //       lineColor: string;
  //     };
  //     methods: {
  //       reset: {
  //         ts: string;
  //         completed: () => void;
  //       };
  //       getImage: {
  //         ts: string;
  //         completed: (dataUrl: string | null) => void;
  //       };
  //       setImage: {
  //         ts: string;
  //         dataUrl: string;
  //         completed: () => void;
  //         error: (message: string) => void;
  //       };
  //     };
  //   }
  // }
}
