import {
  DefaultBlockInfo,
  IndentItem,
  OrderedIndentItem,
  OrderString,
} from "../Blocks/types";
import { InlineElement } from "../Inlines/types";

export interface Data {
  type: "innerNode" | "innerJson" | "list" | "olist" | "listNode";
  innerNode?: Node[];
  innerJson?: InlineElement[];
  list?: IndentItem[];
  olist?: OrderedIndentItem[];
  listNode?: HTMLLIElement[];
}

export interface Insert {
  kind: "insert";
  offset: number;
  order: OrderString;
  index?: number; // container index
  data: Data;
}

export interface Delete {
  kind: "delete";
  start: number;
  end: number;
  order: OrderString;
  index?: number;
  data: Data;
}

export interface DeleteContainer {
  kind: "deleteContainer";
  index: number; // [0 ~ n-1]
  order: OrderString;
  data: Data;
}

export interface InsertContainer {
  kind: "insertContainer";
  index: number; // container index, insert at this index  [0 ~ n] for n containers
  order: OrderString;
  data: Data;
}

export interface DeleteBlock {
  kind: "deleteBlock";
  order: OrderString;
  data: DefaultBlockInfo;
}

export interface InsertBlock {
  kind: "deleteBlock";
  where: "after" | "before";
  order: OrderString;
  data: DefaultBlockInfo;
}

/**
 * client operator
 */

/**
 * 插入：文本、Inline Component
 *
 */

/**
 * 格式化、去格式化
 *  = 删除 range + 在 position 添加
 */

/**
 * 删除 Block
 * 删除 Container
 *
 */

/**
 * Merge(text, text)
 *  = 删除 block + 在 position 添加
 * Merge(text, list)
 *  = 删除 list 的一个 item，在 position 添加
 * Merge(list, text)
 *  = 删除 text ，在  position(text end) 添加
 * Merge(list, list)
 *  = 删除 block(list) + 在 list 下添加 container/item
 *
 * MergeInBlock(list)
 *  = 删除一个 container，在另一个 container 下添加
 */

/**
 * Change(text, list/text)
 *
 */

/**
 * Split(list)
 *  = before(新增 list) + after(新增 list) + 删除 item + Change(text, list)
 */
