import produce from "immer";
import { serializeInlineElement } from "../../Inlines/serializer";
import { dom, time } from "../../utils";
import { createElement } from "../../utils/contrib";
import { BlockHandler } from "../aBlock/handler";
import { DefaultBlockInfo, IndentItem } from "../types";

import { ABCList } from "./serializer";

export class ABCListHandler extends BlockHandler {
  serializer: ABCList<any, any>;
  currentContainer(): HTMLLIElement {
    const li = dom.findParentMatchTagName(
      document.getSelection().focusNode,
      "li",
      this.serializer.outer
    );
    return li as HTMLLIElement;
  }

  prevContainer(el: HTMLElement): HTMLElement {
    return this.prevRow(el);
  }
  nextContainer(el: HTMLElement): HTMLElement {
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
  lastContainer(): HTMLElement {
    return this.serializer.outer.querySelector("li:last-child");
  }
  firstContainer(): HTMLElement {
    return this.serializer.outer.querySelector("li:first-child");
  }

  removeContainer(el: HTMLElement) {
    if (el.parentElement !== this.serializer.outer) {
      return false;
    }
    el.remove();
    this.serializer.updateValue();
  }

  hasContainer() {
    return this.firstContainer() !== null;
  }

  containers(): HTMLElement[] {
    const res = [];
    this.serializer.outer.querySelectorAll("li").forEach((c) => res.push(c));
    return res;
  }

  appendContainer(...el: HTMLElement[]) {
    el.forEach((c) => {
      if (dom.isTag(c, "li")) {
        this.serializer.appendContainerChild(c);
      }
    });
    this.serializer.updateValue();
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
      return [this.currentContainer()];
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

  changeIndent(offset) {
    const els = this.selectedContainer();

    for (const el of els) {
      let level = parseFloat(el.getAttribute("data-level")) + offset;
      level = Math.max(Math.min(level, 9), 1);
      this.serializer.updateLi(el as any as HTMLLIElement, level);
    }
    this.serializer.updateValue();
  }

  handleBackspaceDown(e: KeyboardEvent): boolean | void {
    if (this.isSelectedMultiContainer()) {
      e.preventDefault();
      const els = this.selectedContainer();
      const startEl = els[0];
      const level = parseFloat(startEl.getAttribute("data-level"));
      const index = parseFloat(startEl.getAttribute("data-index"));

      const newLi = this.serializer.createLi(level, index);
      els[0].parentElement.insertBefore(newLi, els[0]);

      this.deleteSelecte();
      this.serializer.updateValue();
      // const remains: ContentItem[] = [];
      // const indexs: number[] = [];
      let offset: number = 0;
      els.forEach((el, ind) => {
        if (el.parentElement) {
          if (ind === 0) {
            offset = dom.getContentSize(el);
          }

          newLi.append(...el.childNodes);
          // remains.push(...serializeInlineElement(dom.validChildNodes(el)));
          el.remove();
        }
        // indexs.push(parseFloat(el.getAttribute("data-index")));
      });
      dom.setCaretReletivePosition(newLi, offset);
      // let pos = dom.currentPosition(newLi);
      // pos = this.parent.richhint.safePosition(pos);
      // dom.setPosition(pos);
      this.parent.richhint.autoUpdate({ root: newLi });
      this.serializer.updateValue();
      return true;
    }

    if (this.isCursorLeft()) {
      e.preventDefault();
      const el = this.currentContainer();
      const level = parseFloat(el.getAttribute("data-level"));
      const index = parseFloat(el.getAttribute("data-index"));
      if (level === 1) {
        const block = this.serializer.serializeBlockInfo();
        const lastEditTime = time.getTime();

        let prev: DefaultBlockInfo,
          next: DefaultBlockInfo,
          focus: DefaultBlockInfo;

        const items: IndentItem[] = block[block.type as "list"].items;
        focus = {
          type: "paragraph",
          order: block.order,
          paragraph: {
            kind: "paragraph",
            lastEditTime: lastEditTime,
            children: items[index].children,
          },
          lastEditTime: lastEditTime,
        };

        if (index > 0) {
          prev = produce(block, (draft) => {
            const data = draft[draft.type as "list"];
            data.items = data.items.slice(0, index);
            data.lastEditTime = lastEditTime;
            draft.order = "";
            draft.lastEditTime = lastEditTime;
          });
        }
        if (index < items.length - 1) {
          next = produce(block, (draft) => {
            const data = draft[draft.type as "list"];
            data.items = data.items.slice(index + 1);
            data.lastEditTime = lastEditTime;
            draft.order = "";
            draft.lastEditTime = lastEditTime;
          });
        }
        this.parent.propgateSplit({
          order: this.serializer.order,
          focus: focus,
          prev: prev,
          next: next,
        });
      } else {
        this.changeIndent(-1);
      }
      return true;
    }
  }

  handleTabDown(e: KeyboardEvent): boolean | void {
    if (e.shiftKey) {
      this.changeIndent(-1);
    } else {
      this.changeIndent(1);
    }
    e.preventDefault();
    return true;
  }
  handleEnterDown(e: KeyboardEvent): boolean | void {
    if (e.shiftKey) {
      const lastEditTime = time.getTime();
      const newBlock: DefaultBlockInfo = {
        type: "paragraph",
        order: "",
        paragraph: {
          kind: "paragraph",
          children: [],
          lastEditTime: lastEditTime,
        },
        lastEditTime: lastEditTime,
      };
      this.parent.propgateNew({
        order: this.serializer.order,
        block: newBlock,
        offset: 0,
      });
      e.preventDefault();
      return true;
    }

    if (this.isSelectedMultiContainer()) {
      const els = this.selectedContainer();
      const startEl = els[0];
      const level = parseFloat(startEl.getAttribute("data-level"));
      const index = parseFloat(startEl.getAttribute("data-index"));
      const newLi = this.serializer.createLi(level, index);
      els[0].parentElement.insertBefore(newLi, els[0]);

      this.deleteSelecte();

      const indexs: number[] = [];
      let offset: number = 0;
      els.forEach((el, ind) => {
        if (el.parentElement) {
          if (ind === 0) {
            offset = dom.getContentSize(el);
          }
          newLi.append(...dom.validChildNodes(el));
          el.remove();
        }
        indexs.push(parseFloat(el.getAttribute("data-index")));
      });
    } else {
      this.deleteSelecte();
    }
    this.parent.richhint.remove();

    const leftFrag = dom.validChildNodes(
      dom.cloneFragmentsBefore(this.currentContainer())
    );
    const rightFrag = dom.validChildNodes(
      dom.cloneFragmentsAfter(this.currentContainer())
    );
    const cur = this.currentContainer();
    const level = parseFloat(cur.getAttribute("data-level"));

    this.serializer.updateLi(cur, null, null, null, leftFrag);
    const newLi = this.serializer.createLi(level, null, null, rightFrag);
    cur.insertAdjacentElement("afterend", newLi);
    dom.setCaretReletivePosition(newLi, 0);

    this.serializer.updateValue();
    this.parent.richhint.autoUpdate({ root: newLi });
  }

  handleDeleteDown(e: KeyboardEvent): boolean | void {
    console.log(e);
    if (this.isCursorRight()) {
      e.preventDefault();
      const cur = this.currentContainer();
      const next = this.nextContainer(cur);
      if (next) {
        this.parent.richhint.remove();
        console.log(dom.currentPosition(cur));
        this.deleteSelecte();
        cur.append(...next.childNodes);
        next.remove();
        this.serializer.updateValue();
        console.log(dom.currentPosition(cur));
        let pos = this.parent.richhint.safePosition(dom.currentPosition(cur));
        dom.setPosition(pos);
        this.parent.richhint.autoUpdate({ root: cur });
      } else {
        this.parent.propgateMerge({
          order: this.serializer.order,
          elementType: "list",
          mergeType: "delete",
        });
      }
      return true;
    }
  }
}
