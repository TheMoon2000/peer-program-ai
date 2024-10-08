import axios from "axios";

export const BLANK_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

export const HOST = "pearprogram.co";
export const axiosInstance = axios.create({
  baseURL: `https://${HOST}/api`,
});
export const rustpadInstance = axios.create({
  baseURL: `https://${HOST}/rustpad/api`
})


export const SYNTAX_THEME = {
    "code[class*=\"language-\"]": {
      "color": "black",
      "maxWidth": "100%",
      "background": "none",
      "fontFamily": "Menlo, Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
      "fontSize": "95%",
      "textAlign": "left",
      "whiteSpace": "pre",
      "wordSpacing": "normal",
      "wordBreak": "normal",
      "wordWrap": "break-word",
      "lineHeight": "1.5",
      "MozTabSize": "4",
      "OTabSize": "4",
      "tabSize": "4",
      "WebkitHyphens": "none",
      "MozHyphens": "none",
      "msHyphens": "none",
      "hyphens": "none",
    },
    "pre[class*=\"language-\"]": {
      "borderRadius": "6px",
      "maxWidth": "100%",
      "color": "black",
      "background": "#d0d0d060",
      "fontFamily": "Menlo, Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
      "fontSize": "1em",
      "textAlign": "left",
      "whiteSpace": "pre",
      "wordSpacing": "normal",
      "wordBreak": "normal",
      "wordWrap": "break-word",
      "lineHeight": "1.5",
      "MozTabSize": "4",
      "OTabSize": "4",
      "tabSize": "4",
      "WebkitHyphens": "none",
      "MozHyphens": "none",
      "msHyphens": "none",
      "hyphens": "none",
      "padding": "1em",
      "margin": ".5em 0",
      "overflow": "auto"
    },
    "pre[class*=\"language-\"]::-moz-selection": {
      "textShadow": "none",
      "background": "#b3d4fc"
    },
    "pre[class*=\"language-\"] ::-moz-selection": {
      "textShadow": "none",
      "background": "#b3d4fc"
    },
    "code[class*=\"language-\"]::-moz-selection": {
      "textShadow": "none",
      "background": "#b3d4fc"
    },
    "code[class*=\"language-\"] ::-moz-selection": {
      "textShadow": "none",
      "background": "#b3d4fc"
    },
    "pre[class*=\"language-\"]::selection": {
      "textShadow": "none",
      "background": "#b3d4fc"
    },
    "pre[class*=\"language-\"] ::selection": {
      "textShadow": "none",
      "background": "#b3d4fc"
    },
    "code[class*=\"language-\"]::selection": {
      "textShadow": "none",
      "background": "#b3d4fc"
    },
    "code[class*=\"language-\"] ::selection": {
      "textShadow": "none",
      "background": "#b3d4fc"
    },
    ":not(pre) > code[class*=\"language-\"]": {
      "background": "#f5f2f0",
      "padding": ".1em",
      "borderRadius": ".3em",
      "whiteSpace": "normal"
    },
    "comment": {
      "color": "slategray"
    },
    "prolog": {
      "color": "slategray"
    },
    "doctype": {
      "color": "slategray"
    },
    "cdata": {
      "color": "slategray"
    },
    "punctuation": {
      "color": "#555"
    },
    "namespace": {
      "Opacity": ".7"
    },
    "property": {
      "color": "#905"
    },
    "tag": {
      "color": "#905"
    },
    "boolean": {
      "color": "#AD3DA4",
      "fontWeight": "600"
    },
    "number": {
      "color": "#276AC8"
    },
    "constant": {
      "color": "#905"
    },
    "symbol": {
      "color": "#905"
    },
    "deleted": {
      "color": "#905"
    },
    "selector": {
      "color": "#690"
    },
    "attr-name": {
      "color": "#690"
    },
    "string": {
      "color": "#D12F1B"
    },
    "char": {
      "color": "#690"
    },
    "builtin": {
      "color": "#804FB8"
    },
    "inserted": {
      "color": "#690"
    },
    "operator": {
      "color": "#202020",
    },
    "entity": {
      "color": "#9a6e3a",
      "cursor": "help"
    },
    "url": {
      "color": "#9a6e3a",
    },
    ".language-css .token.string": {
      "color": "#9a6e3a",
    },
    ".style .token.string": {
      "color": "#9a6e3a",
    },
    "atrule": { // Swift decorator
      "color": "#b5b"
    },
    "attr-value": {
      "color": "#07a"
    },
    "keyword": {
      "color": "#AD3DA4",
      "fontWeight": "600"
    },
    "function": {
      "color": "#3E8087"
    },
    "class-name": {
      "color": "#4B21B0"
    },
    "regex": {
      "color": "#e90"
    },
    "important": {
      "color": "#e90",
      "fontWeight": "bold"
    },
    "variable": {
      "color": "#e90"
    },
    "bold": {
      "fontWeight": "bold"
    },
    "italic": {
      "fontStyle": "italic"
    }
};


export enum DatasetNames {
  mnist = "mnist",
  cifar10 = "cifar10",
  example = "example"
}

export function formatTimeInterval(ms: number): string {
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor(ms / 1000)
  if (days >= 1) {
      return `${days} day${days === 1 ? "" : "s"}`
  } else if (hours >= 1) {
      return `${hours} hour${hours === 1 ? "" : "s"}`
  } else if (minutes >= 1) {
      return `${minutes} minute${minutes === 1 ? "" : "s"}`
  } else {
      return `${seconds} second${seconds === 1 ? "" : "s"}`
  }
}