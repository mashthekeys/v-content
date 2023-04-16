import CMSContentTypeSelect from "@/backend/components/cms/content/CMSContentTypeSelect.vue";

// Dynamic dependency to avoid circular import
const CMSEditorNode = () => import("@/backend/components/cms/content/CMSEditorNode.js");

export default {
  name: 'CMSContentArray',
  components: {
    CMSContentTypeSelect,
    CMSEditorNode,
  },

  props: [
    "path",
    "value",
  ],

  data() {
    return {
      lastOutput: this.value,
    };
  },

  computed: {
    elevation() {
      return this.path.replace(/[^.]/g, "").length;
    },

    decoded() {
      const {value} = this;
      // console.log("CMSContentArray.decoded", {value});

      let array;

      try {
        array = JSON.parse(value);
      } catch (ignored) {
      }

      if (Array.isArray(array)) return array;
    },

    nodes() {
      const {decoded, path} = this;

      // console.log("CMSContentArray.nodes", {decoded, path});

      if (decoded == null) return [];

      return decoded.map((value, index) => {
        return {
          key: index,
          path: `${path}[${index}]`,
          value: JSON.stringify(value),
        };
      });
    },

    output() {
      // console.log("CMSContentArray.output");
      return this.makeOutput(this.nodes);
    },
  },

  methods: {
    appendValue($event) {
      // console.log("CMSContentArray.appendValue", $event);
      const length = this.nodes.length;

      this.dispatchInput(this.nodes.concat({
        key: length,
        path: `${this.path}[${length}]`,
        value: $event,
      }));
    },

    deleteIndex(index) {
      // console.log("CMSContentArray.deleteIndex", index);
      const nodes = this.nodes.slice();
      
      nodes.splice(index, 1);

      this.dispatchInput(nodes);
    },

    dispatchInput(nodes) {
      const output = this.output;
      const old = this.lastOutput;
      // console.log("CMSContentArray.dispatchInput", output, old);
      if (output !== old && output !== this.value) {
        // console.log("CMSContentArray.dispatchInput >> input");
        this.lastOutput = output;
        this.$emit("input", output);
      }
    },

    makeNewOutput() {
      const {$el, path, nodes} = this;

      const children = $el.children;

      const length = Math.max(children.length, nodes.length);

      const newNodes = Array(children.length);

      let hasChange = false;

      const makeTextNode = (textNode, index) => {
        return {
          key: index,
          path: `${path}[${index}]`,
          value: JSON.stringify(textNode.data),
        }
      };
      const elementNodeValue = (element) => {
        return [element.nodeName.toLowerCase(), {}, [...element.children].map(
          (child, i) => child.nodeType === 3 ? child.data : elementNodeValue(child, i)
        )];
      };

      const makeElementNode = (element, index) => {
        return {
          key: index,
          path: `${path}[${index}]`,
          value: JSON.stringify(elementNodeValue(element)),
        }
      };

      for (let i = 0; i < length; ++i) {
        const child = children[i];
        const node = nodes[i];

        if (child == null) {
          hasChange = true;
          // No new nodes entry

        } else {
          const isElement = child.nodeType === 1; // NODE_ELEMENT
          const isTextNode = child.nodeType === 3; // NODE_TEXT

          if (node == null) {
            // change found here
            hasChange = true;
            newNodes[i] = isTextNode ? makeTextNode(child, i) : makeElementNode(child, i);

          } else {

            if (isTextNode && node.value.charAt(0) === '"') {
              // compare text values
              const change = child.data !== JSON.parse(node.value);

              if (change != null) {
                hasChange = true;
                newNodes[i] = makeTextNode(child, i);
              } else {
                newNodes[i] = nodes[i];
              }

            } else if (isElement && node.value.charAt(0) === '[') {
              // delegate to child component
              const newValue = child.__vue__.makeNewOutput();

              if (newValue != null) {
                hasChange = true;
                newNodes[i] = {
                  key: i,
                  path: `${path}[${i}]`,
                  value: JSON.stringify(newValue),
                };
              } else {
                newNodes[i] = nodes[i];
              }

            } else {
              // change found here
              hasChange = true;
              newNodes[i] = isTextNode ? makeTextNode(child, i) : makeElementNode(child, i);
            }
          }
        }
      }

      if (hasChange) {
        return newNodes;
      } else {
        return null;
      }
    },

    makeOutput(nodes) {
      return `[${nodes.map(
        ({value}) => value
      ).join(",")}]`
    },

    renderArray() {
      const {$createElement, nodes, dispatchInput} = this;

      return nodes.map((node, index) => {
        if (node.value.charAt(0) === "\"") {
          return JSON.parse(node.value);
        } else {
          return $createElement(CMSEditorNode, {
            key: index,
            props: {
              canDelete: true,
              path: node.path,
              value: node.value,
            },
            on: {
              input: $event => {
                // console.log("CMSContentArray@input", index, $event);
                const n = nodes.slice();
                
                n[index].value = String($event);

                dispatchInput(n);
              },
              "delete": () => {
                // console.log("CMSContentArray@delete", index);
                const n = nodes.slice();
                
                n.splice(index, 1);

                dispatchInput(n);
              },
            }
          });
        }
      });
    },

    setValue(index, $event) {
      // console.log("CMSContentArray.setValue", index, $event);
      const n = this.nodes.slice();

      n[index].value = String($event);

      this.dispatchInput(n);
    },
  },

  watch: {
    value(value) {
      this.lastOutput = value;
    },
  },

  render() {
    return this.$createElement('span', {}, this.renderArray());
  },
}
