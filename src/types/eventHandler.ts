import { dom } from "../utils";
import { Renderable } from "./renderable";

export class HandlerManager {
  static _handlers: { [key: string]: any } = {};
}

export interface ActiveEventProps {
  related?: Handler;
  target?: Handler;
  relatedEditable?: HTMLElement;
  targetEditable?: HTMLElement;
}

export class ActiveEvent {
  type: "active" | "deactive";
  related?: Handler; // 事件发生时相关的 handler
  relatedEditable?: HTMLElement;
  target?: Handler; // 事件的目标 handler
  targetEditable?: HTMLElement; // 事件的目标 handler
  static deactive(e: ActiveEventProps) {
    const event = new ActiveEvent();
    event.type = "deactive";
    event.related = e.related;
    event.target = e.target;
    event.relatedEditable = e.relatedEditable;
    event.targetEditable = e.targetEditable;
    return event;
  }
  static active(e: ActiveEventProps) {
    const event = new ActiveEvent();
    event.type = "active";
    event.related = e.related;
    event.target = e.target;
    event.targetEditable = e.targetEditable;
    return event;
  }
}

export class Handler {
  private static _active: Handler = null;
  private static _activeEditable: HTMLElement = null;

  root: HTMLElement;

  parent: Handler;
  serializer: Renderable;

  eventMap: { [key in keyof HTMLElementEventMap]?: (e) => void };
  eventKeys: keyof HTMLElementEventMap[];
  constructor(serializer: Renderable) {
    this.serializer = serializer;
    this.serializer.handler = this;
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

  activate(editable?: HTMLElement) {
    const that = Handler._active;
    const thatEditable = Handler._activeEditable;
    Handler._active = this;
    Handler._activeEditable = editable;
    if (that) {
      that.handleDeactive(
        ActiveEvent.deactive({
          related: this,
          relatedEditable: editable,
          target: that,
          targetEditable: thatEditable,
        })
      );
    }
    this.handleActive(
      ActiveEvent.active({
        related: that,
        relatedEditable: thatEditable,
        targetEditable: editable,
        target: this,
      })
    );
  }
  deactivate() {
    if (this !== Handler._active) {
      return;
    }
    Handler._active = null;
    Handler._activeEditable = null;
    this.handleDeactive(ActiveEvent.deactive({ related: null, target: this }));
  }

  isActive() {
    return Handler._active === this;
  }

  isEditableOfRoot(el): boolean {
    return dom.findTopNode(el, this.root) === this.root;
  }

  currentEditable(): HTMLElement {
    return this.root;
  }

  firstEditable(): HTMLElement {
    return this.root;
  }
  lastEditable(): HTMLElement {
    return this.root;
  }

  getEditableByIndex(...index: number[]): HTMLElement {
    return this.root;
  }
  nextEditable(el: HTMLElement): HTMLElement {
    if (el === this.root) {
      return null;
    } else {
      return this.root;
    }
  }
  prevEditable(el: HTMLElement): HTMLElement {
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

  handleActive(e: ActiveEvent): void | boolean {}
  handleDeactive(e: ActiveEvent): void | boolean {}

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
}
