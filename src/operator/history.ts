import { OrderString } from "../Blocks/types";
import { Handler } from "../types/eventHandler";

/**
 * 想想一个操作：
 *
 * 在已有文本中间，编辑一段文本，然后切到中间，加粗另一些文本，格式化一些文本，
 * 删掉前面，插入一个公式，编辑一段，然后在结尾插入一个公式
 * 切到中间，回车
 *
 */

export interface InsertTextHistory {
  type: "insertText";
  start: number;
  data: string;
}

export interface DeleteTextHistory {
  type: "deleteTextForward" | "deleteTextBackward";
  start: number;
  count: number;
}

export interface InsertElementHistory {
  type: "insertElement";
  start: number;
  data: any;
}
export interface DeleteElementHistory {
  type: "deleteElement";
  start: number;
}

export interface FormatHistory {
  type: "format";
  start: number;
  count: number;
  formatType: string;
}

export interface DeformatHistory {
  type: "deformat";
  start: number;
  formatType: string;
}

export interface InlineHistory {
  type: "insertEl";
  offset: number;
  data: any;
}

export interface AttributeHistory {
  type: string;

  handler: Handler;

  before: any;
  after: any;
}
/**
 * 更改 data 的某项数值（Image 大小、Code、Equation、url，。。。）
 * 读写某个 index 的 contenteditable
 */
export interface EditableHistory {}

/**
 * List：删掉某整行、新增某一行
 * Table: 增删某行列
 *
 */
export interface BlockHistory {
  kind: string;
  index?: number[];
  data?: any;
}

export interface Snapshot {
  type?: "changeBlock";
  order: OrderString;
  index: number[];
  data?: any;
  start: number;
  end?: number;
  lastEditTime: number;
  multiBlock?: boolean;
}

export interface BlockHistory {}
