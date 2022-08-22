import { BlockHandler } from "../Blocks/aBlock/handler";
import { ABCListHandler } from "../Blocks/aList";
import { DefaultBlockInfo, EditableType, WalkDirection } from "../Blocks/types";
import { IMath } from "../Inlines/math";
import { renderInlineElement } from "../Inlines/serializer";
import { CreateEvent, MergeEvent, SplitEvent } from "../operator/message";
import {
  ChangeBlock,
  RelPosition,
  SplitBlock,
  TextFormat,
} from "../operator/types";
import { Handler } from "../types/eventHandler";
import { Renderable } from "../types/renderable";
import { dom, pos, style } from "../utils";
import { RichHint } from "../utils/richhint";
import { EditState, Page, PageProps, PageState } from "./Page";

export class PageHandler extends Handler {
  serializer: Page;
  richhint: RichHint;
  activeBlock: HTMLElement;
  focusTarget: Range;
  constructor(serializer: Renderable) {
    super(serializer);
    this.richhint = new RichHint();
  }

  public get state(): PageState {
    return this.serializer.state;
  }

  public get props(): PageProps {
    return this.serializer.props;
  }

  public get edit(): EditState {
    return this.serializer.edit;
  }

  public get isComposition(): boolean {
    return this.edit.composite;
  }

  public get activeBlockRootElement(): HTMLDivElement {
    let node: HTMLElement;
    node = document.getSelection().focusNode as HTMLElement;
    node = dom.findParentMatchTagName(node, "div", this.root);
    return node as HTMLDivElement;
  }

  public get activeBlockOrder(): string {
    const node = this.activeBlockRootElement;
    if (!node.hasAttribute("block")) {
      return null;
    }
    const order = node.getAttribute("data-order");
    return order;
  }

  public get activeBlockHandler(): BlockHandler {
    this.state.blockSerializers.seek(this.activeBlockOrder);
    return this.state.blockSerializers.currentValue().handler;
  }

  public get prevBlockHandler(): BlockHandler {
    return this.state.blockSerializers.prevValue().handler;
  }
  public get nextBlockHandler(): BlockHandler {
    return this.state.blockSerializers.nextValue().handler;
  }

  public get blockSerializers() {
    return this.state.blockSerializers;
  }

  nextHandler(handler: BlockHandler) {
    const next = this.blockSerializers.getNode(handler.order).next;
    if (next) {
      return this.blockSerializers.getValue(next.value()).handler;
    }
  }

  prevHandler(handler: BlockHandler) {
    const prev = this.blockSerializers.getNode(handler.order).prev;
    if (prev) {
      return this.blockSerializers.getValue(prev.value()).handler;
    }
  }

  /**
   * first-in-first-out type history
   * @param key /[a-zA-Z@#/$]/
   * @returns true if pop key
   */
  pushTypeHistory(key: string): boolean {
    this.edit.typeHistory.push(key);
    if (this.edit.typeHistory.length > 5) {
      this.edit.typeHistory.splice(0, 1);
      return true;
    }
    return false;
  }
  /**
   *
   * @param e
   * @returns
   */
  tryHandleShortcut(e: KeyboardEvent): boolean {
    const typeHistory = this.edit.typeHistory.join("");
    if (typeHistory.slice(-2) === "$$") {
      const textRange = dom.previousTextRange(this.currentEditable());
      if (textRange.cloneContents().textContent.match(/[￥$]/)) {
        textRange.deleteContents();
      }

      const el = new IMath({
        initialData: { kind: "@math", value: "" },
        message: { activate: true },
      });
      const [root, noticable] = el.lazyRender();

      const range = document.getSelection().getRangeAt(0);
      range.insertNode(root);
      this.serializer.consumeUpdate([noticable]);

      return true;
    } else if (typeHistory.slice(-1) === "/") {
      // this.props.onContextMenu(
      //   new SlashContextMenuEvent({
      //     callback: (data) => {},
      //     key: "/",
      //   })
      // );
    }

    return false;
  }

  getNodeHandler(node: Node) {
    const order = this.getNodePosition(node).order;
    return this.state.blockSerializers.getValue(order).handler;
  }

  handleMouseDown(e: MouseEvent): void {
    console.log(["page Mouse Down", e]);
    this.updateActiveBlock(
      this.getNodeHandler(e.target as HTMLElement).serializer.root
    );
    if (this.getNodeHandler(e.target as Node).handleMouseDown(e)) {
      return;
    }
  }

  updateActiveBlock(el) {
    console.log(el);
    if (this.activeBlock !== el) {
      if (this.activeBlock) {
        this.activeBlock.classList.remove("active");
      }
      if (this.activeBlockRootElement) {
        this.activeBlock = el;
        this.activeBlock.classList.add("active");
      }
    }
  }
  handleMouseUp(e: MouseEvent): void {
    if (this.activeBlockHandler.handleMouseUp(e)) {
      return;
    }

    if (
      dom.isTag(e.target as any, "input") ||
      dom.isTag(e.target as any, "textarea")
    ) {
      this.richhint.remove();
      return;
    }

    if (
      dom.findParentMatchTagName(
        e.target as HTMLElement,
        "label",
        this.serializer.root
      )
    ) {
      return;
    }

    const valid = this.richhint.safeMousePosition();
    if (!valid) {
      // 非合法的位置
      const parent = dom.findParentMatchTagName(
        e.target as Node,
        "label",
        this.currentEditable()
      );
      if (parent) {
        const pos = dom.createPosition(this.currentEditable(), parent, 0);
        dom.setPosition(pos);
      }
    }
    this.richhint.autoUpdate({
      root: this.currentEditable(),
      click: true,
    });
    console.log();
  }

  prevEditable(): HTMLElement {
    const el = this.currentEditable();
    let prev = this.activeBlockHandler.prevEditable(el);
    if (!prev) {
      prev = this.prevBlockHandler.lastEditable();
    }
    return prev;
  }
  nextEditable(): HTMLElement {
    const el = this.currentEditable();
    const cur = this.activeBlockHandler;
    let next = this.activeBlockHandler.nextEditable(el);
    if (!next) {
      if (cur === this.nextBlockHandler) {
        next = cur.lastEditable();
      } else {
        next = this.nextBlockHandler.firstEditable();
      }
    }
    return next;
  }

  currentEditable(): HTMLElement {
    return this.activeBlockHandler.currentEditable();
  }

  handleKeyUp(e: KeyboardEvent): void {
    if (this.activeBlockHandler.handleKeyUp(e)) {
      return;
    }

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      this.richhint.autoUpdate({ root: this.currentEditable() });
      e.preventDefault();
    } else if (e.key === "Home" || e.key === "End") {
      this.richhint.safeMousePosition();
      this.richhint.autoUpdate({ root: this.currentEditable() });
      e.preventDefault();
    } else if (e.key === "Backspace" || e.key === "Delete") {
      // this.richhint.autoUpdate({ force: true, root: this.currentContainer() });
      e.preventDefault();
    } else if (e.metaKey) {
      // this.richhint.autoUpdate({ force: true })
      e.preventDefault();
    }
  }

  handleEnterDown(e: KeyboardEvent) {
    if (this.activeBlockHandler.handleEnterDown(e)) {
      return;
    }
    e.preventDefault();
  }

  handleSpaceDown(e: KeyboardEvent) {
    if (this.activeBlockHandler.handleSpaceDown(e)) {
      return;
    }
  }

  handleTabDown(e: KeyboardEvent) {
    if (this.activeBlockHandler.handleTabDown(e)) {
      return;
    }
    e.preventDefault();
  }

  handleArrowKeyDown(e: KeyboardEvent) {
    if (this.activeBlockHandler.handleArrowKeyDown(e)) {
      return;
    }

    const current = this.currentEditable();
    if (!current) {
      return;
    }

    if (e.key === "ArrowUp") {
      if (dom.isFirstLine(current)) {
        e.preventDefault();
        this.propagateWalkEditable({
          current: current,
          direction: "prevRow",
          handler: this.activeBlockHandler,
        });
      }
    } else if (e.key === "ArrowDown") {
      if (dom.isLastLine(current)) {
        e.preventDefault();
        this.propagateWalkEditable({
          current: current,
          direction: "nextRow",
          handler: this.activeBlockHandler,
        });
      }
    } else if (e.key === "ArrowLeft") {
      const sel = document.getSelection();

      let pos = dom.previousValidPosition(
        current,
        sel.focusNode,
        sel.focusOffset
      );
      if (!pos) {
        this.propagateWalkEditable({
          current: current,
          direction: "prev",
          handler: this.activeBlockHandler,
        });
      } else {
        // change any invalid position to valid(in #text node)
        pos = this.richhint.safePosition(pos);
        if (e.shiftKey) {
          while (pos && !dom.isTag(pos.container, "#text")) {
            pos = this.richhint.safePosition(pos);
            if (dom.isTag(pos.container, "label")) {
              pos = dom.previousValidPosition(
                current,
                pos.container,
                pos.offset
              );
              break;
            }
            pos = dom.previousValidPosition(current, pos.container, pos.offset);
          }
          pos = this.richhint.safePosition(pos);
          sel.setBaseAndExtent(
            sel.anchorNode,
            sel.anchorOffset,
            pos.container,
            pos.offset
          );
        } else {
          dom.setPosition(pos);
        }
        this.richhint.autoUpdate();
      }
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      if (e.altKey) {
        return;
      }
      const sel = document.getSelection();

      let pos: RelPosition;
      pos = dom.nextValidPosition(current, sel.focusNode, sel.focusOffset);
      if (!pos) {
        this.propagateWalkEditable({
          current: current,
          direction: "next",
          handler: this.activeBlockHandler,
        });
      } else {
        pos = this.richhint.safePosition(pos);
        if (e.shiftKey) {
          while (pos && !dom.isTag(pos.container, "#text")) {
            pos = this.richhint.safePosition(pos);
            if (dom.isTag(pos.container, "label")) {
              pos = dom.nextValidPosition(current, pos.container, pos.offset);
              break;
            }
            pos = dom.nextValidPosition(current, pos.container, pos.offset);
          }
          pos = this.richhint.safePosition(pos);
          // dom.setPosition(pos, false, true);
          sel.setBaseAndExtent(
            sel.anchorNode,
            sel.anchorOffset,
            pos.container,
            pos.offset
          );
        } else {
          dom.setPosition(pos);
        }
        this.richhint.autoUpdate();
      }
      e.preventDefault();
    }
  }

  getNodePosition(node: Node) {
    const blockRoot: HTMLElement = dom.findParentMatchTagName(
      node,
      "div",
      this.root
    );
    if (blockRoot && blockRoot.hasAttribute("block")) {
      const order = blockRoot.getAttribute("data-order");
      const container = this.state.blockSerializers
        .getValue(order)
        .handler.getEditableByNode(node);
      return {
        container: container,
        order: order,
      };
    }
    return {};
  }

  public get selectionState():
    | "collapsed"
    | "inContainer"
    | "multiContainer"
    | "blocks"
    | "blur" {
    if (document.getSelection().isCollapsed) {
      return "collapsed";
    }
    const start = this.getNodePosition(document.getSelection().focusNode);
    const end = this.getNodePosition(document.getSelection().anchorNode);
    if (!start.order || !end.order) {
      return "blur";
    }
    if (start.container === end.container) {
      return "inContainer";
    }
    if (start.order === end.order) {
      return "multiContainer";
    }
    return "blocks";
  }

  setFocusPosition(pos: Range) {
    this.focusTarget = pos;
  }

  propagateWalkEditable(e: {
    current: HTMLElement;
    handler: BlockHandler;
    direction: WalkDirection;
  }) {
    const richhint = this.richhint;
    let { current, handler, direction } = e;
    const currentEditableType = handler.getEditableType(current);
    let neighbor: HTMLElement;
    switch (direction) {
      case "prev":
        neighbor = handler.prevEditable(current);
        break;
      case "prevRow":
        neighbor = handler.prevRow(current);
        break;
      case "next":
        neighbor = handler.nextEditable(current);
        break;
      case "nextRow":
        neighbor = handler.nextRow(current);
        break;
    }
    const that = this;
    function active(
      prev: HTMLElement,
      next: HTMLElement,
      prevType: EditableType,
      nextType: EditableType,
      prevHandler: BlockHandler,
      nextHandler: BlockHandler
    ) {
      let offset = 0;
      nextHandler.activate(next);
      if (nextType === "element") {
        richhint.remove();
        return;
      }

      const range = document.createRange();
      if (prevType === "content") {
        if (direction === "next") {
          dom.setCaretReletivePosition(next, 0, range);
        } else if (direction === "nextRow") {
          offset = dom.getCaretReletivePositionAtLastLine(prev);
          dom.setCaretReletivePosition(next, offset, range);
        } else if (direction === "prev") {
          dom.setCaretReletivePosition(next, -1, range);
        } else {
          offset = dom.getCaretReletivePosition(prev);
          dom.setCaretReletivePositionAtLastLine(next, offset, range);
        }
      } else {
        dom.setCaretReletivePosition(next, offset, range);
      }

      if (document.activeElement !== that.serializer.root) {
        that.setFocusPosition(range);
        that.serializer.root.focus({ preventScroll: true });
      }

      next["scrollIntoViewIfNeeded"](false);
      dom.applyRange(range);
      let pos = richhint.safePosition(dom.currentPosition(next));
      dom.setPosition(pos);
      richhint.autoUpdate({ root: next });
    }

    if (neighbor) {
      const editableType = handler.getEditableType(neighbor);
      if (editableType === "content") {
      } else if (editableType === "element") {
        handler.selectElementEditable(neighbor);
      }
      active(
        current,
        neighbor,
        currentEditableType,
        editableType,
        handler,
        handler
      );
      return;
    }

    let neighborHandler: BlockHandler;

    if (direction.match("next")) {
      neighborHandler = this.nextHandler(handler);
      if (neighborHandler) {
        neighbor = neighborHandler.firstEditable();
      }
    } else {
      neighborHandler = this.prevHandler(handler);
      if (neighborHandler) {
        neighbor = neighborHandler.lastEditable();
      }
    }

    if (neighbor) {
      const editableType = neighborHandler.getEditableType(neighbor);
      active(
        current,
        neighbor,
        currentEditableType,
        editableType,
        handler,
        neighborHandler
      );
    }
  }

  processEdit(message) {}

  propgateChange(e: ChangeBlock) {
    const offset = dom.getCaretReletivePosition(this.currentEditable());
    const focusedSerializer = this.serializer.changeBlock(e.focus);
    const focusedContainer = focusedSerializer.handler.firstEditable();
    dom.setCaretReletivePosition(focusedContainer, offset);
    this.richhint.autoUpdate({
      root: focusedContainer,
    });
  }

  propgateDelete(e) {}

  propgateSplit(e: SplitEvent) {
    console.log(e);
    if (e.prev) {
      this.serializer.insertBlockBefore(e.prev, e.order);
    }
    if (e.next) {
      this.serializer.insertBlockAfter(e.next, e.order);
    }
    if (e.focus) {
      const offset = dom.getCaretReletivePosition(this.currentEditable());
      const focusedSerializer = this.serializer.changeBlock(e.focus);
      const focusedContainer = focusedSerializer.handler.firstEditable();
      dom.setCaretReletivePosition(focusedContainer, offset);
      this.richhint.autoUpdate({
        root: focusedContainer,
      });
    }
    // this.serializer.changeBlock()
  }
  propgateNew(e: CreateEvent) {
    console.log(e);
    const newSerializer = this.serializer.insertBlockAfter(e.block, e.order);
    const editable = newSerializer.handler.firstEditable();
    if (e.offset !== undefined) {
      dom.setCaretReletivePosition(editable, e.offset);
    }

    let pos = dom.currentPosition(editable);
    pos = this.richhint.safePosition(pos);
    dom.setPosition(pos);
    this.richhint.autoUpdate({ root: editable });
  }
  propgateMerge(e: MergeEvent) {
    let neighborHandler: BlockHandler;
    let neighbor: HTMLElement;
    console.log(e);
    if (e.mergeType === "backspace") {
      neighborHandler = this.prevBlockHandler;
      neighbor = neighborHandler.lastEditable();
      const offset = dom.getContentSize(neighbor);
      if (e.elementType === "text" && neighborHandler.elementType !== "card") {
        neighborHandler.appendElementsAtLast(e.children);
        this.serializer.removeBlock(e.order);
        dom.setCaretReletivePosition(neighbor, offset);
        let pos = dom.currentPosition(neighbor);
        pos = this.richhint.safePosition(pos);
        dom.setPosition(pos);
        this.richhint.autoUpdate({ root: neighbor, force: true });
      } else {
        // neighbor.elementType === 'card'
        // select neighbor
      }
    } else if (e.mergeType === "delete") {
      const cur = this.serializer.state.blockSerializers.getValue(
        e.order
      ).handler;
      neighborHandler = this.nextBlockHandler;
      if (e.elementType === "text") {
        cur.appendElementsAtLast(
          dom.validChildNodes(neighborHandler.firstEditable())
        );
        if (neighborHandler.elementType === "text") {
          this.serializer.removeBlock(neighborHandler.serializer.order);
        } else if (neighborHandler.elementType === "list") {
          (neighborHandler as ABCListHandler).removeContainer(
            neighborHandler.firstEditable()
          );
          if (!(neighborHandler as ABCListHandler).hasContainer()) {
            this.serializer.removeBlock(neighborHandler.serializer.order);
          }
        } else {
          // neighbor.elementType === 'card'
          // select neighbor
        }
        this.richhint.autoUpdate({ root: neighborHandler.lastEditable() });
      } else if (e.elementType === "list") {
        if (neighborHandler.elementType === "text") {
          cur.appendElementsAtLast(
            dom.validChildNodes(neighborHandler.firstEditable())
          );
          this.serializer.removeBlock(neighborHandler.serializer.order);
        } else if (neighborHandler.elementType === "list") {
          const listNeighbor = neighborHandler as ABCListHandler;
          (cur as ABCListHandler).appendContainer(...listNeighbor.containers());
          if (!listNeighbor.hasContainer()) {
            this.serializer.removeBlock(neighborHandler.serializer.order);
          }
        } else {
          // neighbor.elementType === 'card'
          // select neighbor
        }
      }
    }
  }

  handleDeleteDown(e: KeyboardEvent) {
    if (this.activeBlockHandler.handleDeleteDown(e)) {
      return;
    }
  }
  handleBackspaceDown(e: KeyboardEvent) {
    if (this.activeBlockHandler.handleBackspaceDown(e)) {
      return;
    }

    const state = this.selectionState;
    let tag;
    if (state === "collapsed") {
      const root = this.currentEditable();
      if ((tag = style.isInStyleBound(this.currentEditable(), "left"))) {
        const styleName = style.tagToStyle(tag);
        if (styleName) {
          style.deleteStyle(tag, this.currentEditable());
          e.preventDefault();
        }

        return;
      } else if ((tag = dom.isInLabelBound(this.currentEditable(), "left"))) {
        let pos = dom.previousValidPosition(root, tag, 0);

        tag.parentElement.removeChild(tag);
        pos = this.richhint.safePosition(pos);
        dom.setPosition(pos);
        this.richhint.autoUpdate();
        e.preventDefault();
        return;
      } else {
        const sel = document.getSelection();
        if (dom.isTag(sel.focusNode, "label")) {
          sel.focusNode.parentElement.removeChild(sel.focusNode);
          e.preventDefault();
          // this.dispatchInputEvent();
          return;
        }
      }
    } else if (state === "inContainer") {
    } else {
    }
  }
  handleEscapeDown(e: KeyboardEvent) {
    // this.edit.mode = "selection";
    e.preventDefault();
  }
  handleHomeDown(e: KeyboardEvent) {
    const cur = this.currentEditable();
    dom.setCaretReletivePosition(cur, 0);
    e.preventDefault();
  }
  handleEndDown(e: KeyboardEvent) {
    if (this.activeBlockHandler.handleEndDown(e)) {
      return;
    }
    const cur = this.currentEditable();
    dom.setCaretReletivePosition(cur, -1);
    let pos = this.richhint.safePosition(dom.currentPosition(cur));
    dom.setPosition(pos);
    console.log(pos);
    this.richhint.autoUpdate({ root: cur });
    e.preventDefault();
  }

  handleKeyDown(e: KeyboardEvent): void {
    if (this.isComposition) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    const tgt = e.target as HTMLElement;

    const tag = dom.findParentMatchTagName(tgt, "label", this.serializer.root);
    if (tag) {
      const { container } = this.getNodePosition(tgt);
      let pos = dom.nextValidPosition(container, tag, 0);
      pos = this.richhint.safePosition(pos);
      dom.setPosition(pos);
      this.richhint.autoUpdate({ root: container });
      return;
    }

    this.pushTypeHistory(e.key);
    if (this.tryHandleShortcut(e)) {
      e.preventDefault();
      return;
    }
    console.log(["Page Key Down", e]);
    // dom.currentPosition(this.)
    if (e.key === "Enter") {
      const pos = dom.currentPosition(this.currentEditable());

      if (dom.isTag(pos.container, "label")) {
        const lb: HTMLLabelElement = pos.container as HTMLLabelElement;
        lb.click();
        // lb.classList.add("inline-key-hovered");
        this.richhint.autoUpdate({
          root: this.currentEditable(),
          enter: true,
        });
        e.preventDefault();
        return;
      }
      // debugger
      this.handleEnterDown(e);
    } else if (e.code === "Space") {
      this.handleSpaceDown(e);
    } else if (e.key === "Escape") {
      // this.props.onSelectBlock({
      //     html: null,
      //     ref: null,
      //     inner: null
      // })
      this.handleEscapeDown(e);
    } else if (e.key === "Tab") {
      this.handleTabDown(e);
    } else if (e.key === "Backspace") {
      // backspace -> defaultHandleBackspace ->  default(delete one char)
      // backspace -> defaultHandleBackspace ->  mergeAbove
      // backspace -> defaultHandleBackspace ->  changeBlockType
      // backspace -> defaultHandleBackspace ->  deleteStyle
      this.handleBackspaceDown(e);
    } else if (e.key === "Delete") {
      this.handleDeleteDown(e);
    } else if (e.key === "Home") {
      this.handleHomeDown(e);
    } else if (e.key === "End") {
      this.handleEndDown(e);
    } else if (e.key.match("Arrow")) {
      this.handleArrowKeyDown(e);
    } else {
    }

    if (this.activeBlockHandler.handleKeyDown(e)) {
      return;
    }

    if (e.metaKey) {
      if (style.supportStyleKey(e.key)) {
        style.applyStyle(e.key, this.currentEditable());
        this.richhint.autoUpdate({
          force: true,
          root: this.currentEditable(),
        });
        e.preventDefault();
        return;
      }
    }
  }
  handleKeyPress(e: KeyboardEvent): boolean | void {
    const tgt = e.target as HTMLElement;

    const tag = dom.findParentMatchTagName(tgt, "label", this.serializer.root);
    if (tag) {
      const { container } = this.getNodePosition(tgt);
      let pos = dom.nextValidPosition(container, tag, 0);
      pos = this.richhint.safePosition(pos);
      dom.setPosition(pos);
      this.richhint.autoUpdate({ root: container });
      return;
    }

    if (this.activeBlockHandler.handleKeyPress(e)) {
      return;
    }
  }
  handleInput(e: Event): boolean | void {
    if (this.activeBlockHandler.handleInput(e)) {
      return;
    }
  }

  handleMouseEnter(e: MouseEvent): boolean | void {
    console.log(e);
  }
  handleCopy(e: ClipboardEvent): boolean | void {}
  handlePaste(e: ClipboardEvent): boolean | void {
    if (this.activeBlockHandler.handlePaste(e)) {
      return;
    }
  }
  handleFocus(e: FocusEvent): boolean | void {
    console.log(["Page Focus", e]);
    // if (this.focusTarget) {
    //   dom.applyRange(this.focusTarget);
    //   const { container } = this.getNodePosition(
    //     this.focusTarget.startContainer
    //   );
    //   this.richhint.autoUpdate({ root: container });
    // }
    // console.log(["Focus", e]);
  }
  handleBlur(e: FocusEvent): boolean | void {
    console.log(["Page Blur", e]);
  }
}
