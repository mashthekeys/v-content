
const otherVoidElements = [
  {
    name: "area",
    display: "none",
    "void": true,
  },
  {
    name: "base",
    display: "none",
    "void": true,
  },
  {
    name: "col",
    display: "table-column",
    "void": true,
  },
  {
    name: "keygen",
    display: "none",
    "void": true,
  },
  {
    name: "link",
    display: "none",
    "void": true,
  },
  {
    name: "meta",
    display: "none",
    "void": true,
  },
  {
    name: "param",
    display: "none",
    "void": true,
  },
  {
    name: "source",
    display: "none",
    "void": true,
  },
  {
    name: "track",
    display: "none",
    "void": true,
  },
  // And the following void tags are listed in other sections.
  // <br>
  // <embed>
  // <hr>
  // <img>
  // <input>
  // <wbr>
];

const pageTemplate = [
  {
    name: "footer",
    display: "block",
  },
  {
    name: "header",
    display: "block",
  },
  {
    name: "main",
    display: "block",
  },
  {
    name: "nav",
    display: "block",
  },
];

const listOnly = [
  {
    name: "dd",
    display: "block",
  },
  {
    name: "dt",
    display: "block",
  },
  {
    name: "li",
    display: "block",
  },
  {
    name: "summary",
    display: "block",
  },
];
const forms = [
  {
    name: "form",
    display: "block",
  },
  {
    name: "fieldset",
    display: "block",
  },
  {
    name: "button",
    display: "inline",
  },
  {
    name: "datalist",
    display: "inline",
  },
  {
    name: "input",
    display: "inline",
    "void": true,
  },
  {
    name: "label",
    display: "inline",
  },
  {
    name: "meter",
    display: "inline",
  },
  {
    name: "output",
    display: "inline",
  },
  {
    name: "progress",
    display: "inline",
  },
  {
    name: "select",
    display: "inline",
  },
  {
    name: "textarea",
    display: "inline",
  },
];
const reserved = [
  {
    name: "audio",
    display: "inline-block",
  },
  {
    name: "canvas",
    display: "inline-block",
  },
  {
    name: "dialog",
    display: "block",
  },
  {
    name: "dfn",
    display: "inline",
  },
  {
    name: "embed",
    display: "inline-block",
    "void": true,
  },
  {
    name: "iframe",
    display: "inline-block",
  },
  {
    name: "noscript",
    display: "inline",
  },
  {
    name: "object",
    display: "inline-block",
  },
  {
    name: "script",
    display: "inline",
  },
  {
    name: "slot",
    display: "inline",
  },
  {
    name: "template",
    display: "inline",
  },
  {
    name: "video",
    display: "inline-block",
  },
];

export const layout = [
  {
    name: "br",
    display: "inline",
    "void": true,
  },
  {
    name: "details",
    display: "block",
  },
  {
    name: "hr",
    display: "block",
    "void": true,
  },
  {
    name: "table",
    display: "table",
  },
];

export const structural = [
  {
    name: "article",
    display: "block",
  },
  {
    name: "aside",
    display: "block",
  },
  {
    name: "section",
    display: "block",
  },
];

export const special = [
  {
    name: "address",
    display: "block",
  },
  {
    name: "bdi",
    display: "inline",
  },
  {
    name: "bdo",
    display: "inline",
  },
  {
    name: "data",
    display: "inline",
  },
  {
    name: "figcaption",
    display: "block",
  },
  {
    name: "figure",
    display: "block",
  },
  {
    name: "hgroup",
    display: "block",
  },
  {
    name: "img",
    display: "inline",
    "void": true,
  },
  {
    name: "map",
    display: "inline",
  },
  {
    name: "picture",
    display: "inline",
  },
  {
    name: "ruby",
    display: "inline",
  },
  {
    name: "svg",
    display: "inline",
  },
  {
    name: "time",
    display: "inline",
  },
  {
    name: "wbr",
    display: "inline",
    "void": true,
  },
];

export const inline = [
  {
    name: "a",
    display: "inline",
    style: {textDecoration: "dotted underline blue"},
  },
  {
    name: "abbr",
    display: "inline",
    style: {textDecoration: "dashed underline"},
  },
  {
    name: "acronym",
    display: "inline",
    style: {textDecoration: "dashed underline"},
  },
  {
    name: "b",
    display: "inline",
    style: {fontWeight: "bold"},
  },
  {
    name: "big",
    display: "inline",
    style: {fontSize: "105%"},
  },
  {
    name: "cite",
    display: "inline",
    style: {},
  },
  {
    name: "code",
    display: "inline",
    style: {fontFamily: "monospace"},
  },
  {
    name: "del",
    display: "inline",
    style: {textDecoration: "dotted line-through red", opacity: "0.8"},
  },
  {
    name: "em",
    display: "inline",
    style: {fontStyle: "italic"},
  },
  {
    name: "i",
    display: "inline",
    style: {fontStyle: "italic"},
  },
  {
    name: "ins",
    display: "inline",
    style: {textDecoration: "dotted underline green"},
  },
  {
    name: "kbd",
    display: "inline",
    style: {fontWeight: "bold"},
  },
  {
    name: "mark",
    display: "inline",
    style: {backgroundColor: "yellow"},
  },
  {
    name: "q",
    display: "inline",
    class: {"html-q": true},
  },
  {
    name: "s",
    display: "inline",
    style: {textDecoration: "line-through"},
  },
  {
    name: "samp",
    display: "inline",
    style: {fontFamily: "monospace"},
  },
  {
    name: "small",
    display: "inline",
    style: {fontSize: "95.2%"},
  },
  {
    name: "span",
    display: "inline",
    style: {},
  },
  {
    name: "strong",
    display: "inline",
    style: {fontWeight: "bold"},
  },
  {
    name: "sub",
    display: "inline",
    style: {  verticalAlign: "sub", fontSize: "83%" },
  },
  {
    name: "sup",
    display: "inline",
    style: {  verticalAlign: "super", fontSize: "83%" },
  },
  {
    name: "u",
    display: "inline",
    style: {textDecoration: "underline"},
  },
  {
    name: "tt",
    display: "inline",
    style: {fontFamily: "monospace"},
  },
  {
    name: "var",
    display: "inline",
    style: {fontStyle: "italic"},
  },
];

export const block = [
  {
    name: "blockquote",
    display: "block",
    class: {"html-blockquote": true},
    style: {marginLeft: "2rem", marginRight: "2rem"},
  },
  {
    name: "div",
    display: "block",
    style: {},
  },
  {
    name: "dl",
    display: "block",
  },
  {
    name: "h1",
    display: "block",
    style: {fontWeight: "900", fontSize: "1.6rem"},
  },
  {
    name: "h2",
    display: "block",
    style: {fontWeight: "900", fontSize: "1.5rem"},
  },
  {
    name: "h3",
    display: "block",
    style: {fontWeight: "900", fontSize: "1.4rem"},
  },
  {
    name: "h4",
    display: "block",
    style: {fontWeight: "bold", fontSize: "1.3rem"},
  },
  {
    name: "h5",
    display: "block",
    style: {fontWeight: "bold", fontSize: "1.2rem"},
  },
  {
    name: "h6",
    display: "block",
    style: {fontWeight: "bold", fontSize: "1.1rem"},

  },
  {
    name: "ol",
    display: "block",
  },
  {
    name: "p",
    display: "block",
    style: {
      marginTop: "0.25em",
      marginBottom: "0.25em",
    },
  },
  {
    name: "pre",
    display: "block",
    style: {fontFamily: "monospace", whiteSpace: "pre"},
  },
  {
    name: "ul",
    display: "block",
  },
];

export const cmsElements = {
  inline,
  block,
  structural,
  layout,
};

cmsElements.all = [...block, ...inline, ...layout, ...structural];
export const voidElements = cmsElements.all.concat(otherVoidElements).filter($ => $.void);

const HTMLBlockElements = block.concat(
  structural,
  layout
).map($ => $.name);

export function isBlock(s) {
  return HTMLBlockElements.includes(s);
}

const HTMLVoidElements = voidElements.map($ => $.name);

export function isVoid(s) {
  return HTMLVoidElements.includes(s);
}