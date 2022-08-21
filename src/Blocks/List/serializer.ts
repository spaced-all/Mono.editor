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
import { IndentItem, UnorderedListData } from "../types";
import { ListHandler } from "./handler";

export interface SerializeMessage {
  insert?: boolean;
  activate?: boolean;
}
export interface ListProps extends ABCListProps {
  className?: string;
}
export interface ListState extends ABCListState {
  activate?: boolean;
}

export class List extends ABCList<ListProps, ListState> {
  static elName: string = "list";
  readonly blockType: string = "list";

  public get contentEditableName(): HTMLElementTagName {
    return "ul";
  }

  constructor(props: ListProps) {
    super(props);
  }

  public get data(): UnorderedListData {
    return this.state.data.list;
  }

  public get handlerType(): typeof BlockHandler {
    return ListHandler;
  }

  public get listStyleTypes(): string[] {
    return ["disc", "circle", "square"];
  }

  updateValue(containers?: HTMLLIElement[]): void {
    if (!containers) {
      containers = this.outer.querySelectorAll("li") as any as HTMLLIElement[];
    }

    containers.forEach((container, ind, arr) => {
      this.updateLi(container, null, ind, null);
    });
  }
}
