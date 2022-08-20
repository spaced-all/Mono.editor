import { Renderable } from "./renderable";

export class HandlerManager {
  static _handlers: { [key: string]: any } = {};
}

export class Handler {
  root: HTMLElement;

  parent: Handler;
  serializer: Renderable;
  eventMap: { [key in keyof HTMLElementEventMap]?: (e) => void };
  eventKeys: keyof HTMLElementEventMap[];
  constructor(serializer: Renderable) {
    this.serializer = serializer;
    this.eventMap = {
      copy: this.handleCopy,
      paste: this.handlePaste,
      blur: this.handleBlur,
      focus: this.handleFocus,
      keydown: this.handleKeyDown,
      keyup: this.handleKeyUp,
      keypress: this.handleKeyPress,
      mouseup: this.handleMouseUp,
      mousedown: this.handleMouseDown,
      mouseenter: this.handleMouseEnter,
      mouseleave: this.handleMouseLeave,
      click: this.handleClick,
      input: this.handleInput,
      contextmenu: this.handleContextMenu,
      compositionend: this.handleCompositionEnd,
      compositionstart: this.handleCompositionStart,
      compositionupdate: this.handleCompositionUpdate,
    };
  }

  bindParent(parent: Handler) {
    this.parent = parent;
  }
  unbindParent() {
    this.parent = null;
  }

  handleCopy(e: ClipboardEvent): void | boolean {}
  handlePaste(e: ClipboardEvent): void | boolean {}
  handleBlur(e: FocusEvent): void | boolean {}
  handleFocus(e: FocusEvent): void | boolean {}
  handleKeyDown(e: KeyboardEvent): void | boolean {}
  handleKeyPress(e: KeyboardEvent): void | boolean {}
  handleKeyUp(e: KeyboardEvent): void | boolean {}
  handleMouseDown(e: MouseEvent): void | boolean {}
  handleMouseEnter(e: MouseEvent): void | boolean {}
  handleMouseLeave(e: MouseEvent): void | boolean {}
  handleMouseUp(e: MouseEvent): void | boolean {}
  handleClick(e: MouseEvent): void | boolean {}
  handleContextMenu(e: MouseEvent): void | boolean {}
  handleInput(e: Event): void | boolean {}
  handleCompositionEnd(e: CompositionEvent): void | boolean {}
  handleCompositionStart(e: CompositionEvent): void | boolean {}
  handleCompositionUpdate(e: CompositionEvent): void | boolean {}
  handleEnterDown(e: KeyboardEvent): void | boolean {}
  handleSpaceDown(e: KeyboardEvent): void | boolean {}
  handleTabDown(e: KeyboardEvent): void | boolean {}
  handleArrowKeyDown(e: KeyboardEvent): void | boolean {}
  handleDeleteDown(e: KeyboardEvent): void | boolean {}
  handleBackspaceDown(e: KeyboardEvent): void | boolean {}
  handleEscapeDown(e: KeyboardEvent): void | boolean {}
  handleHomeDown(e: KeyboardEvent): void | boolean {}
  handleEndDown(e: KeyboardEvent): void | boolean {}

  firstContainer(): HTMLElement {
    return this.root;
  }
  lastContainer(): HTMLElement {
    return this.root;
  }
  currentContainer(): HTMLElement {
    return this.root;
  }
  getContainerByIndex(...index: number[]): HTMLElement {
    return this.root;
  }
  nextContainer(el: HTMLElement): HTMLElement {
    if (el === this.root) {
      return null;
    } else {
      return this.root;
    }
  }
  prevContainer(el: HTMLElement): HTMLElement {
    if (el === this.root) {
      return null;
    } else {
      return this.root;
    }
  }
  nextRow(el: HTMLElement): HTMLElement {
    if (el === this.root) {
      return null;
    } else {
      return this.root;
    }
  }
  prevRow(el: HTMLElement): HTMLElement {
    if (el === this.root) {
      return null;
    } else {
      return this.root;
    }
  }
}
