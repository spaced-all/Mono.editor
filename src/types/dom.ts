type EventHandler<E extends Event> = {
  bivarianceHack(event: E): void;
}["bivarianceHack"];

export type HTMLElementTagName = keyof HTMLElementTagNameMap;
export type ElementTagName = keyof HTMLElementTagNameMap | "#text";
export type HTMLElementType = HTMLElementTagNameMap[HTMLElementTagName];

type ClipboardEventHandler = EventHandler<ClipboardEvent>;
type CompositionEventHandler = EventHandler<CompositionEvent>;
type DragEventHandler = EventHandler<DragEvent>;
type FocusEventHandler = EventHandler<FocusEvent>;
type FormEventHandler = EventHandler<Event>;
type ChangeEventHandler = EventHandler<Event>;
type KeyboardEventHandler = EventHandler<KeyboardEvent>;
type MouseEventHandler = EventHandler<MouseEvent>;
type TouchEventHandler = EventHandler<TouchEvent>;
type PointerEventHandler = EventHandler<PointerEvent>;
type UIEventHandler = EventHandler<UIEvent>;
type WheelEventHandler = EventHandler<WheelEvent>;
type AnimationEventHandler = EventHandler<AnimationEvent>;
type TransitionEventHandler = EventHandler<TransitionEvent>;

export type EventAttribute = {
  [key in keyof HTMLElementEventMap]?: (e: HTMLElementEventMap[key]) => void;
};
