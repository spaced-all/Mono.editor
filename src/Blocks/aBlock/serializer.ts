import produce from "immer";
import { HTMLElementTagName } from "../../types/dom";

import { Renderable } from "../../types/renderable";
import { dom, time } from "../../utils";

import { createElement } from "../../utils/contrib";
import { DefaultBlockInfo, ElementType, MetaInfo, OrderString } from "../types";
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

  constructor(props: ElementProps) {
    super();
    this.root = null;
    this.props = props as P;
    this.state = {
      data: props.initialData || {},
    } as S;

    this.handler = new this.handlerType(this);
  }

  static elName: string = null;
  readonly blockType: string = null;
  elementType: ElementType;

  public get order(): OrderString {
    return this.state.data.order;
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

  public get handlerType(): typeof BlockHandler {
    return BlockHandler;
  }

  serialize() {}

  serializeBlockInfo(): DefaultBlockInfo {
    return produce(this.state.data, (draft) => {
      draft[draft.type] = this.serialize() as any;
      draft.lastEditTime = time.getTime();
    });
  }

  rootDidMount(): void {}

  renderInner(): [Node[], Renderable[]] {
    return [[], []];
  }

  renderOuter(): HTMLElement {
    const outer = createElement(this.contentEditableName, {
      attributes: {
        "data-placeholder": this.placeholder,
      },
    });
    this.outer = outer;
    return outer;
  }

  renderWrapper(el: HTMLElement): HTMLElement {
    return el;
  }

  renderChildren(): [Node[], Renderable[]] {
    const outer = this.renderOuter();
    this.outer = outer;
    const [children, renderables] = this.renderInner();
    children.forEach((c) => outer.appendChild(c));
    return [[this.renderWrapper(outer)], renderables];
  }

  renderRoot() {
    const root = createElement("div", {
      className: [
        "mono-block",
        `mono-block-${this.props.metaInfo.type}`,
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
    });
    return root;
  }
}
