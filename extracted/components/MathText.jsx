import { useMemo } from "react";
import katex from "katex";

const RENDER_OPTS = {
  throwOnError: false,
  errorColor: "#FF007A",
  strict: "ignore",
  trust: false,
  output: "html",
};

const TOKEN = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\])/g;

const strip = (raw) => {
  if (raw.startsWith("$$") && raw.endsWith("$$")) return [raw.slice(2, -2), true];
  if (raw.startsWith("\\[") && raw.endsWith("\\]")) return [raw.slice(2, -2), true];
  if (raw.startsWith("\\(") && raw.endsWith("\\)")) return [raw.slice(2, -2), false];
  return [raw.slice(1, -1), false];
};

const isDisplay = (raw) =>
  (raw.startsWith("$$") && raw.endsWith("$$")) || (raw.startsWith("\\[") && raw.endsWith("\\]"));

/**
 * Renders text that may contain LaTeX between $...$ (inline) or $$...$$ (display).
 * Plain text outside the delimiters keeps its line breaks.
 */
export const MathText = ({ children, className = "", as: Tag = "div" }) => {
  const parts = useMemo(() => {
    const text = children == null ? "" : String(children);
    const raw = text.split(TOKEN).filter((p) => p !== "" && p !== undefined);
    // Collapse the blank lines that surround a display formula so it sits tight.
    return raw.map((part, i) => {
      TOKEN.lastIndex = 0;
      if (TOKEN.test(part)) {
        TOKEN.lastIndex = 0;
        return part;
      }
      TOKEN.lastIndex = 0;
      let out = part;
      const prev = raw[i - 1];
      const next = raw[i + 1];
      if (prev && isDisplay(prev)) out = out.replace(/^\s*\n+/, "");
      if (next && isDisplay(next)) out = out.replace(/\n+\s*$/, "");
      return out;
    });
  }, [children]);

  return (
    <Tag className={`sigma-math whitespace-pre-wrap ${className}`}>
      {parts.map((part, i) => {
        if (TOKEN.test(part)) {
          TOKEN.lastIndex = 0;
          const [tex, display] = strip(part);
          let html;
          try {
            html = katex.renderToString(tex, { ...RENDER_OPTS, displayMode: display });
          } catch {
            return (
              <span key={i} className="mono text-sigma-magenta">
                {tex}
              </span>
            );
          }
          return (
            <span
              key={i}
              className={display ? "my-2 block overflow-x-auto text-center" : "inline-block"}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }
        TOKEN.lastIndex = 0;
        return <span key={i}>{part}</span>;
      })}
    </Tag>
  );
};
