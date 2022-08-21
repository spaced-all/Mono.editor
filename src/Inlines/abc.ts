import { Renderable } from "../types/renderable";
import { createElement } from "../utils/contrib";
import { ExtendInlineComponent } from "./types";

export interface SerializeMessage {
  // stage: "insert" | "serialize" | "other";
  insert?: boolean;
  serialize?: boolean;
  activate?: boolean;
}
export interface ElementProps {
  message?: SerializeMessage;
  initialData?: ExtendInlineComponent;
}
export interface ElementState {
  activate?: boolean;
  data: ExtendInlineComponent;
}

export interface ABCInlineStatic {
  elName: string;
  shortcut: string;
}

export interface ABCInlineConstrutor<P extends ElementProps> {
  constructor(props: P);
}

export class ABCInline<
  P extends ElementProps,
  S extends ElementState
> extends Renderable {
  props: P;
  state: S;
  root: HTMLLabelElement;

  static elName: string = null;
  static shortcut: string = null;

  constructor(props: P) {
    super();
    this.root = null;
    this.props = props as P;
    this.state = {
      activate: false,
      data: props.initialData || {},
    } as S;

    this.handleClick = this.handleClick.bind(this);
  }

  rootDidMount(): void {}

  handleClick(e: MouseEvent) {}

  renderRoot(): HTMLElement {
    const root = createElement("label", {});
    root.contentEditable = "false";
    root.addEventListener("click", this.handleClick);
    return root;
  }
}

export class DefaultInline extends ABCInline<ElementProps, ElementState> {}
