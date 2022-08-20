import { DefaultBlockInfo, OrderString } from "../Blocks/types";

export interface BlockMessage {
  // 产生 Message 的 Block
  order: OrderString;
}

/**
 * text to text
 *   Delete/Backspace -> node 追加 + 删除
 *
 * text to list
 *      Delete: text 在上 list 在下，node 反向追加 + 删除 firstContainer
 *      Backspace: text 在下 list 在上，node 追加到 lastContainer + 删除 text
 * list to text
 *      Delete: list 在上 text 在下，node 追加到 lastContainer + 删除 text
 *      Backspace： 不产生 Merge Message -> changeIndent / Split
 *
 * list to list
 *      Delete: list 合并
 *      Backspace： 不产生 Merge Message -> changeIndent / Split
 *
 *
 *
 * text to card-like(code/table/ ...)
 *      Delete/Backspace：整块选中 card
 * list to card-like(code/table/ ...)
 *      Delete/Backspace：整块选中 card
 *
 */

export interface MergeEvent extends BlockMessage {
  mergeType: "delete" | "backspace";
  elementType: "text" | "list" | "card";

  // 仅在 text + Backspace 的时候有
  children?: Node[];
}

/**
 *
 */
export interface SplitEvent extends BlockMessage {
  prev?: DefaultBlockInfo;
  focus?: DefaultBlockInfo;
  next?: DefaultBlockInfo;
}

export interface CreateEvent extends BlockMessage {
  block: DefaultBlockInfo;
  offset?: number;
}
