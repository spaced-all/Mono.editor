import { BlockHandler } from "../Blocks/aBlock/handler";
import { ABCListHandler } from "../Blocks/aList";
import { DefaultBlockInfo } from "../Blocks/types";
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

  activateToPrevBlock() {
    this.state.blockSerializers.nextNode();
  }

  toggleComposite(flag: boolean): void {
    this.edit.composite = flag;
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
      const textRange = dom.previousTextRange(this.currentContainer());
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
      noticable.notify();

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
        this.currentContainer()
      );
      if (parent) {
        const pos = dom.createPosition(this.currentContainer(), parent, 0);
        dom.setPosition(pos);
      }
    }
    this.richhint.autoUpdate({
      root: this.currentContainer(),
      click: true,
    });
    console.log();
  }

  prevContainer(): HTMLElement {
    const el = this.currentContainer();
    let prev = this.activeBlockHandler.prevContainer(el);
    if (!prev) {
      prev = this.prevBlockHandler.lastContainer();
    }
    return prev;
  }
  nextContainer(): HTMLElement {
    const el = this.currentContainer();
    const cur = this.activeBlockHandler;
    let next = this.activeBlockHandler.nextContainer(el);
    if (!next) {
      if (cur === this.nextBlockHandler) {
        next = cur.lastContainer();
      } else {
        next = this.nextBlockHandler.firstContainer();
      }
    }
    return next;
  }

  currentContainer(): HTMLElement {
    return this.activeBlockHandler.currentContainer();
  }

  handleKeyUp(e: KeyboardEvent): void {
    if (this.activeBlockHandler.handleKeyUp(e)) {
      return;
    }

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      this.richhint.autoUpdate({ root: this.currentContainer() });
      e.preventDefault();
    } else if (e.key === "Home" || e.key === "End") {
      this.richhint.safeMousePosition();
      this.richhint.autoUpdate({ root: this.currentContainer() });
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
    const root = this.currentContainer();
    if (!root) {
      return;
    }

    if (e.key === "ArrowUp") {
      if (dom.isFirstLine(root)) {
        const neighbor = this.prevContainer();
        if (neighbor) {
          if (this.prevBlockHandler.elementType === "card") {
            const offset = dom.getCaretReletivePosition(
              this.currentContainer()
            );
            dom.setCaretReletivePositionAtLastLine(neighbor, offset);
          } else {
            // active text area or make focus
          }
        }
        e.preventDefault();
        this.richhint.autoUpdate({ root: root });
      }
    } else if (e.key === "ArrowDown") {
      if (dom.isLastLine(root)) {
        const neighbor = this.nextContainer();
        if (neighbor) {
          const offset = dom.getCaretReletivePosition(this.currentContainer());
          dom.setCaretReletivePosition(neighbor, offset);
        }
        e.preventDefault();
        this.richhint.autoUpdate({ root: root });
      }
    } else if (e.key === "ArrowLeft") {
      const sel = document.getSelection();

      let pos = dom.previousValidPosition(root, sel.focusNode, sel.focusOffset);
      if (!pos) {
        const neighbor = this.prevContainer();
        console.log(neighbor);
        if (neighbor) {
          dom.setCaretReletivePosition(neighbor, -1);
        }
        pos = this.richhint.safePosition(dom.currentPosition(neighbor));
        dom.setPosition(pos);
        this.richhint.autoUpdate({ root: neighbor });
      } else {
        // change any invalid position to valid(in #text node)
        pos = this.richhint.safePosition(pos);
        if (e.shiftKey) {
          while (pos && !dom.isTag(pos.container, "#text")) {
            pos = this.richhint.safePosition(pos);
            if (dom.isTag(pos.container, "label")) {
              pos = dom.previousValidPosition(root, pos.container, pos.offset);
              break;
            }
            pos = dom.previousValidPosition(root, pos.container, pos.offset);
          }
          pos = this.richhint.safePosition(pos);
          document
            .getSelection()
            .setBaseAndExtent(
              sel.anchorNode,
              sel.anchorOffset,
              pos.container,
              pos.offset
            );
          console.log([
            sel.anchorNode,
            sel.anchorOffset,
            sel.focusNode,
            sel.focusOffset,
          ]);
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
      pos = dom.nextValidPosition(root, sel.focusNode, sel.focusOffset);
      if (!pos) {
        const neighbor = this.nextContainer();
        if (neighbor) {
          dom.setCaretReletivePosition(neighbor, 0);
        }
        pos = this.richhint.safePosition(dom.currentPosition(neighbor));
        this.richhint.autoUpdate({ root: neighbor });
      } else {
        pos = this.richhint.safePosition(pos);
        if (e.shiftKey) {
          while (pos && !dom.isTag(pos.container, "#text")) {
            pos = this.richhint.safePosition(pos);
            if (dom.isTag(pos.container, "label")) {
              pos = dom.nextValidPosition(root, pos.container, pos.offset);
              break;
            }
            pos = dom.nextValidPosition(root, pos.container, pos.offset);
          }
          pos = this.richhint.safePosition(pos);
          // dom.setPosition(pos, false, true);
          document
            .getSelection()
            .setBaseAndExtent(
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
        .handler.getContainerByNode(node);
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

  processEdit(message) {}
  propgateChange(e: ChangeBlock) {
    const offset = dom.getCaretReletivePosition(this.currentContainer());
    const focusedSerializer = this.serializer.changeBlock(e.focus);
    const focusedContainer = focusedSerializer.handler.firstContainer();
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
      const offset = dom.getCaretReletivePosition(this.currentContainer());
      const focusedSerializer = this.serializer.changeBlock(e.focus);
      const focusedContainer = focusedSerializer.handler.firstContainer();
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
    if (e.offset !== undefined) {
      dom.setCaretReletivePosition(
        newSerializer.handler.firstContainer(),
        e.offset
      );
    }
  }
  propgateMerge(e: MergeEvent) {
    let neighbor: BlockHandler;

    if (e.mergeType === "backspace") {
      neighbor = this.prevBlockHandler;
      const offset = dom.getContentSize(neighbor.lastContainer());
      if (e.elementType === "text" && neighbor.elementType !== "card") {
        neighbor.appendElementsAtLast(e.children);
        this.serializer.removeBlock(e.order);
        dom.setCaretReletivePosition(neighbor.lastContainer(), offset);
        let pos = dom.currentPosition(neighbor.lastContainer());
        pos = this.richhint.safePosition(pos);
        dom.setPosition(pos);
        this.richhint.autoUpdate({ root: neighbor.lastContainer() });
      } else {
        // neighbor.elementType === 'card'
        // select neighbor
      }
    } else if (e.mergeType === "delete") {
      const cur = this.serializer.state.blockSerializers.getValue(
        e.order
      ).handler;
      neighbor = this.nextBlockHandler;
      if (e.elementType === "text") {
        cur.appendElementsAtLast(
          dom.validChildNodes(neighbor.firstContainer())
        );
        if (neighbor.elementType === "text") {
          this.serializer.removeBlock(neighbor.serializer.order);
        } else if (neighbor.elementType === "list") {
          (neighbor as ABCListHandler).removeContainer(
            neighbor.firstContainer()
          );
          if (!(neighbor as ABCListHandler).hasContainer()) {
            this.serializer.removeBlock(neighbor.serializer.order);
          }
        } else {
          // neighbor.elementType === 'card'
          // select neighbor
        }
        this.richhint.autoUpdate({ root: neighbor.lastContainer() });
      } else if (e.elementType === "list") {
        if (neighbor.elementType === "text") {
          cur.appendElementsAtLast(
            dom.validChildNodes(neighbor.firstContainer())
          );
          this.serializer.removeBlock(neighbor.serializer.order);
        } else if (neighbor.elementType === "list") {
          const listNeighbor = neighbor as ABCListHandler;
          (cur as ABCListHandler).appendContainer(...listNeighbor.containers());
          if (!listNeighbor.hasContainer()) {
            this.serializer.removeBlock(neighbor.serializer.order);
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
      const root = this.currentContainer();
      if ((tag = style.isInStyleBound(this.currentContainer(), "left"))) {
        const styleName = style.tagToStyle(tag);
        if (styleName) {
          style.deleteStyle(tag, this.currentContainer());
          e.preventDefault();
        }

        return;
      } else if ((tag = dom.isInLabelBound(this.currentContainer(), "left"))) {
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
    const cur = this.currentContainer();
    dom.setCaretReletivePosition(cur, 0);
    e.preventDefault();
  }
  handleEndDown(e: KeyboardEvent) {
    if (this.activeBlockHandler.handleEndDown(e)) {
      return;
    }
    const cur = this.currentContainer();
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

    this.pushTypeHistory(e.key);
    if (this.tryHandleShortcut(e)) {
      e.preventDefault();
      return;
    }
    console.log(["Page Key Down", e]);
    // dom.currentPosition(this.)
    if (e.key === "Enter") {
      const pos = dom.currentPosition(this.currentContainer());

      if (dom.isTag(pos.container, "label")) {
        const lb: HTMLLabelElement = pos.container as HTMLLabelElement;
        lb.click();
        // lb.classList.add("inline-key-hovered");
        this.richhint.autoUpdate({
          root: this.currentContainer(),
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
      if (e.metaKey) {
        if (style.supportStyleKey(e.key)) {
          style.applyStyle(e.key, this.currentContainer());
          this.richhint.autoUpdate({
            force: true,
            root: this.currentContainer(),
          });
          e.preventDefault();
          return;
        }
      }
    }

    if (this.activeBlockHandler.handleKeyDown(e)) {
      return;
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
  handlePaste(e: ClipboardEvent): boolean | void {}
}
