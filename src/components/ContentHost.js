import all from "../site/router/cms-tags.js";

const showFallback = true;

export default {
  name: "ContentHost",

  methods: {
    makeElement(element) {
      if (typeof element === "string") {
        // text
        return element;
      } else if (Array.isArray(element)) {
        // element or component
        let tag;
        let options;
        let children;

        // Gather options and inner content
        if (Array.isArray(element[1])) {
          options = {};
          children = element[1];

        } else if (typeof element[1] === "object") {
          // Options cannot be passed to $createElement as a frozen object
          options = {...element[1]};

          if (options.slots != null) {
            options.scopedSlots = this.makeSlots(options.slots);

            delete options.slots;
          }

          if (Array.isArray(element[2])) {
            children = element[2];
          } else {
            children = undefined;
          }

        } else {
          options = {};
          children = undefined;
        }


        // Check tag is allowed and get render component
        const tagString = element[0];

        const cmsComponent = all.find($ => $[0] === tagString);

        if (cmsComponent != null) {
          tag = cmsComponent[1];

        } else if (showFallback) {
          // Fallback
          tag = "pre";

          options = {
            "class": "CMS--error",
            "style": {
              "color": "#A22",
              "backgroundColor": "#222",
              "border": "solid 2px"
            }
          };

          children = [`Not allowed: <${tagString}>\n`].concat(children == null ? [] : children)
        } else {
          return "";
        }


        if (children == null) {
          // console.log("$createElement", tag, options);
          return this.$createElement(tag, options);
        } else {
          // console.log("$createElement", tag, options, children);

          // noinspection JSCheckFunctionSignatures
          return this.$createElement(tag, options, children.map(this.makeElement));
        }
      }
    },

    makeSlots(source) {
      return Object.fromEntries(Object.entries(source).map(
        ([slot, storedArray]) => ([slot, () => storedArray.map(this.makeElement)])
      ));
    },
  },
};