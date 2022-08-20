import produce from "immer";
import { Code } from ".";
import { serializeInlineElement } from "../../Inlines/serializer";
import { dom, time } from "../../utils";
import { indexOfNode } from "../../utils/dom";
import { BlockHandler } from "../aBlock";

export class CodeHandler extends BlockHandler {
  serializer: Code;

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

    // if (e.key === "Enter") {
    //   // document.createElement("br");
    //   const newLine = document.createTextNode("\n");
    //   document.getSelection().getRangeAt(0).insertNode(newLine);
    //   document.getSelection().setPosition(newLine, 1);
    //   this.serializer.updateCode(this.serializer.outer.innerHTML);
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
    console.log(["CodeUp", e]);
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
