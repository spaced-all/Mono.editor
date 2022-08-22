import { renderInlineElement } from "../../Inlines/serializer";
import { InlineElement } from "../../Inlines/types";
import { HTMLElementTagName } from "../../types/dom";
import { createElement } from "../../utils/contrib";
import { ABCBlockElement, ElementProps, ElementState } from "../aBlock";
import { ElementType, EquationData } from "../types";

import { EquationHandler } from "./handler";
import { dom, latex } from "../../utils";
import { Renderable } from "../../types/renderable";

export interface SerializeMessage {
  insert?: boolean;
  activate?: boolean;
}
export interface EquationProps extends ElementProps {
  className?: string;
}
export interface EquationState extends ElementState {
  activate?: boolean;
}

export class Equation extends ABCBlockElement<EquationProps, EquationState> {
  constructor(props: EquationProps) {
    super(props);
  }

  static elName: string = "equation";
  readonly blockType: string = "equation";
  elementType: ElementType = "card";

  display: HTMLElement;
  caption: HTMLElement;
  edit: HTMLTextAreaElement;
  public get contentEditableName(): HTMLElementTagName {
    return "p";
  }

  public get placeholder(): string | undefined {
    return undefined;
  }

  public get data(): EquationData {
    return this.state.data.equation;
  }

  public get equation(): string {
    return this.data.equation;
  }

  public get handlerType(): typeof EquationHandler {
    return EquationHandler;
  }

  childrenDidMount(): void {}

  renderInner(): [Node[], Renderable[]] {
    const display = createElement("pre");

    const caption = createElement("small");

    let renderables = [];
    let nodes = [];
    if (this.data.caption) {
      [nodes, renderables] = renderInlineElement(this.data.caption);
      nodes.forEach((c) => caption.appendChild(c));
    }

    const edit = createElement("textarea");
    edit.style.display = "none";
    latex.generateHTML(this.equation, display, true);
    this.display = display;
    this.caption = caption;
    this.edit = edit;

    return [[this.display, this.edit, this.caption], []];
  }
  renderOuter(): HTMLElement {
    const outer = super.renderOuter();
    // outer.contentEditable = "false";
    return outer;
  }
}
