import KaTeX from "katex";
import "katex/dist/katex.min.css";

export function generateHTML(math: string, el, displayMode = false) {
  const { errorColor, renderError } = {} as any;
  let html, error;
  try {
    html = KaTeX.renderToString(math, {
      displayMode: displayMode,
      errorColor,
      throwOnError: !!renderError,
    });
    el.innerHTML = html;
  } catch (e) {
    if (error instanceof KaTeX.ParseError || error instanceof TypeError) {
      error = e;
      el.innerHTML = error;
    }
    throw e;
  }
  return { html, error };
}
