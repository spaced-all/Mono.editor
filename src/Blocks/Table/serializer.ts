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
  TableData,
  IndentItem,
  OrderedListData,
  UnorderedListData,
  TableDataFrame,
  TableCell,
} from "../types";
import { TableHandler } from "./handler";

export interface SerializeMessage {
  insert?: boolean;
  activate?: boolean;
}
export interface TableProps extends ElementProps {
  className?: string;
}
export interface TableState extends ElementState {
  activate?: boolean;
}

export class Table extends ABCBlockElement<TableProps, TableState> {
  static elName: string = "table";
  readonly blockType: string = "table";
  elementType: "text" | "list" | "card" = "list";

  public get contentEditableName(): HTMLElementTagName {
    return "table";
  }

  public get data(): TableData {
    const data = this.state.data;
    return data[data.type] as any;
  }

  public get handlerType(): typeof TableHandler {
    return TableHandler;
  }

  public get listStyleTypes(): string[] {
    return ["decimal", "lower-alpha", "lower-roman"];
  }
  serialize(): TableData {
    const lastEditTime = time.getTime();
    const newData = produce(this.data, (draft) => {
      const dataframe: TableDataFrame = [];
      this.root.querySelectorAll("tl").forEach((row) => {
        const rowData: TableCell[] = [];
        row.querySelectorAll("td").forEach((cell) => {
          rowData.push({
            children: serializeInlineElement(dom.validChildNodes(cell)),
            lastEditTime: lastEditTime,
          });
        });
        dataframe.push(rowData);
      });
      draft.items = dataframe;
      draft.lastEditTime = lastEditTime;
    });
    return newData;
  }

  renderInner(): [Node[], Renderable[]] {
    const renderables: Renderable[] = [];
    const res = this.data.items.map((row, rid) => {
      const tr = createElement("tr");
      const cells = row.map((cell, cid) => {
        const [nodes, noticables] = renderInlineElement(cell.children);
        const td = createElement("td", {
          children: nodes,
        });
        renderables.push(...noticables);
        return td;
      });

      tr.append(...cells);

      return tr;
    });

    return [res, renderables];
  }
}
