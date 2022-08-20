import {
  renderInlineElement,
  serializeInlineElement,
} from "../../Inlines/serializer";
import { InlineElement } from "../../Inlines/types";
import { HTMLElementTagName } from "../../types/dom";
import { Noticable } from "../../types/noticable";
import { dom, time } from "../../utils";
import { createElement } from "../../utils/contrib";
import { ABCBlockElement, ElementProps, ElementState } from "../aBlock";
import { BlockHandler } from "../aBlock/handler";
import { TextContent } from "../types";
import { ABCTextHandler } from "./handler";

export interface SerializeMessage {
  insert?: boolean;
  activate?: boolean;
}
export interface ABCTextProps extends ElementProps {
  className?: string;
}
export interface ABCTextState extends ElementState {
  activate?: boolean;
}

export class ABCText<
  P extends ABCTextProps,
  S extends ABCTextState
> extends ABCBlockElement<P, S> {
  elementType: "text" | "list" | "card" = "text";
  public get data(): TextContent {
    const data = this.state.data;
    return data[data.type] as TextContent;
  }

  public get handlerType(): typeof BlockHandler {
    return ABCTextHandler;
  }

  renderInner(): Node[] {
    const [nodes, noticables] = renderInlineElement(this.data.children);
    this.pushNotify(...noticables);
    return nodes;
  }
}
