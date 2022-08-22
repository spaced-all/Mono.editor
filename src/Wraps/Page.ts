import { BlockHandler } from "../Blocks/aBlock/handler";
import { blockRegister } from "../Blocks/register";
import {
  BlockComponent,
  BlockComponentType,
  BlockType,
  DefaultBlockInfo,
  OrderString,
} from "../Blocks/types";
import { dom } from "../utils";
import { HTMLElementType } from "../types/dom";
import { Renderable } from "../types/renderable";
import { createElement } from "../utils/contrib";

import "../styles/page.css";

import { PageHandler } from "./pageHandler";
import LinkedDict from "../struct/LinkedDict";
import { midString } from "../utils/order";
import produce from "immer";

export interface PageProps {
  initialData?: DefaultBlockInfo[];
}

export interface PageState {
  blocks: DefaultBlockInfo[];
  order?: OrderString[];

  blockSerializers: LinkedDict<BlockComponent>;
  orderedBlock?: { [key: OrderString]: DefaultBlockInfo };
}

export interface EditState {
  composite: boolean;
  mode: "edit" | "selection" | "preview";
  typeHistory: string[];
}

export class Page extends Renderable {
  props: PageProps;
  state: PageState;
  handler: PageHandler;
  edit: EditState;

  constructor(props: PageProps) {
    super();
    const blocks = props.initialData || [];

    let orderedBlock = {};
    blocks.forEach((item) => {
      orderedBlock[item.order] = item;
    });
    let order = blocks.map((item) => item.order).sort();
    this.state = {
      blocks: blocks,
      order: order,
      orderedBlock: orderedBlock,

      blockSerializers: new LinkedDict(),
    };
    this.edit = {
      composite: false,
      typeHistory: [],
      mode: "edit",
    };
    this.handler = new PageHandler(this);
  }

  rootDidMount(): void {}

  /**
   * 按 order 顺序遍历所有 block
   *  包括添加、删除、移动、split、merge、change
   *
   * 添加：
   *
   * @param blockData
   */
  changeBlock(blockData: DefaultBlockInfo): BlockComponent {
    console.log(["changeBlock", blockData]);
    const blockType = blockRegister.get(blockData.type);

    const blockSerializer = new blockType({
      initialData: blockData,
      metaInfo: {
        order: blockData.order,
        id: blockData.id,
        type: blockData.type,
      },
    });

    blockSerializer.handler.bindParent(this.handler);
    const oldSerializer = this.state.blockSerializers.getValue(blockData.order);
    blockSerializer.replace(oldSerializer.root);
    this.state.blockSerializers.replace(blockData.order, blockSerializer);
    return blockSerializer;
  }

  insertBlockAt(
    blockData: DefaultBlockInfo,
    order: string,
    where: "before" | "after"
  ) {
    const seek = this.state.blockSerializers.getNode(order);
    const pair =
      where === "after"
        ? [order, seek.next.value()]
        : [seek.prev.value(), order];
    const newOrder = midString(pair[0], pair[1]);
    blockData = produce(blockData, (draft) => {
      draft.order = newOrder;
    });

    const blockType = blockRegister.get(blockData.type);

    const blockSerializer = new blockType({
      initialData: blockData,
      metaInfo: {
        order: blockData.order,
        id: blockData.id,
        type: blockData.type,
      },
    });

    blockSerializer.handler.bindParent(this.handler);
    this.state.blockSerializers.insertAt(
      blockData.order,
      blockSerializer,
      order,
      where
    );

    const oldSerializer = this.state.blockSerializers.getValue(order);
    if (where === "after") {
      blockSerializer.insertAfter(oldSerializer.root);
    } else if (where === "before") {
      blockSerializer.insertBefore(oldSerializer.root);
    }

    return blockSerializer;
  }

  insertBlockAfter(blockData: DefaultBlockInfo, order: string) {
    return this.insertBlockAt(blockData, order, "after");
  }
  insertBlockBefore(blockData: DefaultBlockInfo, order?: string) {
    return this.insertBlockAt(blockData, order, "before");
  }

  removeBlock(order: string) {
    const serializer = this.state.blockSerializers.getValue(order);
    serializer.handler.unbindParent();
    serializer.remove();
    this.state.blockSerializers.remove(order);
  }

  renderRoot() {
    const root = createElement("article", {
      className: "mono-page",
      attributes: {
        contenteditable: "true",
        tabindex: 1,
      },
      handler: this.handler,
    });
    return root;
  }

  renderChildren(): [Node[], Renderable[]] {
    const { order, orderedBlock } = this.state;
    const noticables: Renderable[] = [];
    const nodes: Node[] = [];
    order.forEach((oid, ind) => {
      const blockInfo = orderedBlock[oid];
      if (!blockInfo) {
        return;
      }
      const blockType = blockRegister.get(blockInfo.type);
      const blockData = orderedBlock[oid];
      if (blockType === undefined) {
        console.log(["blockType", blockInfo]);
        return;
      }
      const blockSerializer = new blockType({
        initialData: blockData as DefaultBlockInfo,
        metaInfo: {
          order: blockInfo.order,
          id: blockInfo.id,
          type: blockInfo.type,
        },
      });

      const [node, noticable] = blockSerializer.lazyRender();
      // blockElements.push(node);
      noticables.push(noticable);
      nodes.push(node);
      blockSerializer.handler.bindParent(this.handler);
      this.state.blockSerializers.set(oid, blockSerializer);
    });

    return [nodes, noticables];
  }
}
