import { Color } from "../types/color";

export interface Attributes {
  className?: string;
  href?: string;
  src?: string;
}

export interface Inline {
  kind: string;
}

export interface PlainText {
  kind: "#text";
  text: string;
}

export interface BasicFormattedText extends Inline {
  kind: string;
  text?: string;
  attributes?: Attributes;
  children?: InlineElement[];
}

export interface Code extends BasicFormattedText {
  kind: "code";
}
export interface Delete extends BasicFormattedText {
  kind: "s" | "del";
}
export interface Italic extends BasicFormattedText {
  kind: "i" | "italic";
}
export interface Bold extends BasicFormattedText {
  kind: "b" | "bold";
}

export interface EmphasizedText extends BasicFormattedText {
  kind: "em";
  color?: Color;
  backgroundColor?: Color;
}

export interface InlineComponent extends Inline {
  kind: string;
}

export interface Link extends InlineComponent {
  kind: "link" | "a";
}
export interface Image extends InlineComponent {
  kind: "image";
}
export interface Math extends InlineComponent {
  kind: "math" | "formular";
  value: string;
}
export interface Relation extends InlineComponent {
  kind: "relation";
}
export interface Todo extends InlineComponent {
  kind: "todo";
}

type ExtendInlineComponentKind = `@${string}`;
export interface ExtendInlineComponent extends InlineComponent {
  kind: ExtendInlineComponentKind;
}

export interface InlineElementMap {
  "#text": PlainText;

  b: Bold;
  bold: Bold;
  i: Italic;
  italic: Italic;
  code: Code;
  s: Delete;
  del: Delete;

  em: EmphasizedText;

  todo: Todo;
  link: Link;
  image: Image;
  math: Math;
  relation: Relation;
  [key: ExtendInlineComponentKind]: ExtendInlineComponent;
}

// export declare type DefaultInlineElement =
//   InlineElementMap[keyof InlineElementMap];

export declare type InlineElement = InlineElementMap[keyof InlineElementMap];
