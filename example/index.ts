import { Paragraph } from "../src/Blocks/Paragraph/serializer";
import { ParagraphData } from "../src/Blocks/types";
import {
  bold,
  bi,
  blockquoteData,
  paragraphData,
  headingData,
  listData,
  olData,
  codeData,
  imageData,
  equationData,
  tableData,
} from "./example";
import { Page } from "../src/Wraps/Page";

const page = new Page({
  initialData: [
    { type: "heading", heading: headingData, order: "b" },
    { type: "paragraph", paragraph: paragraphData, order: "bb" },
    { type: "blockquote", blockquote: blockquoteData, order: "bc" },

    { type: "heading", heading: headingData, order: "c" },
    { type: "list", list: listData, order: "cb" },
    { type: "orderedlist", orderedlist: olData, order: "cd" },

    { type: "heading", heading: headingData, order: "d" },
    { type: "table", table: tableData, order: "db" },

    { type: "heading", heading: headingData, order: "g" },
    { type: "code", code: codeData, order: "gb" },
    { type: "image", image: imageData, order: "gc" },
    { type: "equation", equation: equationData, order: "gd" },
  ],
});

page.insertAfter(document.body);

const page2 = new Page({
  initialData: [
    { type: "heading", heading: headingData, order: "d" },
    { type: "blockquote", blockquote: blockquoteData, order: "c" },
    { type: "code", code: codeData, order: "g" },
    { type: "paragraph", paragraph: paragraphData, order: "b" },
    { type: "orderedlist", orderedlist: olData, order: "f" },
    { type: "list", list: listData, order: "e" },
  ],
});

page2.insertAfter(document.body);
