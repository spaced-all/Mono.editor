import {
  BlockQuoteData,
  CodeData,
  EquationData,
  HeadingData,
  ImageData,
  OrderedListData,
  ParagraphData,
  TableData,
  UnorderedListData,
} from "../src/Blocks/types";
import { InlineElementMap } from "../src/Inlines/types";

export const text: InlineElementMap["#text"] = {
  kind: "#text",
  text: "Plain Text",
};

export const bold: InlineElementMap["b"] = {
  kind: "b",
  text: "Bold Text",
};

export const italic: InlineElementMap["i"] = {
  kind: "i",
  text: "Italic Text",
};

export const bi: InlineElementMap["b"] = {
  kind: "b",
  text: "bold and",
  children: [italic],
};

export const code: InlineElementMap["code"] = {
  kind: "code",
  text: "cold",
};

export const del: InlineElementMap["del"] = {
  kind: "del",
  text: "delete",
};

export const emRed: InlineElementMap["em"] = {
  kind: "em",
  text: "red em",
  color: "red",
};

export const inlineMath: InlineElementMap["math"] = {
  kind: "math",
  value: "\\sum_{i=0}^n i",
};

export const paragraphData: ParagraphData = {
  kind: "paragraph",
  children: [{ kind: "#text", text: "Plain Text" }, bold, bi, inlineMath],
};

export const blockquoteData: BlockQuoteData = {
  kind: "blockquote",
  children: [{ kind: "#text", text: "Plain Text" }, bold, bi],
};

export const headingData: HeadingData = {
  kind: "heading",
  level: 1,
  children: [{ kind: "#text", text: "Plain Text" }, bold, emRed],
};

export const listData: UnorderedListData = {
  kind: "list",

  items: [
    { children: [{ kind: "#text", text: "Plain Text" }, bold, bi], level: 1 },
  ],
};

export const olData: OrderedListData = {
  kind: "orderedlist",

  items: [
    { children: [{ kind: "#text", text: "Plain Text" }, bold, bi], level: 1 },
    { children: [{ kind: "#text", text: "Plain Text" }, bold, bi], level: 2 },
    { children: [{ kind: "#text", text: "Plain Text" }, bold, bi], level: 1 },
    { children: [{ kind: "#text", text: "Plain Text" }, bold, bi], level: 2 },
    { children: [{ kind: "#text", text: "Plain Text" }, bold, bi], level: 2 },
  ],
};

export const tableData: TableData = {
  kind: "table",

  items: [
    [{ children: [bi, bold] }, { children: [bi, bold] }],
    [{ children: [bi, bold] }, { children: [bi, bold] }],
  ],
};

export const codeData: CodeData = {
  kind: "code",
  code: [
    'import { Paragraph } from "./Blocks/Paragraph/serializer";',
    'console.log("Hello World")',
  ],
};

export const imageData: ImageData = {
  kind: "image",
  src: "http://browser9.qhimg.com/bdr/__85/t01028e5f2ec69e423d.jpg",
  caption: [bold, bi],
};

export const equationData: EquationData = {
  kind: "equation",
  equation: "\\sum_{i=0}^n i",
  caption: [bold, bi],
};
