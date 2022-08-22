import produce from "immer";
import { Code } from ".";
import { serializeInlineElement } from "../../Inlines/serializer";
import { ActiveEvent } from "../../types/eventHandler";
import { dom, time } from "../../utils";
import { indexOfNode } from "../../utils/dom";
import { BlockHandler } from "../aBlock";
import { EditableType } from "../types";

export class CodeHandler extends BlockHandler {
  serializer: Code;

  public get edit(): HTMLTextAreaElement {
    return this.serializer.edit;
  }

  public get display(): HTMLElement {
    return this.serializer.display;
  }

  public get highlight(): HTMLElement {
    return this.serializer.highlight;
  }

  firstEditable(): HTMLElement {
    return this.edit;
  }

  lastEditable(): HTMLElement {
    return this.edit;
  }
  currentEditable(): HTMLElement {
    return this.edit;
  }
  // selectElementEditable(el: HTMLElement): void {
  //   console.log("select element editable");
  //   if (el === this.edit) {
  //     // this.edit.style.display = "unset";
  //   }
  // }
  handleActive(e: ActiveEvent): boolean | void {
    if (e.targetEditable === this.edit) {
      this.edit.focus();
      this.edit.setSelectionRange(0, 0);
    }
  }

  nextEditable(el: HTMLElement): HTMLElement {
    return null;
  }
  prevEditable(el: HTMLElement): HTMLElement {
    return null;
  }
  prevRow(el: HTMLElement): HTMLElement {
    return null;
  }
  nextRow(el: HTMLElement): HTMLElement {
    return null;
  }

  handleMouseDown(e: MouseEvent): boolean | void {
    // e.preventDefault();
    console.log(["Code Mouse", e]);

    return true;
  }

  handleMouseUp(e: MouseEvent): boolean | void {
    console.log(["Code", e]);
    // const offset = dom.getCaretReletivePosition(
    //   this.display,
    //   null,
    //   null,
    //   false
    // );
    // console.log(offset);
    // // this.edit.style.display = "unset";
    // this.edit.focus();
    // this.edit.setSelectionRange(offset - 1, offset - 1);
    return true;
  }
  handleArrowKeyDown(e: KeyboardEvent): boolean | void {
    return true;
  }
  handleEditKeyUp(e: KeyboardEvent) {
    e.stopPropagation();
    e.preventDefault();
    console.log(["Code key up"]);
  }

  handleEditArrowKeyUp(e: KeyboardEvent): boolean | void {
    e.stopPropagation();
    e.preventDefault();
  }
  handleEditArrowKeyDown(e: KeyboardEvent): boolean | void {
    console.log(["Code key down", e]);
    if (!e.key.match("Arrow")) {
      e.stopPropagation();
      return;
    }
    // console.log(["Code Arrow Key Down", e]);
    const range = document.createRange();
    dom.setCaretReletivePosition(
      this.display,
      this.edit.selectionStart,
      range,
      false
    );
    if (e.key === "ArrowUp" && this.edit.selectionStart === 0) {
      e.preventDefault();
      // this.edit.blur();
      this.parent.propagateWalkEditable({
        current: this.edit,
        direction: "prevRow",
        handler: this,
      });
    } else if (
      e.key === "ArrowDown" &&
      this.edit.selectionEnd === this.edit.value.length
    ) {
      e.preventDefault();
      // this.edit.blur();
      this.parent.propagateWalkEditable({
        current: this.edit,
        direction: "nextRow",
        handler: this,
      });
    }

    e.stopPropagation();

    return true;
  }
  getEditableType(el: HTMLElement): EditableType {
    if (el === this.edit) {
      return "element";
    } else {
      return "content";
    }
  }

  handleKeyDown(e: KeyboardEvent): boolean | void {
    // e.preventDefault();
    console.log(["CodeDown", e]);
    e.preventDefault();
    return true;
  }
  handleKeyUp(e: KeyboardEvent): boolean | void {
    // e.preventDefault();
    // this.edit.selectionStart
    e.preventDefault();
    // e.preventDefault();
    return true;
  }
  handleKeyPress(e: KeyboardEvent): boolean | void {
    // e.preventDefault();

    console.log(["CodePress", e]);
    return true;
  }
  handleInput(e: Event): boolean | void {
    // this.serializer.updateCode(this.serializer.outer.innerHTML);
    console.log(["Code input", e]);
    return true;
  }
  handleEnterDown(e: KeyboardEvent): boolean | void {
    return true;
  }
}
