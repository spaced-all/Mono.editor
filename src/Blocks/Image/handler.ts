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

  public get image(): HTMLImageElement {
    return this.serializer.image;
  }

  public get caption(): HTMLElement {
    return this.serializer.caption;
  }


  getEditableByNode(node: Node): HTMLElement {
    if (dom.isParent(node, this.image)) {
      return this.image;
    }
    if (dom.isParent(node, this.caption)) {
      return this.caption;
    }
    return null;
  }

  handleActive(e: ActiveEvent): boolean | void {
    console.log(["Image Active", e]);
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
    if (this.currentEditable() === this.serializer.caption) {
      return false;
    }
    console.log(["Image", e]);
    return true;
  }

  handleMouseUp(e: MouseEvent): boolean | void {
    if (this.currentEditable() === this.serializer.caption) {
      return false;
    }
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
 
    switch (e.key) {
      case "[":
        this.serializer.smaller();
        break;
      case "]":
        this.serializer.bigger();
        break;
    }

    return true;
  }
  handleKeyUp(e: KeyboardEvent): boolean | void {
    // e.preventDefault();
    if (this.currentEditable() === this.serializer.caption) {
      return false;
    }
    console.log(["ImageUp", e]);
    e.preventDefault();
    return true;
  }
  handleKeyPress(e: KeyboardEvent): boolean | void {
    // e.preventDefault();
    if (this.currentEditable() === this.serializer.caption) {
      return false;
    }
    console.log(["ImagePress", e]);
    return true;
  }
  handleInput(e: Event): boolean | void {
    if (this.currentEditable() === this.serializer.caption) {
      return false;
    }
    // this.serializer.updateImage(this.serializer.outer.innerHTML);
    return true;
  }
  handleEnterDown(e: KeyboardEvent): boolean | void {
    if (this.currentEditable() === this.serializer.caption) {
      return false;
    }
    return true;
  }
}
