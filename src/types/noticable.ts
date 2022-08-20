export interface Noticable {
  notify(): void;
  componentDidMount(): void;
  componentDidRendered(): void;
  componentDidUnmount(): void;
}
