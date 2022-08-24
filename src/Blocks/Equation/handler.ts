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

  public get edit(): HTMLTextAreaElement {
    return this.serializer.edit;
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
      el.style.opacity = null;
      // document.getSelection().setPosition(el, 0);
    }
    this.serializer.closeEdit();
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

  getEditableByNode(node: Node): HTMLElement {
    if (dom.isParent(node, this.display)) {
      return this.display as HTMLElement;
    }
    if (dom.isParent(node, this.caption)) {
      return this.caption;
    }
    return null;
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
    if (this.currentEditable() === this.caption) {
      return false;
    }
    if (dom.isParent(e.target as Node, this.display)) {
      return false;
    }
    return true;
  }

  handleMouseUp(e: MouseEvent): boolean | void {
    console.log(["Equation", e]);
    if (this.currentEditable() === this.caption) {
      return false;
    }
    if (dom.isParent(e.target as Node, this.display)) {
      return false;
    }
    return true;
  }
  handleArrowKeyDown(e: KeyboardEvent): boolean | void {
    if (this.currentEditable() === this.caption) {
      return false;
    }

    if (e.target === this.edit) {
      return false;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      this.parent.requestActivateEditable({
        current: this.display,
        direction: "prevRow",
        handler: this,
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this.parent.requestActivateEditable({
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
    if (this.currentEditable() === this.display) {
      e.preventDefault();
      return true;
    }
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
    console.log(["Equation input", e]);
    if (e.target === this.edit) {
      this.serializer.updateEquation(this.edit.value);
    }
    // this.serializer.updateEquation(this.serializer.outer.innerHTML);
    return true;
  }
  handleEnterDown(e: KeyboardEvent): boolean | void {
    if (this.currentEditable() === this.caption) {
      return false;
    }
    if (e.target === this.edit) {
      if (e.shiftKey) {
        this.parent.requestActivateEditable({
          current: this.display,
          direction: "self",
          handler: this,
        });
        e.preventDefault();
      }
    } else {
      this.serializer.showEdit();
      e.preventDefault();
    }
    return true;
  }
  handleEscapeDown(e: KeyboardEvent): boolean | void {
    console.log(["Equation Escape", e]);
    if (e.target === this.edit) {
      this.parent.requestActivateEditable({
        current: this.display,
        direction: "self",
        handler: this,
      });
      e.preventDefault();
    }
  }
}
