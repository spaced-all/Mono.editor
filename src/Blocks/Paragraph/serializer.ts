import {
  renderInlineElement,
  serializeInlineElement,
} from "../../Inlines/serializer";

import { HTMLElementTagName } from "../../types/dom";
import { dom, time } from "../../utils";

import { BlockHandler } from "../aBlock/handler";
import { DefaultBlockInfo, ParagraphData } from "../types";
import { ParagraphHandler } from "./handler";
import produce from "immer";
import { ABCText, ABCTextProps, ABCTextState } from "../aText";

export interface SerializeMessage {
  insert?: boolean;
  activate?: boolean;
}
export interface ParagraphProps extends ABCTextProps {
  className?: string;
}
export interface ParagraphState extends ABCTextState {
  activate?: boolean;
}

export class Paragraph extends ABCText<ParagraphProps, ParagraphState> {
  static elName: string = "paragraph";
  blockType: string = "paragraph";
  static deserialize(el: HTMLLabelElement) {}

  public get contentEditableName(): HTMLElementTagName {
    return "p";
  }

  public get placeholder(): string | undefined {
    return "Type '/' for commands";
  }

  public get data(): ParagraphData {
    return this.state.data.paragraph;
  }

  public get handlerType(): typeof BlockHandler {
    return ParagraphHandler;
  }

  serialize(): ParagraphData {
    const newData = produce(this.data, (draft) => {
      draft.children = serializeInlineElement(dom.validChildNodes(this.outer));
      draft.lastEditTime = time.getTime();
    });
    return newData;
  }
}
