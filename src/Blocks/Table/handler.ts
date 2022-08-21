import produce from "immer";
import { serializeInlineElement } from "../../Inlines/serializer";
import { dom, time } from "../../utils";
import { createElement } from "../../utils/contrib";
import { BlockHandler } from "../aBlock/handler";
import { DefaultBlockInfo, IndentItem } from "../types";

import { Table } from "./serializer";

export class TableHandler extends BlockHandler {
  serializer: Table;
  currentEditable(): HTMLLIElement {
    const li = dom.findParentMatchTagName(
      document.getSelection().focusNode,
      "li",
      this.serializer.outer
    );
    return li as HTMLLIElement;
  }

  prevEditable(el: HTMLElement): HTMLElement {
    return this.prevRow(el);
  }
  nextEditable(el: HTMLElement): HTMLElement {
    return this.nextRow(el);
  }
  prevRow(el: HTMLElement): HTMLElement {
    const prev = el.previousElementSibling as HTMLElement;
    if (prev) {
      return prev;
    } else {
      return null;
    }
  }
  nextRow(el: HTMLElement): HTMLElement {
    const next = el.nextElementSibling as HTMLElement;
    if (next) {
      return next;
    } else {
      return null;
    }
  }
  lastEditable(): HTMLElement {
    return this.serializer.outer.querySelector("li:last-child");
  }
  firstEditable(): HTMLElement {
    return this.serializer.outer.querySelector("li:first-child");
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
    return true;
  }

  handleTabDown(e: KeyboardEvent): boolean | void {
    return true;
  }
  handleEnterDown(e: KeyboardEvent): boolean | void {
    return true;
  }

  handleDeleteDown(e: KeyboardEvent): boolean | void {
    return true;
  }
}
