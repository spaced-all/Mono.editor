import produce from "immer";
import { ABCText } from "./serializer";
import { serializeInlineElement } from "../../Inlines/serializer";
import { dom, time } from "../../utils";

import { BlockHandler } from "../aBlock/handler";
import { DefaultBlockInfo, HeadingData, ParagraphData } from "../types";

export class ABCTextHandler extends BlockHandler {
  serializer: ABCText<any, any>;

  public get supportedMergeBlock(): {} {
    return {
      paragraph: true,
      heading: true,
      blockquote: true,
      orderedlist: true,
      list: true,
    };
  }

  handleEnterDown(e: KeyboardEvent): boolean | void {
    console.log(e);
    e.preventDefault();
    this.parent.richhint.remove();
    let newBlock: DefaultBlockInfo;
    const lastEditTime = time.getTime();
    if (e.shiftKey) {
      newBlock = {
        type: "paragraph",
        order: "",
        paragraph: {
          kind: "paragraph",
          children: [],
          lastEditTime: lastEditTime,
        },
        lastEditTime: lastEditTime,
      };
    } else {
      this.deleteSelecte();
      const frag = dom.extractFragmentsAfter(this.currentEditable());
      const nodes = [];
      frag.childNodes.forEach((item) => nodes.push(item));
      const children = serializeInlineElement(dom.validChildNodes(frag));
      if (this.serializer.blockType === "blockquote") {
        newBlock = {
          type: "blockquote",
          order: "",
          blockquote: {
            kind: "blockquote",
            children: children,
            lastEditTime: lastEditTime,
          },
          lastEditTime: lastEditTime,
        };
      } else {
        newBlock = {
          type: "paragraph",
          order: "",
          paragraph: {
            kind: "paragraph",
            children: children,
            lastEditTime: lastEditTime,
          },
          lastEditTime: lastEditTime,
        };
      }
    }
    this.parent.propgateNew({
      block: newBlock,
      order: this.serializer.state.data.order,
      offset: 0,
    });
    return true;
  }

  handleBackspaceDown(e: KeyboardEvent): boolean | void {
    console.log(["Heading", e]);

    if (dom.isCursorLeft(this.currentEditable())) {
      e.preventDefault();

      if (this.serializer.blockType === "paragraph") {
        /**
         * 两种方案：
         * 直接借 parent 拿到上一个 block，给 block 实现一个 append 接口在 lastContainer 上加
         *
         *
         *
         */
        this.parent.richhint.remove();
        this.parent.propgateMerge({
          order: this.serializer.state.data.order,
          elementType: "text",
          mergeType: "backspace",
          children: dom.validChildNodes(this.serializer.outer),
        });
      } else {
        const lastEditTime = time.getTime();
        const data = this.serializer.serializeBlockInfo();
        const newData = produce(data, (draft: DefaultBlockInfo) => {
          draft.paragraph = {
            children: draft[draft.type as "blockquote" | "heading"].children,
            kind: "paragraph",
            lastEditTime: lastEditTime,
          };
          draft.type = "paragraph";
          draft.lastEditTime = lastEditTime;
        });

        this.parent.propgateChange({
          kind: "change",
          focus: newData,
        });
      }

      return true;
    }
  }
  handleDeleteDown(e: KeyboardEvent): boolean | void {
    if (this.isCursorRight()) {
      e.preventDefault();
      this.parent.propgateMerge({
        order: this.serializer.order,
        elementType: "text",
        mergeType: "delete",
      });
      return true;
    }
  }
}
