import produce from "immer";
import { Equation } from ".";
import { serializeInlineElement } from "../../Inlines/serializer";
import { ActiveEvent } from "../../types/eventHandler";
import { dom, time } from "../../utils";
import { indexOfNode } from "../../utils/dom";
import { BlockHandler } from "../aBlock";
import { EditableType } from "../types";

export class EquationHandler extends BlockHandler {
  serializer: Equation;

  public get display(): HTMLElement {
    return this.serializer.display;
  }

  public get caption(): HTMLElement {
    return this.serializer.caption;
  }

  handleActive(e: ActiveEvent): boolean | void {
    const el = e.targetEditable;
    if (el === this.display) {
      el.style.opacity = "0.5";
      document.getSelection().setPosition(el, 0);
    }
  }
  handleDeactive(e: ActiveEvent): boolean | void {
    const el = e.targetEditable;
    if (el === this.display) {
      el.style.opacity = "unset";
      // document.getSelection().setPosition(el, 0);
    }
  }

  currentEditable(): HTMLElement {
    const node = document.getSelection().focusNode;
    if (node === this.display) {
      return node as HTMLElement;
    }
    if (dom.isParent(node, this.caption)) {
      return this.serializer.caption;
    }
    return null;
  }

  nextEditable(el: HTMLElement): HTMLElement {
    if (el === this.display) {
      return this.caption;
    }
    return null;
  }

  prevEditable(el: HTMLElement): HTMLElement {
    if (el === this.caption) {
      return this.display;
    }

    return null;
  }
  nextRow(el: HTMLElement): HTMLElement {
    return this.nextEditable(el);
  }
  prevRow(el: HTMLElement): HTMLElement {
    return this.prevEditable(el);
  }

  getEditableType(el: HTMLElement): EditableType {
    if (el === this.display) {
      return "element";
    }
    return "content";
  }
  firstEditable(): HTMLElement {
    return this.display;
  }
  lastEditable(): HTMLElement {
    return this.caption;
  }

  handleMouseDown(e: MouseEvent): boolean | void {
    // e.preventDefault();
    console.log(["Equation", e]);
    return true;
  }

  handleMouseUp(e: MouseEvent): boolean | void {
    console.log(["Equation", e]);
    return true;
  }
  handleArrowKeyDown(e: KeyboardEvent): boolean | void {
    if (this.currentEditable() === this.caption) {
      return false;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      this.parent.propagateWalkEditable({
        current: this.display,
        direction: "prevRow",
        handler: this,
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this.parent.propagateWalkEditable({
        current: this.display,
        direction: "nextRow",
        handler: this,
      });
    }

    return true;
  }
  handleKeyDown(e: KeyboardEvent): boolean | void {
    // e.preventDefault();
    console.log(["EquationDown", e]);

    // if (e.key === "Enter") {
    //   // document.createElement("br");
    //   const newLine = document.createTextNode("\n");
    //   document.getSelection().getRangeAt(0).insertNode(newLine);
    //   document.getSelection().setPosition(newLine, 1);
    //   this.serializer.updateEquation(this.serializer.outer.innerHTML);
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
    console.log(["EquationUp", e]);
    // e.preventDefault();
    return true;
  }
  handleKeyPress(e: KeyboardEvent): boolean | void {
    // e.preventDefault();

    console.log(["EquationPress", e]);
    return true;
  }
  handleInput(e: Event): boolean | void {
    // this.serializer.updateEquation(this.serializer.outer.innerHTML);
    return true;
  }
  handleEnterDown(e: KeyboardEvent): boolean | void {
    return true;
  }
}
