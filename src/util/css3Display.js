
/**
 * Transforms CSS 'display' values into CSS3's canonical
 * '<display-outside> <display-inside> <display-listitem>' format.
 *
 * For example, 'block' will be transformed into 'block flow-root',
 * and 'inline-flex' will be transformed into 'inline flex'.
 *
 * Set the returnType parameter to 'object' to receive an object with
 * outer, inner and listItem keys.
 * @param displayValue
 * @param returnType
 */
export default function css3Display(displayValue, returnType = "string") {
  let inner, outer, listItem = undefined, object;

  displayValue = String(displayValue).trim().toLowerCase();

  if (/ /.test(displayValue)) {
    const tokens = displayValue.split(/\s+/);

    if (tokens.includes("list-item")) {
      listItem = "list-item";

      if (tokens.includes("flow-root")) {
        inner = "flow-root";
      } else {
        inner = "flow";
      }

      outer = tokens.find($ => $ !== "list-item" && $ !== "flow" && $ !== "flow-root") ?? "block";

    } else {
      [outer, inner] = tokens;
    }
  } else if (lookup.hasOwnProperty(displayValue)) {

    if (returnType === "string") return lookup[displayValue];

    [outer, inner, listItem] = lookup[displayValue].split(" ");
  } else {
    outer = displayValue;
    inner = displayValue;
  }

  if (returnType === "object") {
    return {outer, inner, listItem};

  } else if (returnType === "string") {
    return [outer, inner, listItem].filter($ => $?.length).join(" ");
  }
}


const lookup = {
  "block": "block flow",
  "inline": "inline flow",

  "flow": "block flow",
  "flow-root": "block flow-root",
  "table": "block table",
  "flex": "block flex",
  "grid": "block grid",

  "ruby": "inline ruby",

  "inline-block": "inline flow-root",
  "inline-table": "inline table",
  "inline-flex": "inline flex",
  "inline-grid": "inline grid",

  "list-item": "block flow list-item",
};