import { renderInlineElement } from "../../Inlines/serializer";
import { HTMLElementTagName } from "../../types/dom";
import { Noticable } from "../../types/noticable";
import { Renderable } from "../../types/renderable";
// import { HTMLElementTagName } from "Types/dom";

import { createElement } from "../../utils/contrib";
import { BlockType } from "../types";

export interface SerializeMessage {
  insert?: boolean;
  activate?: boolean;
}
export interface ElementProps {
  initialData?: BlockType;
  className?: string;
}
export interface ElementState {
  activate?: boolean;
  data: BlockType;
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

  static elName: string = null;
  static deserialize(el: HTMLLabelElement) {}

  constructor(props: ElementProps) {
    super();
    this.root = null;
    this.props = props as P;
    this.state = {
      activate: false,
      data: props.initialData || {},
    } as S;

    this.handleClick = this.handleClick.bind(this);
    this.render();
  }

  public get defaultClassName(): string {
    return "";
  }
  public get contentEditableName(): HTMLElementTagName {
    return "p";
  }

  protected get style(): CSSStyleDeclaration | undefined {
    return null;
  }

  public get placeholder(): string | undefined {
    return undefined;
  }

  componentDidMount(): void {}

  handleClick(e: MouseEvent) {}

  renderInner(): Node[] {
    return [];
  }

  renderContentEditable() {
    return createElement(this.contentEditableName, {
      attributes: {
        "data-placeholder": this.placeholder,
      },
    });
  }

  render(): HTMLDivElement {
    if (this.root) {
      const root = createElement("div", {
        className: [this.props.className, this.defaultClassName].join(" "),
        attributes: {},
      });

      this.root = root;
    }

    return this.root;
  }
}
