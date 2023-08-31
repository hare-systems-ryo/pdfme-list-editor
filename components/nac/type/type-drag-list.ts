export namespace DragList {
  export interface ListRow<T = any> {
    index: number; // 配列のIndex
    order: number; // 整数
    data: T;
  }

  /**
   * ListRowデータ型に変換
   */
  export const SetData = <T = any>(index: number, order: number, data: T): ListRow<T> => {
    return {
      index: index,
      order: order,
      data: data,
    };
  };

  export const MoveDirection = {
    Down: -1,
    Up: 1,
  } as const;
  export type MoveDirection = (typeof MoveDirection)[keyof typeof MoveDirection];

  export type ChangeOrderData<T> = {
    from: T;
    to: T;
  };
}
