import produce from "immer";
import { Image } from ".";
import { serializeInlineElement } from "../../Inlines/serializer";
import { ActiveEvent } from "../../types/eventHandler";
import { dom, time } from "../../utils";
import { indexOfNode } from "../../utils/dom";
import { BlockHandler } from "../aBlock";
import { EditableType } from "../types";

export class ImageHandler extends BlockHandler {
  serializer: Image;
  handleActive(e: ActiveEvent): boolean | void {
    const el = e.targetEditable;
    if (el === this.serializer.image) {
      el.style.opacity = "0.5";
      document.getSelection().setPosition(el, 0);
    }
  }
  handleDeactive(e: ActiveEvent): boolean | void {
    console.log(["Image Deactive", e]);
    const el = e.targetEditable;
    if (el === this.serializer.image) {
      el.style.opacity = "unset";
      // document.getSelection().setPosition(el, 0);
    }
  }

  currentEditable(): HTMLElement {
    const node = document.getSelection().focusNode;
    if (node === this.serializer.image) {
      return node as HTMLElement;
    }
    if (dom.isParent(node, this.serializer.caption)) {
      return this.serializer.caption;
    }
    return null;
  }

  nextEditable(el: HTMLElement): HTMLElement {
    if (el === this.serializer.image) {
      return this.serializer.caption;
    }
    return null;
  }

  prevEditable(el: HTMLElement): HTMLElement {
    if (el === this.serializer.caption) {
      return this.serializer.image;
    }

    return null;
  }

  prevRow(el: HTMLElement): HTMLElement {
    return this.prevEditable(el);
  }

  nextRow(el: HTMLElement): HTMLElement {
    return this.nextEditable(el);
  }

  getEditableType(el: HTMLElement): EditableType {
    if (el === this.serializer.image) {
      return "element";
    }
    return "content";
  }

  firstEditable(): HTMLElement {
    return this.serializer.image;
  }

  lastEditable(): HTMLElement {
    return this.serializer.caption;
  }

  handleMouseDown(e: MouseEvent): boolean | void {
    // e.preventDefault();
    console.log(["Image", e]);
    return true;
  }

  handleMouseUp(e: MouseEvent): boolean | void {
    console.log(["Image", e]);
    return true;
  }
  handleArrowKeyDown(e: KeyboardEvent): boolean | void {
    if (this.currentEditable() === this.serializer.caption) {
      return false;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      this.parent.propagateWalkEditable({
        current: this.serializer.image,
        direction: "prevRow",
        handler: this,
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this.parent.propagateWalkEditable({
        current: this.serializer.image,
        direction: "nextRow",
        handler: this,
      });
    }

    return true;
  }
  handleKeyDown(e: KeyboardEvent): boolean | void {
    // e.preventDefault();
    if (this.currentEditable() === this.serializer.caption) {
      return false;
    }
    console.log(["ImageDown", e]);
    e.preventDefault();
    // if (e.key === "Enter") {
    //   // document.createElement("br");
    //   const newLine = document.createTextNode("\n");
    //   document.getSelection().getRangeAt(0).insertNode(newLine);
    //   document.getSelection().setPosition(newLine, 1);
    //   this.serializer.updateImage(this.serializer.outer.innerHTML);
    //   e.preventDefault();
    // } else if (e.key === "Backspace") {
    //   if (this.isCursorLeft()) {
    //     e.preventDefault();
    //   }
    // } else if (e.key.match("Arrow")) {
    //   this.handleArrowKeyDown(e);
    // }

    return true;
  }
  handleKeyUp(e: KeyboardEvent): boolean | void {
    // e.preventDefault();
    console.log(["ImageUp", e]);
    e.preventDefault();
    return true;
  }
  handleKeyPress(e: KeyboardEvent): boolean | void {
    // e.preventDefault();

    console.log(["ImagePress", e]);
    return true;
  }
  handleInput(e: Event): boolean | void {
    // this.serializer.updateImage(this.serializer.outer.innerHTML);
    return true;
  }
  handleEnterDown(e: KeyboardEvent): boolean | void {
    return true;
  }
}
