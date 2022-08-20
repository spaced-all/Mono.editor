import produce from "immer";
import {
  renderInlineElement,
  serializeInlineElement,
} from "../../Inlines/serializer";
import { HTMLElementTagName } from "../../types/dom";
import { Noticable } from "../../types/noticable";
import { Renderable } from "../../types/renderable";
import { dom, time } from "../../utils";
// import { HTMLElementTagName } from "Types/dom";

import { createElement } from "../../utils/contrib";
import { BlockType, DefaultBlockInfo, MetaInfo, OrderString } from "../types";
import { BlockHandler } from "./handler";

export interface SerializeMessage {
  insert?: boolean;
  activate?: boolean;
}
export interface ElementProps {
  initialData?: DefaultBlockInfo;
  metaInfo: MetaInfo;
  className?: string;
}
export interface ElementState {
  activate?: boolean;
  data: DefaultBlockInfo;
}

export interface ABCBlockStatic {
  elName: string;
}

export class ABCBlockElement<
  P extends ElementProps,
  S extends ElementState
> extends Renderable {
  props: P;
  state: S;
  root: HTMLDivElement;
  outer: HTMLElement;
  handler: BlockHandler;

  static elName: string = null;
  blockType: string = null;
  elementType: "text" | "list" | "card";

  serialize() {}

  public get order(): OrderString {
    return this.state.data.order;
  }

  serializeBlockInfo(): DefaultBlockInfo {
    return produce(this.state.data, (draft) => {
      draft[draft.type] = this.serialize() as any;
      draft.lastEditTime = time.getTime();
    });
  }

  constructor(props: ElementProps) {
    super();
    this.root = null;
    this.props = props as P;
    this.state = {
      activate: false,
      data: props.initialData || {},
    } as S;

    this.handler = new this.handlerType(this);
    this.render();
  }

  public get defaultClassName(): string {
    return undefined;
  }

  public get contentEditableName(): HTMLElementTagName {
    return undefined;
  }

  protected get style(): CSSStyleDeclaration | undefined {
    return null;
  }

  public get placeholder(): string | undefined {
    return undefined;
  }

  componentDidMount(): void {
    this.root.innerHTML = "";
    const outer = this.renderOuter();
    this.renderInner().forEach((c) => outer.appendChild(c));
    this.root.appendChild(this.wrapContainer(outer));
  }

  renderInner(): Node[] {
    return [];
  }

  renderOuter() {
    const outer = createElement(this.contentEditableName, {
      attributes: {
        "data-placeholder": this.placeholder,
      },
    });
    this.outer = outer;
    return outer;
  }

  wrapContainer(el: HTMLElement) {
    return el;
  }

  public get handlerType(): typeof BlockHandler {
    return BlockHandler;
  }

  renderRoot() {
    const root = createElement("div", {
      className: [
        "block",
        `block-${this.props.metaInfo.type}`,
        this.props.className,
        this.defaultClassName,
      ]
        .filter((c) => c)
        .join(" "),
      attributes: {
        "data-block-uri": this.props.metaInfo.id,
        "data-block-type": this.props.metaInfo.type,
        "data-order": this.props.metaInfo.order,
        block: "",
      },
      // handler: this.handler,
    });
    return root;
  }

  render(): HTMLDivElement {
    if (!this.root) {
      this.root = this.renderRoot();
    }

    return this.root;
  }
}
