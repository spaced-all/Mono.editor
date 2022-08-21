import produce from "immer";
import { Code } from ".";
import { serializeInlineElement } from "../../Inlines/serializer";
import { dom, time } from "../../utils";
import { indexOfNode } from "../../utils/dom";
import { BlockHandler } from "../aBlock";

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

  handleMouseDown(e: MouseEvent): boolean | void {
    // e.preventDefault();
    console.log(["Code", e]);
    return true;
  }

  handleMouseUp(e: MouseEvent): boolean | void {
    console.log(["Code", e]);
    return true;
  }
  handleArrowKeyDown(e: KeyboardEvent): boolean | void {
    // if (e.key === "ArrowUp") {
    //   if (dom.isFirstLine(this.serializer.outer)) {
    //     dom.setCaretReletivePosition(this.serializer.outer, 0);
    //     e.preventDefault();
    //   }
    // } else if (e.key === "ArrowDown") {
    //   if (dom.isLastLine(this.serializer.outer)) {
    //     dom.setCaretReletivePosition(
    //       this.serializer.outer,
    //       this.serializer.outer.textContent.length
    //     );
    //     e.preventDefault();
    //   }
    // } else if (e.key === "ArrowLeft") {
    //   if (this.isCursorLeft()) {
    //     e.preventDefault();
    //   }
    // } else if (e.key === "ArrowRight") {
    //   if (this.isCursorRight()) {
    //     e.preventDefault();
    //   }
    // }
    return true;
  }
  handleKeyDown(e: KeyboardEvent): boolean | void {
    // e.preventDefault();
    console.log(["CodeDown", e]);
    if (e.key.match("Arrow")) {
      const range = document.createRange();
      dom.setCaretReletivePosition(
        this.display,
        this.edit.selectionStart,
        range,
        false
      );
      if (e.key === "ArrowUp" && dom.isFirstLine(this.display, range)) {
        console.log("break");
      } else if (e.key === "ArrowDown" && dom.isLastLine(this.display, range)) {
        console.log("break");
      }
    }
    return true;
  }
  handleKeyUp(e: KeyboardEvent): boolean | void {
    // e.preventDefault();
    // this.edit.selectionStart
    
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
    return true;
  }
  handleEnterDown(e: KeyboardEvent): boolean | void {
    return true;
  }
}
