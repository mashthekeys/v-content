import {VIcon} from "vuetify/lib/components";

const icons = {
  p: "mdi-format-paragraph",
  ul: "mdi-format-list-bulleted",
  ol: "mdi-format-list-numbered",
  li: "mdi-circle-small",
  blockquote: "mdi-comment-quote",
  h1: "mdi-format-header-1",
  h2: "mdi-format-header-2",
  h3: "mdi-format-header-3",
  h4: "mdi-format-header-4",
  h5: "mdi-format-header-5",
  h6: "mdi-format-header-6",
  br: "mdi-keyboard-return",
  hr: "mdi-minus",
  table: "mdi-grid",
  thead: "mdi-page-layout-header",
  tbody: "mdi-page-layout-body",
  tfoot: "mdi-page-layout-footer",
  tr: "mdi-table-row",
  col: "mdi-table-column",
  details: "mdi-format-list-bulleted-triangle",
  summary: "mdi-triangle-small-down",
  aside: "mdi-tooltip-outline",
  div: "", // No icon is fine

  b: "mdi-format-bold",
  i: "mdi-format-italic",
  u: "mdi-format-underline",
  q: "mdi-format-quote-open",
  cite: "by",
  a: "mdi-web",
  sub: "mdi-format-subscript",
  sup: "mdi-format-superscript",
  small: "mdi-format-font-size-decrease",
  big: "mdi-format-font-size-increase",
  mark: "mdi-format-color-highlight",
  span: "mdi-text",
};

export default {
  name: "TagIcon",

  props: ["value"],

  computed: {
    hasIcon() {
      const {isComponent, value} = this;

      return isComponent || icons.hasOwnProperty(value);
    },

    isComponent() {
      const {value} = this;

      return /:/.test(value);
    },

    icon() {
      const {hasIcon, isComponent, value} = this;

      return isComponent ? "mdi-hexagon-outline"
        : hasIcon ? icons[value]
        : (value || "?");
    },

    renderProps() {
      const {hasIcon, value} = this;

      return {
        style: {
          transform: value === "aside" ? "rotate(90deg)" : void 0,
          border: value === "div" || !hasIcon ? "2px dashed" : void 0,
          textTransform: value === "cite" ? "none !important" : void 0,
        },
        props: {
          large: value === "big",
          small: value === "cite" || !hasIcon,
          xLarge: value === "hr",
        },
      };
    },
  },

  render() {
    const component = VIcon;

    const props = this.renderProps;

    const content = this.icon;

    return this.$createElement(
      component,
      props,
      content
    );
  },
};