import xmlSafe from "@/util/xmlSafe.js";
import {isVoid} from "@/backend/components/cms/content/html.js";

export function generateTagSource(tag) {
  const templates = {
    aside: () => ['aside', {}, [['p', {}, ['\xa0']]]],
    blockquote: () => ['blockquote', {} [['q', {}, ['\xa0']]]],
    br: () => ['br', {}],
    details: () => ['details', {}, [['summary', {}, ['\xa0']], ['p', {}, ['\xa0']]]],
    hr: () => ['hr', {}],
    ol: () => ['ol', {}, [['li', {}, ['\xa0']]]],
    table: () => ['table', {}, [['tbody', {}, ['tr', {}, [['td', {}, ['\xa0']]]]]]],
    ul: () => ['ul', {}, [['li', {}, ['\xa0']]]],
  };

  if (typeof tag === "string" && templates.hasOwnProperty(tag)) {
    tag = templates[tag]();
  }

  const newTag = Array.isArray(tag) ? tag.slice(0, 3)
    : [String(tag), {}, ["\xa0"]];
  return newTag;
}

export function attribute(attr, valueSpec) {
  return `${xmlSafe(attr)}="${xmlSafe(valueSpec).replace(/"/g, '&quot;')}"`;
}
export function getClassNames(classSpec) {
  return Object.entries(classSpec).filter(([, v]) => v).map(([k]) => k).join(" ");
}
export function createHTML(tag, ...args) {
  const options = args.find($ => typeof $ === "object" && $ !== null && !Array.isArray($));

  const content = args.find($ => Array.isArray($));

  const tagParts = [xmlSafe(tag)];

  function addAttribute([k, v]) {
    if (v == null || v === false) {
      // Do nothing
    } else if (v === true) {
      tagParts.push(attribute(k, ""));
    } else {
      tagParts.push(attribute(k, v));
    }
  }

  const {attrs, "class": _class, props, style} = options ?? {};

  if (attrs != null) {
    Object.entries(attrs).forEach(addAttribute);
  }

  if (props != null) {
    Object.entries(props).forEach(addAttribute);
  }

  if (_class != null) {
    tagParts.push(attribute("class", getClassNames(_class)));
  }

  if (style != null) {
    tagParts.push(attribute("style", style));
  }

  if (isVoid(tag)) {
    return `<${tagParts.join(" ")}>`;
  }

  const tagContent = content == null ? "" : content.map(specToHTML).join("");

  return `<${tagParts.join(" ")}>${tagContent}</${tagParts[0]}>`;
}
export function specToHTML(spec) {
  return Array.isArray(spec) ? createHTML(...spec) : xmlSafe(spec);
}


