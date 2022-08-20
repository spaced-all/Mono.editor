import produce from "immer";
import { BlockQuote } from ".";
import { serializeInlineElement } from "../../Inlines/serializer";
import { dom, time } from "../../utils";

import { ABCTextHandler } from "../aText";
import { DefaultBlockInfo, HeadingData, ParagraphData } from "../types";

export class BlockquoteHandler extends ABCTextHandler {
  serializer: BlockQuote;

  public get supportedMergeBlock(): {} {
    return {
      paragraph: true,
      heading: true,
      blockquote: true,
      orderedlist: true,
      list: true,
    };
  }

  // handleBackspaceDown(e: KeyboardEvent): boolean | void {
  //   if (this.isCursorLeft()) {
  //     const prevBlockType = this.parent.prevBlockHandler.serializer.blockType;
  //     if (this.supportedMergeBlock[prevBlockType]) {
  //       e.preventDefault();
  //       return true;
  //     }
  //   }
  // }
}
