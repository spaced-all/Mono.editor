import produce from "immer";
import { Heading } from ".";
import { dom, time } from "../../utils";

import { BlockHandler } from "../aBlock/handler";
import { ABCTextHandler } from "../aText";
import { DefaultBlockInfo, HeadingData, ParagraphData } from "../types";

export class HeadingHandler extends ABCTextHandler {
  serializer: Heading;
  handleSpaceDown(e: KeyboardEvent): boolean | void {
    console.log(["Paragraph", e]);
    const key = dom.textContentBefore(this.currentContainer()).trim();
    let data: DefaultBlockInfo;
    let newData: DefaultBlockInfo;
    const lastEditTime = time.getTime();
    switch (key) {
      case "#":
      case "##":
      case "###":
      case "####":
      case "#####":
        dom.deleteTextBefore(this.currentContainer());
        if (this.serializer.data.level === key.length) {
          data = this.serializer.serializeBlockInfo();
          newData = produce(data, (draft: DefaultBlockInfo) => {
            draft.type = "paragraph";
            draft.paragraph = {
              kind: "paragraph",
              children: draft.heading.children,
              lastEditTime: lastEditTime,
            };
            draft.lastEditTime = lastEditTime;
          });

          this.parent.propgateChange({
            kind: "change",
            focus: newData,
          });
        } else {
          this.serializer.updateLevel(key.length);
          // TODO 需要将变更传递给 parent
        }

        e.preventDefault();
        return true;
    }
  }
}
