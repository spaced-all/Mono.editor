import { Handler } from "../../types/eventHandler";
import { dom } from "../../utils";
import { PageHandler } from "../../Wraps/pageHandler";
import { EditableType, ElementType, OrderString } from "../types";
import { ABCBlockElement, ElementProps, ElementState } from "./serializer";

export class BlockHandler extends Handler {
  parent: PageHandler;
  serializer: ABCBlockElement<ElementProps, ElementState>;

  public get order(): OrderString {
    return this.serializer.order;
  }

  public get elementType(): ElementType {
    return this.serializer.elementType;
  }

  markdownize(): string {
    return "";
  }

  currentEditable(): HTMLElement {
    return this.serializer.outer;
  }

  lastEditable(): HTMLElement {
    return this.serializer.outer;
  }
  firstEditable(): HTMLElement {
    return this.serializer.outer;
  }

  getEditableType(el: HTMLElement): EditableType {
    return "content";
  }

  selectElementEditable(el: HTMLElement) {}
  activeElementEditable(el: HTMLElement) {}


  getEditableByNode(node: Node): HTMLElement {
    if (dom.isParent(node, this.serializer.outer)) {
      return this.serializer.outer;
    }
    return null;
  }

  handleTabDown(e: KeyboardEvent): boolean | void {}

  isCursorLeft() {
    return dom.isCursorLeft(this.currentEditable());
  }

  isCursorRight() {
    return dom.isCursorRight(this.currentEditable());
  }

  deleteSelecte() {
    document.getSelection().getRangeAt(0).deleteContents();
    let pos = dom.currentPosition(this.currentEditable());
    pos = this.parent.richhint.safePosition(pos);
    dom.setPosition(pos);
  }

  appendElements(node: Node[], el?: HTMLElement) {
    if (!el) {
      el = this.currentEditable();
    }
    el.append(...node);
  }
  appendElementsAtLast(node: Node[]) {
    this.appendElements(node, this.lastEditable());
  }
}
