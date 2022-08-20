import produce from "immer";
import { Paragraph } from ".";
import { serializeInlineElement } from "../../Inlines/serializer";
import { dom, time } from "../../utils";

import { BlockHandler } from "../aBlock/handler";
import { ABCTextHandler } from "../aText";
import { DefaultBlockInfo, HeadingData, ParagraphData } from "../types";

export class ParagraphHandler extends ABCTextHandler {
  serializer: Paragraph;

  public get supportedMergeBlock(): {} {
    return {
      paragraph: true,
      heading: true,
      blockquote: true,
      orderedlist: true,
      list: true,
    };
  }

  handleSpaceDown(e: KeyboardEvent): boolean | void {
    console.log(["Paragraph", e]);
    const key = dom.textContentBefore(this.currentContainer()).trim();
    let data: DefaultBlockInfo;
    let newData: DefaultBlockInfo;
    const lastEditTime = time.getTime();
    switch (key) {
      case "#":
      case "##":
      case "###":
      case "####":
      case "#####":
        dom.deleteTextBefore(this.currentContainer());
        data = this.serializer.serializeBlockInfo();
        newData = produce(data, (draft: DefaultBlockInfo) => {
          draft.type = "heading";
          draft.heading = {
            children: draft.paragraph.children,
            kind: "heading",
            level: key.length,
            lastEditTime: lastEditTime,
          };
          draft.lastEditTime = lastEditTime;
        });

        this.parent.propgateChange({
          kind: "change",
          focus: newData,
        });
        e.preventDefault();
        return true;
      case ">":
      case "》":
        dom.deleteTextBefore(this.currentContainer());
        data = this.serializer.serializeBlockInfo();
        newData = produce(data, (draft: DefaultBlockInfo) => {
          draft.type = "blockquote";
          draft.blockquote = {
            children: draft.paragraph.children,
            kind: "blockquote",
            lastEditTime: lastEditTime,
          };
          draft.lastEditTime = lastEditTime;
        });

        this.parent.propgateChange({
          kind: "change",
          focus: newData,
        });
        e.preventDefault();
        return true;
      case "1.":
        dom.deleteTextBefore(this.currentContainer());
        data = this.serializer.serializeBlockInfo();
        newData = produce(data, (draft: DefaultBlockInfo) => {
          draft.type = "orderedlist";
          draft.orderedlist = {
            kind: "orderedlist",
            lastEditTime: lastEditTime,
            items: [
              {
                children: draft.paragraph.children,
                level: 1,
                lastEditTime: lastEditTime,
              },
            ],
          };
          draft.lastEditTime = lastEditTime;
        });

        this.parent.propgateChange({
          kind: "change",
          focus: newData,
        });
        e.preventDefault();
        return true;
      case "-":
        dom.deleteTextBefore(this.currentContainer());
        data = this.serializer.serializeBlockInfo();
        newData = produce(data, (draft: DefaultBlockInfo) => {
          draft.type = "list";
          draft.list = {
            kind: "list",
            lastEditTime: lastEditTime,
            items: [
              {
                children: draft.paragraph.children,
                level: 1,
                lastEditTime: lastEditTime,
              },
            ],
          };
          draft.lastEditTime = lastEditTime;
        });

        this.parent.propgateChange({
          kind: "change",
          focus: newData,
        });
        e.preventDefault();
        return true;
      case "[]":
      case "[ ]":
        break;
      case "$$":
        break;
      case "!!": // for block img
        break;
      default:
        if (key.match(/1-9\./g)) {
        } else if (key.match(/```[a-z0-9]*/g)) {
        }
    }
  }
}
