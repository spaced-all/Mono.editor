import produce from "immer";
import {
  renderInlineElement,
  serializeInlineElement,
} from "../../Inlines/serializer";
import { InlineElement } from "../../Inlines/types";
import { HTMLElementTagName } from "../../types/dom";
import { dom, time } from "../../utils";
import { createElement } from "../../utils/contrib";
import { ABCBlockElement, ElementProps, ElementState } from "../aBlock";
import { BlockHandler } from "../aBlock/handler";
import { ABCList, ABCListProps, ABCListState } from "../aList";
import {
  IndentItem,
  OrderedIndentItem,
  OrderedListData,
  UnorderedListData,
} from "../types";
import { OrderedListHandler } from "./handler";

export interface SerializeMessage {
  insert?: boolean;
  activate?: boolean;
}
export interface OrderedListProps extends ABCListProps {
  className?: string;
}
export interface OrderedListState extends ABCListState {
  activate?: boolean;
}

export class OrderedList extends ABCList<OrderedListProps, OrderedListState> {
  static elName: string = "orderedlist";
  readonly blockType: string = "orderedlist";

  public get contentEditableName(): HTMLElementTagName {
    return "ol";
  }

  public get placeholder(): string | undefined {
    return undefined;
  }

  constructor(props: OrderedListProps) {
    super(props);
  }

  public get data(): OrderedListData {
    return this.state.data.orderedlist;
  }

  public get handlerType(): typeof BlockHandler {
    return OrderedListHandler;
  }

  public get listStyleTypes(): string[] {
    return ["decimal", "lower-alpha", "lower-roman"];
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

  updateValue(containers?: HTMLLIElement[]) {
    if (!containers) {
      containers = this.outer.querySelectorAll("li") as any as HTMLLIElement[];
    }
    const lvstack = [];

    containers.forEach((container, ind, arr) => {
      const level = parseFloat(container.getAttribute("data-level"));
      while (lvstack[level] === undefined) {
        lvstack.push(0);
      }
      while (level < lvstack.length - 1) {
        lvstack.pop();
      }
      lvstack[level]++;

      this.updateLi(container, null, ind, lvstack[level]);
    });
  }
}
