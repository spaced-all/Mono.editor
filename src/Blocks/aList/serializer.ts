import produce from "immer";
import {
  renderInlineElement,
  serializeInlineElement,
} from "../../Inlines/serializer";
import { InlineElement } from "../../Inlines/types";
import { HTMLElementTagName } from "../../types/dom";
import { Renderable } from "../../types/renderable";
import { dom, time } from "../../utils";
import { createElement } from "../../utils/contrib";
import { ABCBlockElement, ElementProps, ElementState } from "../aBlock";
import { BlockHandler } from "../aBlock/handler";
import {
  ABCListData,
  IndentItem,
  OrderedListData,
  UnorderedListData,
} from "../types";
import { ABCListHandler } from "./handler";

export interface SerializeMessage {
  insert?: boolean;
  activate?: boolean;
}
export interface ABCListProps extends ElementProps {
  className?: string;
}
export interface ABCListState extends ElementState {
  activate?: boolean;
}

export class ABCList<
  P extends ABCListProps,
  S extends ABCListState
> extends ABCBlockElement<P, S> {
  elementType: "text" | "list" | "card" = "list";
  public get data(): ABCListData<any> {
    const data = this.state.data;
    return data[data.type] as any;
  }

  public get handlerType(): typeof BlockHandler {
    return ABCListHandler;
  }

  public get listStyleTypes(): string[] {
    return ["decimal", "lower-alpha", "lower-roman"];
  }
  serialize(): ABCListData<any> {
    const lastEditTime = time.getTime();
    const newData = produce(this.data, (draft) => {
      const items: IndentItem[] = [];
      this.root.querySelectorAll("li").forEach((c) => {
        items.push({
          children: serializeInlineElement(dom.validChildNodes(c)),
          level: parseFloat(c.getAttribute("data-level")),
          lastEditTime: lastEditTime,
        });
      });
      draft.items = items;
      draft.lastEditTime = lastEditTime;
    });
    return newData;
  }

  createLi(level?, ind?, value?, children?) {
    const li = createElement("li");
    this.updateLi(li, level, ind, value, children);
    return li;
  }

  updateLi(li: HTMLLIElement, level?, ind?, value?, children?: Node[]) {
    if (Number.isInteger(ind)) {
      li.setAttribute("data-index", `${ind}`);
    }
    if (Number.isInteger(level)) {
      li.setAttribute("data-level", `${level}`);
      const types = this.listStyleTypes;
      li.style.listStyleType = types[(level - 1) % types.length];
      li.style.marginLeft = `${(level - 1) * 40}px`;
    }
    if (Number.isInteger(value)) {
      li.setAttribute("value", `${value}`);
    }
    if (children) {
      li.innerHTML = "";
      li.append(...children);
    }
  }

  appendContainer(children: InlineElement[], level?) {
    const [nodes, renderables] = renderInlineElement(children);
    const li = this.createLi(level, null, null, nodes);
    this.outer.appendChild(li);
    this.consumeUpdate(renderables);
    this.updateValue();
  }

  appendContainerChild(li) {
    const level = parseFloat(li.getAttribute("data-level"));
    this.updateLi(li, level);
    this.outer.appendChild(li);
  }

  renderInner(): [Node[], Renderable[]] {
    const renderables: Renderable[] = [];
    const res = this.data.items.map((c, ind) => {
      const [nodes, noticables] = renderInlineElement(c.children);
      const li = createElement("li", {
        children: nodes,
      });
      this.updateLi(li, c.level, ind);

      renderables.push(...noticables);
      return li;
    });

    this.updateValue(res);
    return [res, renderables];
  }

  updateValue(containers?: HTMLLIElement[]) {}
}
