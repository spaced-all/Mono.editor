import produce from "immer";
import {
  renderInlineElement,
  serializeInlineElement,
} from "../../Inlines/serializer";

import { HTMLElementTagName } from "../../types/dom";
import { Noticable } from "../../types/noticable";
import { dom, time } from "../../utils";
import { ABCBlockElement, ElementProps, ElementState } from "../aBlock";
import { BlockHandler } from "../aBlock/handler";
import { ABCText, ABCTextProps, ABCTextState } from "../aText";
import { HeadingData } from "../types";
import { HeadingHandler } from "./handler";

export interface SerializeMessage {
  insert?: boolean;
  activate?: boolean;
}
export interface HeadingProps extends ABCTextProps {
  className?: string;
}
export interface HeadingState extends ABCTextState {
  activate?: boolean;
}

export class Heading extends ABCText<HeadingProps, HeadingState> {
  static elName: string = "heading";
  blockType: string = "heading";

  public get contentEditableName(): HTMLElementTagName {
    return `h${this.level}` as "h1" | "h2" | "h3" | "h4" | "h5";
  }

  public get level(): number {
    return this.data.level;
  }

  public get data(): HeadingData {
    return this.state.data.heading;
  }

  public get handlerType(): typeof HeadingHandler {
    return HeadingHandler;
  }

  updateLevel(level: number) {
    this.data.level = level;
    const oldOuter = this.outer;
    const newOuter = this.renderOuter();
    newOuter.append(...oldOuter.childNodes);
    oldOuter.replaceWith(newOuter);
  }

  serialize(): HeadingData {
    const newData = produce(this.data, (draft) => {
      draft.children = serializeInlineElement(dom.validChildNodes(this.outer));
      draft.lastEditTime = time.getTime();
    });
    return newData;
  }
}
