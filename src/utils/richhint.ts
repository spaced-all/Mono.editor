// import { Caret, Position } from "./types";

import { dom } from ".";
import { RelPosition } from "../operator/types";

// import React, { useDebugValue } from "react";

const whiteSpace = "";

const leftTag = {
  // 'p': "",
  // 'td': "'",
  // 'li': "",
  a: "[",
  b: "**",
  i: "*",
  s: "-",
  u: "\u00a0",
  code: "`",
  em: "\u00a0",
  // 'span': " ",
  // 'h1': '\u00a0',
  // 'h2': '\u00a0',
  // 'h3': '\u00a0',
  // 'h4': '\u00a0',
  // 'h5': '\u00a0',
  default: "\u00a0",
};

const rightTag = {
  // 'p': "\u00a0",
  // 'li': "",
  // 'td': "'",
  a: "]",
  b: "**",
  i: "*",
  s: "~",
  u: "\u00a0",
  em: "\u00a0",
  // 'ul': '',
  // 'ol': '',
  code: "`",
  // 'span': " ",
  // 'h1': '\u00a0',
  // 'h2': '\u00a0',
  // 'h3': '\u00a0',
  // 'h4': '\u00a0',
  // 'h5': '\u00a0',
  default: "\u00a0",
};

function createSpan(...className: string[]) {
  const span = document.createElement("span");
  className.forEach((item) => span.classList.add(item));
  return span;
}

export class ABCRichHint {
  hintStyle(el: HTMLElement) {}
  hintSpace(el: Text) {}
  _safeOffset(
    container: Node,
    offset: number,
    type: "left" | "right" | "inner" = "inner"
  ) {}
  safeMousePosition() {}
  safePosition(pos: RelPosition) {}
  autoUpdate(kwargs) {}
  _removeElementl(...el: HTMLElement[]) {}
  removeText() {}
  remove() {}
}

export type RichHintType<T extends ABCRichHint> = T;

/**
 * to display current user caret element bound
 */
export class RichHint extends ABCRichHint {
  ref: Text | HTMLLabelElement;
  left: HTMLSpanElement;
  right: HTMLSpanElement;
  blockRight: HTMLSpanElement;

  leftText: HTMLSpanElement;
  rightText: HTMLSpanElement;
  text: Text;
  disable: boolean;
  label: HTMLLabelElement;
  static _instance = null;

  constructor() {
    super();
    this.disable = false;
    this.blockRight = createSpan("bount-hint-block-right", "bound-hint");
    // this.blockRight.textContent = "\u00a0";
    this.left = createSpan("bound-hint-left", "bound-hint");
    this.right = createSpan("bound-hint-right", "bound-hint");
    this.leftText = createSpan(
      "bound-hint-left",
      "bound-hint",
      "bound-hint-text"
    );
    this.leftText.textContent = "\u00a0";
    this.rightText = createSpan(
      "bound-hint-right",
      "bound-hint",
      "bound-hint-text"
    );
    this.rightText.textContent = "\u00a0";
    this.label = null;
    this.text = dom.makeText(" ");
    this.ref = null;
    if (RichHint._instance) {
      return RichHint._instance;
    }
    RichHint._instance = this;
  }

  isRichHint(el: HTMLElement) {
    return dom.isTag(el, "span") && el.classList.contains("bound-hint");
  }
  bind() {
    this.disable = false;
  }
  unbind() {
    this.disable = true;
    this.remove();
  }

  /**
   * **bold *italic*| **
   * **bold italic  | **
   *  ↑            ↑   ↑
   * style        space
   * hint         hint
   */
  hintStyle(el: HTMLElement) {
    const styleName = dom.getTagName(el);
    if (leftTag[styleName]) {
      this.left.textContent = leftTag[styleName];
      this.right.textContent = rightTag[styleName];
      el.insertBefore(this.left, el.firstChild);
      el.appendChild(this.right);
      console.log([this.left.textContent, el]);
    } else {
      this._removeElementl(this.left, this.right);
    }
  }

  specilize(el: HTMLElement) {
    // console.log(["specilize", el]);
    switch (dom.getTagName(el)) {
      case "em":
        if (el.classList.contains("em-blank")) {
          el.classList.replace("em-blank", "em-blank-open");
        }
        break;
      case "label":
        el.classList.add("label-keyboard-hover");
        break;
    }
  }
  restoreNormal(el: HTMLElement) {
    if (!el) {
      return;
    }
    if (el instanceof Text) {
      el = el.parentElement;
    }
    // console.log(["restore", el]);
    switch (dom.getTagName(el)) {
      case "em":
        if (el.classList.contains("em-blank-open")) {
          el.classList.replace("em-blank-open", "em-blank");
        }
        break;
      case "label":
        el.classList.remove("label-keyboard-hover");
        break;
    }
  }

  hintSpace(el: Text) {
    const left = dom.firstNeighborTextNode(el);
    const right = dom.lastNeighborTextNode(el);
    // console.log([left.textContent, right.textContent]);
    if (dom.previousValidNode(left) && left.previousSibling !== this.left) {
      this.leftText.textContent = "\u00a0";
      left.parentElement.insertBefore(this.leftText, left);
    } else {
      this._removeElementl(this.leftText);
    }

    if (dom.nextValidNode(right) && right.nextSibling !== this.right) {
      this.rightText.textContent = "\u00a0";
      right.parentElement.insertBefore(this.rightText, right.nextSibling);
    } else {
      this._removeElementl(this.rightText);
    }
  }

  _safeOffset(
    container: Node,
    offset: number,
    type: "left" | "right" | "inner" = "inner"
  ) {
    let newContainer, newOffset;
    if (dom.isTag(container, "#text") || dom.isTag(container, "label")) {
      return { container, offset };
    }

    newOffset = 0;
    if (!container.childNodes[offset]) {
      if (dom.isTag(dom.lastValidChild(container), "#text")) {
        newContainer = dom.lastValidChild(container);
        newOffset = newContainer.textContent.length;
      } else {
        // if(ty
        while (!container.childNodes[offset]) {
          newContainer = dom.makeText(whiteSpace);
          container.appendChild(newContainer);
        }
      }
    } else {
      if (!dom.isTag(container.childNodes[offset], "#text")) {
        newContainer = dom.makeText(whiteSpace);
        container.insertBefore(newContainer, container.childNodes[offset]);
      } else {
        newContainer = container.childNodes[offset];
        newOffset = 0;
      }
      // (!op.isTag(container.childNodes[offset], "#text"))
    }
    return {
      container: newContainer,
      offset: newOffset,
    };
  }
  safeMouseClick(root: HTMLElement) {
    const rightEl = dom.lastValidChild(root, {
      emptyText: false,
      whiteText: false,
    });
    if (dom.isTag(rightEl, "label")) {
      root.appendChild(this.blockRight);
    }
  }
  safeMousePosition() {
    if (this.disable) {
      return;
    }

    const sel = document.getSelection();

    if (!sel || sel.rangeCount === 0) {
      return false;
    }

    const range = sel.getRangeAt(0);
    if (
      range.startContainer === range.endContainer &&
      range.startOffset === range.endOffset
    ) {
      const container = range.startContainer;
      const offset = range.startOffset;

      if (dom.isTag(container, "#text")) {
        if (!this.isRichHint(container.parentElement)) {
          return true;
        }

        let newContainer = container.parentElement as Node;
        let newPos: RelPosition;
        if (newContainer === this.right || newContainer === this.rightText) {
          if (offset === this.right.textContent.length) {
            newPos = dom.nextValidPosition(
              newContainer.parentElement.parentElement,
              newContainer.parentElement,
              newContainer.parentElement.childNodes.length
            );
          } else {
            newContainer = dom.previousValidNode(newContainer);
            newPos = new RelPosition(
              newContainer,
              newContainer.textContent.length
            );
          }
        } else if (
          newContainer === this.left ||
          newContainer === this.leftText
        ) {
          if (offset === 0) {
            newPos = dom.previousValidPosition(
              newContainer.parentElement.parentElement,
              newContainer.parentElement,
              0
            );
          } else {
            newContainer = dom.nextValidNode(newContainer);
            newPos = new RelPosition(newContainer, 0);
          }
        } else if (newContainer === this.blockRight) {
          newPos = dom.nextValidPosition(
            newContainer.parentElement.parentElement,
            newContainer.parentElement,
            0
          );
        }

        newPos = this.safePosition(newPos);
        console.log(newPos);
        range.setStart(newPos.container, newPos.offset);
        range.setEnd(newPos.container, newPos.offset);
      } else if (this.isRichHint(container as HTMLElement)) {
        const pos = dom.previousValidPosition(
          container.parentElement,
          container,
          0
        );
        console.log(pos);
        range.setStart(pos.container, pos.offset);
        range.setEnd(pos.container, pos.offset);
      } else {
        const { container: newContainer, offset: newOffset } = this._safeOffset(
          container,
          offset
        );

        range.setStart(newContainer, newOffset);
        range.setEnd(newContainer, newOffset);
      }
    }
    return true;
  }

  safePosition(pos: RelPosition): RelPosition {
    if (this.disable) {
      return;
    }
    const { container, offset } = pos;
    const { container: newContainer, offset: newOffset } = this._safeOffset(
      container,
      offset
    );

    return new RelPosition(newContainer, newOffset, pos.root);
  }

  hintElement(el: HTMLElement) {
    this.hintStyle(el);
  }

  autoUpdate(kwargs?: {
    force?: boolean;
    root: HTMLElement;
    click?: boolean;
    enter?: boolean;
  }) {
    if (this.disable) {
      return;
    }
    
    const { force, root, click, enter } = kwargs || {};
    const sel = document.getSelection();
    if (!sel || sel.rangeCount === 0) {
      this.remove();
      return;
    }
    // console.log(sel.focusNode);
    if (
      dom.isTag(document.activeElement, "input") ||
      dom.isTag(document.activeElement, "textarea")
    ) {
      this.remove();
      return;
    }

    var el: Node;
    var multiSelect = false;
    var offset = 0;

    const range = sel.getRangeAt(0);
    if (
      range.startContainer === range.endContainer &&
      range.startOffset === range.endOffset
    ) {
      el = range.startContainer;
      offset = range.startOffset;
      const { container, offset: newOffset } = this._safeOffset(el, offset);
      el = container;
      offset = newOffset;
    } else {
      el = range.commonAncestorContainer;
      // const { container: startContainer, offset: startOffset } =
      //   this._safeOffset(range.startContainer, range.startOffset);

      const { container: startContainer, offset: startOffset } =
        this._safeOffset(sel.anchorNode, sel.anchorOffset);
      const { container: endContainer, offset: endOffset } = this._safeOffset(
        sel.focusNode,
        sel.focusOffset
      );
      sel.setBaseAndExtent(
        startContainer,
        startOffset,
        endContainer,
        endOffset
      );
      // range.setStart(startContainer, startOffset);
      // range.setEnd(endContainer, endOffset);
      multiSelect = true;
    }

    if (el === this.ref && !force) {
      this.specilize(this.ref as HTMLElement);
      return;
    }

    let tryLabel = dom.findParentMatchTagName(
      el,
      "label",
      root
    ) as HTMLLabelElement;

    if (tryLabel) {
      const pos = dom.createPosition(root as HTMLElement, tryLabel, 0);
      dom.setPosition(pos);
      console.log(pos);
      this.remove();
      this.specilize(tryLabel);
      this.restoreNormal(this.ref as HTMLElement);
      this.ref = tryLabel;

      return;
    }

    if (!dom.isTag(el, "#text")) {
      el = el.childNodes[offset];
    }
    // if (op.isTag(el, "em")) {
    //   debugger;
    // }

    this.specilize(el.parentElement);
    this.hintStyle(el.parentElement);
    if (!multiSelect) {
      this.hintSpace(el as Text);
    } else {
      this.removeText();
    }
    this.restoreNormal(this.ref as HTMLElement);
    this.ref = el as Text;
  }

  _removeElementl(...el: HTMLElement[]) {
    el.forEach((item) => {
      if (item.parentElement) {
        item.remove();
      }
    });
  }

  removeText() {
    this._removeElementl(this.leftText, this.rightText);
  }

  remove() {
    this.restoreNormal(this.ref as HTMLElement);
    this._removeElementl(this.left, this.right, this.leftText, this.rightText);
    this.ref = null;
    if (this.text.textContent.trim() === "" && this.text.parentElement) {
      this.text.parentElement.removeChild(this.text);
    } else {
      this.text = dom.makeText("");
    }
  }
}

/**
 * to display other user position
 */
export class CaretHint {}
