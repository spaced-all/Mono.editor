import { InlineElement } from "../Inlines/types";
import { BlockQuote } from "./Blockquote";
import { List } from "./List";
import { Paragraph } from "./Paragraph";

export declare type BlockUri = string;
export declare type OrderString = string;

export interface IndentItem {
  level: number;
  children?: InlineElement[];
  lastEditTime?: number;
}

export interface OrderedIndentItem extends IndentItem {
  marker?: number; // 1.2.3. for first level, a.b.c. for second level, etc.
}

export interface TodoItem extends IndentItem {
  progress?: boolean;
}

export interface BlockData {
  kind: string;
  lastEditTime?: number;
}

export interface TextContent extends BlockData {
  children: InlineElement[];
}

export interface ParagraphData extends TextContent {
  kind: "paragraph";
}

export interface HeadingData extends TextContent {
  kind: "heading";
  level: number;
}

export interface BlockQuoteData extends TextContent {
  kind: "blockquote";
  color?: string;
  icon?: string;
}

export interface ABCListData<C extends IndentItem> extends BlockData {
  items: C[];
}

export interface OrderedListData extends ABCListData<OrderedIndentItem> {
  kind: "orderedlist" | "ol";
}

export interface UnorderedListData extends ABCListData<IndentItem> {
  kind: "list";
}

export interface TableCell extends BlockData {
  children: InlineElement[];
  lastEditTime?: number;
}
export type TableDataFrame = TableCell[][];
export interface TableData extends BlockData {
  kind: "table";
  items: TableDataFrame;
}

export interface TodoData extends BlockData {
  kind: "todo";
  // 可以和待办事项结合，直接从另一个表取数据
  // 也就是，更新这一个表的时候，要同时考虑更新 todo tabel
  caption?: string;
  children?: TodoItem[];
}

export interface LinkCardData extends BlockData {
  kind: "link";
  href: string;
  title: string;
  summary: string;
  caption?: InlineElement[];
}

export interface CodeData extends BlockData {
  kind: "code";
  language?: string;
  highlight?: number | number[]; // 高亮
  code: string[]; // 用换行符分隔，用于高亮
  caption?: InlineElement[];
}

export interface ImageData extends BlockData {
  kind: "image";
  href: string;
  align: "left" | "center" | "right";
  size: number; // 放缩比例，而不是原始大小
  caption?: InlineElement[];
}

type ExtendBlockKind = `@${string}`;
export interface ExtendBlock extends BlockData {
  kind: ExtendBlockKind;
}

export interface BlockMap {
  paragraph?: ParagraphData;
  heading?: HeadingData;
  blockquote?: BlockQuoteData;
  orderedlist?: OrderedListData;
  list?: UnorderedListData;
  table?: TableData;
  todo?: TodoData;
  image?: ImageData;
  code?: CodeData;
  link?: LinkCardData;
  [key: ExtendBlockKind]: ExtendBlock;
}

export type BlockName = keyof BlockMap;
export type BlockType = BlockMap[BlockName];

export interface MetaInfo {
  id?: BlockUri;
  order: OrderString;
  lastEditTime?: number;
  archived?: boolean;
  type: BlockName;
}

export type DefaultBlockInfo = BlockMap & MetaInfo;

export interface BlockComponentTypes {
  paragraph: typeof Paragraph;
  blockquote: typeof BlockQuote;
  list: typeof List;
}
export interface BlockComponents {
  paragraph: Paragraph;
  blockquote: BlockQuote;
  list: List;
}

export type BlockComponentName = keyof BlockComponentTypes;
export type BlockComponentType = BlockComponentTypes[BlockComponentName];
export type BlockComponent = BlockComponents[BlockComponentName];
