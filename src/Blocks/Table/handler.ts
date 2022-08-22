import produce from "immer";
import { serializeInlineElement } from "../../Inlines/serializer";
import { dom, time } from "../../utils";
import { createElement } from "../../utils/contrib";
import { BlockHandler } from "../aBlock/handler";
import { DefaultBlockInfo, IndentItem } from "../types";

import { Table } from "./serializer";

export class TableHandler extends BlockHandler {
  serializer: Table;

  public get outer(): HTMLTableElement {
    return this.serializer.outer as HTMLTableElement;
  }

  currentEditable(): HTMLTableCellElement {
    const td = dom.findParentMatchTagName(
      document.getSelection().focusNode,
      "td",
      this.serializer.outer
    );
    return td as HTMLTableCellElement;
  }

  prevEditable(el: HTMLElement): HTMLElement {
    const prev = el.previousElementSibling as HTMLElement;
    if (prev) {
      return prev;
    } else {
      if (el.parentElement.previousElementSibling) {
        return el.parentElement.previousElementSibling.lastChild as HTMLElement;
      }
      return null;
    }
  }
  nextEditable(el: HTMLElement): HTMLElement {
    const next = el.nextElementSibling as HTMLElement;
    if (next) {
      return next;
    } else {
      if (el.parentElement.nextElementSibling) {
        return el.parentElement.nextElementSibling.firstChild as HTMLElement;
      }
      return null;
    }
  }
  prevRow(el: HTMLElement): HTMLElement {
    const index = dom.indexOfNode(el);
    if (el.parentElement.previousElementSibling) {
      return el.parentElement.previousElementSibling.childNodes[
        index
      ] as HTMLElement;
    }
    return null;
  }
  nextRow(el: HTMLElement): HTMLElement {
    const index = dom.indexOfNode(el);
    if (el.parentElement.nextElementSibling) {
      return el.parentElement.nextElementSibling.childNodes[
        index
      ] as HTMLElement;
    }
    return null;
  }

  lastEditable(): HTMLElement {
    return (this.outer.lastChild as HTMLElement).querySelector("td:last-child");
  }
  firstEditable(): HTMLElement {
    return (this.outer.firstChild as HTMLElement).querySelector(
      "td:first-child"
    );
  }

  hasContainer() {
    return this.firstEditable() !== null;
  }

  containers(): HTMLElement[] {
    const res = [];
    this.serializer.outer.querySelectorAll("li").forEach((c) => res.push(c));
    return res;
  }

  isSelectedMultiContainer(): boolean {
    if (document.getSelection().isCollapsed) {
      return false;
    }

    const range = document.getSelection().getRangeAt(0);
    const start = dom.findParentMatchTagName(
      range.startContainer,
      "li",
      this.serializer.outer
    );
    const end = dom.findParentMatchTagName(
      range.endContainer,
      "li",
      this.serializer.outer
    );
    return start !== end;
  }

  selectedContainer(): HTMLElement[] {
    if (!this.isSelectedMultiContainer()) {
      return [this.currentEditable()];
    }
    const range = document.getSelection().getRangeAt(0);
    const start = dom.findParentMatchTagName(
      range.startContainer,
      "li",
      this.serializer.outer
    );
    const end = dom.findParentMatchTagName(
      range.endContainer,
      "li",
      this.serializer.outer
    );
    const res = [];
    let cur = start;
    while (cur !== end) {
      res.push(cur);
      cur = this.nextRow(cur);
    }
    res.push(cur);
    return res;
  }

  handleBackspaceDown(e: KeyboardEvent): boolean | void {
    // return true;
  }

  handleTabDown(e: KeyboardEvent): boolean | void {
    e.preventDefault();
    if (e.shiftKey) {
      this.parent.propagateWalkEditable({
        current: this.currentEditable(),
        direction: "prev",
        handler: this,
      });
    } else {
      this.parent.propagateWalkEditable({
        current: this.currentEditable(),
        direction: "next",
        handler: this,
      });
    }
    return true;
  }
  handleEnterDown(e: KeyboardEvent): boolean | void {
    e.preventDefault();
    this.parent.propagateWalkEditable({
      current: this.currentEditable(),
      direction: "nextRow",
      handler: this,
    });
    return true;
  }

  handleDeleteDown(e: KeyboardEvent): boolean | void {
    return true;
  }
}
