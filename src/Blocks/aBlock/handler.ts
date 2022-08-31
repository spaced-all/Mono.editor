import { Snapshot } from "../../operator/history";
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
    const node = document.getSelection().focusNode;
    return this.getEditableByNode(node);
  }

  /** */
  /**
   *
   * @returns get last editable item in this block
   */
  lastEditable(): HTMLElement {
    return this.serializer.outer;
  }
  /**
   *
   * @returns get first editable item in this block
   */
  firstEditable(): HTMLElement {
    return this.serializer.outer;
  }

  /**
   * @param el An editable item in this block.
   *  Use getEditableByNode(el) to find editable parent of children node.
   * @returns get next editable item after el
   *  For Text block, there is not next editable
   *  For List block, nextEditable is equal with nextRow
   *  For Table block, nextEditable of el is the neighbor table cell
   *  For Card block, define as you like.
   */
  nextEditable(el: HTMLElement): HTMLElement {
    if (this.serializer.outer === el) {
      return null;
    }
  }
  /**
   * Get previous editable item before el.
   */
  prevEditable(el: HTMLElement): HTMLElement {
    if (this.serializer.outer === el) {
      return null;
    }
  }
  /**
   *
   * @param el
   * @returns
   */
  prevRow(el: HTMLElement): HTMLElement {
    return this.prevEditable(el);
  }
  nextRow(el: HTMLElement): HTMLElement {
    return this.nextEditable(el);
  }

  getEditableIndex(el): number[] {
    return [0];
  }

  getEditableByIndex(...index: number[]): HTMLElement {
    return this.serializer.outer;
  }
  getEditableByNode(node: Node): HTMLElement {
    if (dom.isParent(node, this.serializer.outer)) {
      return this.serializer.outer;
    }
    return null;
  }
  getEditableType(el: HTMLElement): EditableType {
    return "content";
  }

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

  handleRedo(e: Snapshot): boolean | void {}
  handleUndo(e: Snapshot): boolean | void {}

  restore(e: Snapshot) {
    if (e.data) {
      this.serializer.updateData(e.data);
      this.serializer.rerender();

      const cur = this.getEditableByIndex(...e.index);
      dom.setCaretReletivePosition(cur, e.start);
    }
  }
}
