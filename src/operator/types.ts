import {
  BlockComponentType,
  BlockType,
  DefaultBlockInfo,
} from "../Blocks/types";

export declare type BlockUri = string;
export declare type InlineUri = string;
export declare type Index = number | number[];

export interface PositionMessage {
  root: BlockUri;
  offset: number;
  reversed?: boolean;
}

export interface AbsPosition {
  root: HTMLElement;
  offset: number;
  reversed?: boolean;
}

export class RelPosition {
  container: Node;
  offset: number;
  root?: Node;
  constructor(container: Node, offset: number, root?: Node) {
    this.container = container;
    this.offset = offset;
    this.root = root;
  }
}

export interface Range {
  start: RelPosition;
  end?: RelPosition;
}

export interface Location {
  range: Range;
}

export interface InlineOperation {
  kind: string;
  url: BlockUri;
}

export interface TextEdit {
  /**
   * The range of the text document to be manipulated. To insert
   * text into a document create a range where start === end.
   */
  range: Range;
  /**
   * The string to be inserted. For delete operations use an
   * empty string.
   */
  newText: string;
}

export interface TextFormat {
  kind: string;
  range: Range;
}

export interface ComponentEdit {
  position: RelPosition;
  // data: Inline;
}

export interface BlockOperation {
  kind: string;

  prev?: DefaultBlockInfo;
  focus?: DefaultBlockInfo;
  next?: DefaultBlockInfo;
}

/**
 * focus
 */
export interface CreateBlock extends BlockOperation {
  kind: "create";
}

/**
 * focus
 */
export interface ChangeBlock extends BlockOperation {
  kind: "change";
}

/**
 * focus
 */
export interface DeleteBlock extends BlockOperation {
  kind: "delete";
}

/**
 * focus -> prev/focus/next
 */
export interface SplitBlock extends BlockOperation {
  kind: "split";
}
/**
 * prev/next -> focus
 */
export interface MergeBlock extends BlockOperation {
  kind: "merge";
}
