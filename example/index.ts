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
} from "./example";
import { Page } from "../src/Wraps/Page";

const page = new Page({
  initialData: [
    { type: "paragraph", paragraph: paragraphData, order: "b" },
    { type: "blockquote", blockquote: blockquoteData, order: "c" },
    { type: "heading", heading: headingData, order: "d" },
    { type: "list", list: listData, order: "e" },
    { type: "orderedlist", orderedlist: olData, order: "f" },
    { type: "code", code: codeData, order: "g" },
  ],
});

const root = page.renderRoot();
document.body.appendChild(root);

// const div = page.render();
// console.log(div);

page.replaceChildren(document.body);
