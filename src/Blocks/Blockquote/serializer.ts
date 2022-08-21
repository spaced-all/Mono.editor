import produce from "immer";
import {
  renderInlineElement,
  serializeInlineElement,
} from "../../Inlines/serializer";
import { InlineElement } from "../../Inlines/types";
import { HTMLElementTagName } from "../../types/dom";
import { dom, time } from "../../utils";
import { createElement } from "../../utils/contrib";
import { ABCBlockElement, ElementProps, ElementState } from "../aBlock";
import { BlockHandler } from "../aBlock/handler";
import { ABCText, ABCTextProps, ABCTextState } from "../aText";
import { BlockQuoteData } from "../types";
import { BlockquoteHandler } from "./handler";

export interface SerializeMessage {
  insert?: boolean;
  activate?: boolean;
}
export interface BlockQuoteProps extends ABCTextProps {
  className?: string;
}
export interface BlockQuoteState extends ABCTextState {
  activate?: boolean;
}

export class BlockQuote extends ABCText<BlockQuoteProps, BlockQuoteState> {
  static elName: string = "blockquote";
  readonly blockType: string = "blockquote";

  public get contentEditableName(): HTMLElementTagName {
    return "p";
  }

  public get data(): BlockQuoteData {
    return this.state.data.blockquote;
  }

  public get handlerType(): typeof BlockquoteHandler {
    return BlockquoteHandler;
  }

  renderWrapper(el: HTMLElement): HTMLElement {
    return createElement("blockquote", {
      children: [el],
    });
  }

  serialize(): BlockQuoteData {
    const newData = produce(this.data, (draft) => {
      draft.children = serializeInlineElement(dom.validChildNodes(this.outer));
      draft.lastEditTime = time.getTime();
    });
    return newData;
  }
}
