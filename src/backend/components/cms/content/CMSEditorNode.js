import CMSContentArray from "@/backend/components/cms/content/CMSContentArray.js";
import CMSContentTypeSelect from "@/backend/components/cms/content/CMSContentTypeSelect.vue";
import CMSTagSelect from "@/backend/components/cms/content/CMSTagSelect.vue";
import VJsonNodeFallback from "../local_modules/v-json-editor/src/components/VJsonNodeFallback.vue";
import {cmsElements} from "@/backend/components/cms/content/html.js";
import ContentEditable from "@/backend/components/cms/content/ContentEditable.js";

export default {
  name: 'CMSEditorNode',

  components: {
    ContentEditable,
    CMSContentTypeSelect,
    CMSTagSelect,
    VJsonNodeFallback,
  },

  props: {
    canDelete: Boolean,
    path: {},
    value: {},
  },

  data() {
    return {
      lastOutput: this.value,
    };
  },

  computed: {
    decoded: {
      lazy: true,
      get() {
        try {
          return JSON.parse(this.trimmed);
        } catch (e) {
          return undefined;
        }
      },
    },

    element: {
      lazy: true,
      get() {
        const {decoded} = this;

        if (Array.isArray(decoded)) {
          const tag = String(decoded[0]);

          const options = decoded.find($ => typeof $ === "object" && !Array.isArray($)) ?? {};

          const children = decoded.find($ => Array.isArray($)) ?? [];

          return {
            tag,
            options,
            children,
            optionsJSON: JSON.stringify(options),
            childrenJSON: JSON.stringify(children),
          };
        }
      },
    },

    output: {
      lazy: true,
      get() {
        console.log("CMSEditorNode.output");
        const {element} = this;

        if (element == null) console.warn("element == null"); else {

          const tagJSON = JSON.stringify(String(element.tag ?? ""));

          return `[${tagJSON},${element.optionsJSON || '{}'},${element.childrenJSON || '[]'}]`;
        }
      },
    },

    // Returns the child nodes
    nodes() {
      const {type, decoded, path} = this;

      // console.log("CMSEditorNode.nodes", {type, decoded, path});

      if (type !== "Array" || !(decoded?.length > 2)) return [];

      return decoded[2].map((value, index) => {
        return {
          key: index,
          path: `${path}[2][${index}]`,
          value: JSON.stringify(value),
        };
      });
    },

    tagClass() {
      return this.tagProperties.class ?? {};
    },

    tagDisplay() {
      const {type, element, tagProperties} = this;

      if (type !== "Array") return "inline";

      return element.options?.style?.display || tagProperties?.display || "inline";
    },

    tagStyle() {
      const {type, element, tagDisplay, tagProperties} = this;

      if (type !== "Array") return {};

      return {
        display: tagDisplay,
        ...(tagProperties?.style ?? {}),
        ...(element.options?.style ?? {})
      };
    },

    tagProperties() {
      const {type, element} = this;

      if (type !== "Array") return {};

      if (element == null) return {};

      const tag = element.tag;

      return cmsElements.all.find(({name}) => name === tag) ?? {};
    },

    trimmed() {
      return String(this.value).trim();
    },

    type() {
      const trimmed = this.trimmed;

      const firstChar = trimmed.charAt(0);

      if (firstChar === '"') {
        return "string";

      } else if (firstChar === '[') {
        return "Array";

      } else if (firstChar === '{') {
        return "object";

      } else if (/[-0-9]/.test(firstChar)) {
        return "number";

      } else if (trimmed === "true" || trimmed === "false") {
        return "boolean";

      } else if (trimmed === "null") {
        return "null";

      } else {
        return "___invalid___"
      }
    },
  },

  methods: {
    dispatchInput() {
      const output = this.output;
      const old = this.lastOutput;
      // console.log("CMSEditorNode.dispatchInput", output, old);
      if (output !== old && output !== this.value) {
        // console.log("CMSEditorNode.dispatchInput >> input");
        this.lastOutput = output;
        this.$emit("input", output);
      }
    },

    makeNewOutput: CMSContentArray.methods.makeNewOutput,

    renderArray: CMSContentArray.methods.renderArray,

    setContent($event) {
      this.element.childrenJSON = $event;

      this.dispatchInput();
    },

    setOptions($event) {
      this.element.optionsJSON = $event;

      this.dispatchInput();
    },

    setTag($event) {
      this.element.tag = String($event);

      this.dispatchInput();
    },
  },

  watch: {
    value(value) {
      this.lastOutput = value;
    },
  },

  render() {
    if (this.type === 'Array') {
      return this.$createElement("span", {
          staticClass: "CMSEditorNode",
          "class": this.tagClass,
          style: this.tagStyle,
        },
        this.renderArray()
      );

    } else if (this.type === 'string') {
      return this.$createElement("span", {
          "class": "CMSEditorNode",
          style: {display: this.tagDisplay}
        },
        [String(this.decoded)]
      );

    } else {
      return this.$createElement(VJsonNodeFallback, {
        // staticClass: "CMSEditorNode",
        props: {
          path: this.path,
          value: this.trimmed,
        },
        on: {
          input: $event => this.$emit('input', $event),
        }
      });
    }
  },
}

