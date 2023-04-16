// noinspection JSDeprecatedSymbols

import CMSComponentProperties from "@/backend/components/cms/content/CMSComponentProperties.vue";
import CMSTagMenu from "@/backend/components/cms/content/CMSTagMenu.js";
import {isBlock} from "@/backend/components/cms/content/html.js";
import {VMenu} from "vuetify/lib/components";
import CMSTagDialog from "@/backend/components/cms/content/CMSTagDialog.vue";
import CMSNewTagToolbar from "@/backend/components/cms/content/CMSNewTagToolbar.vue";
import {generateTagSource, specToHTML} from "@/backend/components/cms/content/generate.js";

const clipboard = window?.navigator?.clipboard;

function JSONSafeParse(value) {
  let decoded = void 0;

  try {
    decoded = JSON.parse(value);
  } catch (ignored) {
  }
  return decoded;
}

function containsColon(tag) {
  return /:/.test(tag);
}

export default {
  name: 'CMSContentEditable',

  props: {
    format: {default: "html"},
    path: {default: "$"},
    value: {},
  },

  data() {
    return {
      insertMenuProps: null,
      propertiesDialogValue: null,
      valueUpdate: 0,
    };
  },

  computed: {
    allowExec() {
      let paste = window.document.queryCommandSupported("paste");

      try {
        paste = paste || typeof clipboard?.read === "function";
      } catch (ignored) {
        // Ignored
      }

      return {
        copy: document.queryCommandSupported("copy"),
        cut: document.queryCommandSupported("cut"),
        paste,
      };
    },
  },

  methods: {
    generateFromContent() {
      const childNodes = this.$el.lastElementChild.childNodes;

      const length = childNodes.length;

      const newNodes = Array(length);

      for (let c = 0; c < length; ++c) {
        newNodes[c] = this.makeElementValue(childNodes[c]);
      }

      return newNodes;
    },

    generateFromString(html) {
      // console.log("generateFromString source", html);
      const pasteDocument = new DOMParser().parseFromString(html, "text/html")

      // Remove <meta>, <script>, <link> and <style> tags
      const removeBannedTags = el => {
        const children = el.children;

        for (let c = children.length - 1; c >= 0; --c) {
          const child = children[c];

          if (child.nodeType === 1) {
            // Element
            const tag = child.nodeName.toLowerCase();

            if (tag === "meta" || tag === "script" || tag === "link" || tag === "style" || containsColon(tag)) {
              child.parentNode.removeChild(child);

            } else if (child.firstElementChild != null) {
              removeBannedTags(child);
            }
          }
        }
      };

      removeBannedTags(pasteDocument.body);

      // console.log("generateFromString document", pasteDocument);

      const pastedNodes = pasteDocument.body.childNodes;

      const length = pastedNodes.length;

      const newNodes = Array(length);

      for (let c = 0; c < length; ++c) {
        newNodes[c] = this.makeElementValue(pastedNodes[c]);
      }

      // console.log("generateFromString result", JSON.parse(JSON.stringify(newNodes)));

      return newNodes;
    },

    insertFromMenu(tag, position) {
      if (position === "after") {
        console.log(`TODO insert ${position} ${tag}`);

      } else if (position === "before") {
        console.log(`TODO insert ${position} ${tag}`);

      } else {
        console.warn("Nowhere to insert " + tag, position);
      }

      this.hideInsertMenu();
    },
    
    makeElementValue(element) {

      if (element == null) {
        console.warn("makeElementValue: Invalid value", element);
        return "";
      }

      const component = element.__vue__;

      if (component != null) {
        if (typeof component.getElementValue === "function") {
          return component.getElementValue(this);
        } else {
          console.warn("makeElementValue: Non-editable component", component);
          return "";
        }
      }

      if (element.nodeType === 3) {
        // Text Node
        return element.data;
      }

      if (element.nodeType !== 1) {
        // Not an Element
        console.warn('makeElementValue: Cannot convert nodeType ' + element.nodeType, element);
        return "";
      }

      // console.log('makeElementValue', element, element.nodeType);
      const $class = Object.fromEntries([...element.classList].map(key => ([key, true])));

      const style = Object.fromEntries([...element.style].map($ => [$, element.style[$]]));

      const options = {
        "class": $class,
        style,
      };

      const attributes = element.getAttributeNames().filter($ => $ !== "style" && $ !== "class");

      if (attributes.length) {
        options.attrs = Object.fromEntries(attributes.map(
           k => [k, element.getAttribute(k)]
        ));
      }
      // console.log('makeElementValue element.options', JSON.parse(JSON.stringify(options)));

      const content = [...element.childNodes].map(this.makeElementValue);
      // console.log('makeElementValue element.children', [...element.childNodes]);
      // console.log('makeElementValue content', [...content]);

      return [element.nodeName.toLowerCase(), options, content];
    },

    makeOutput(nodes) {
      return `[${nodes.map(
        $ => $.value
      ).join(",")}]`
    },

    onContentChange() {
      this.onUpdate({content: true});
    },

    onModelChange() {
      this.onUpdate({model: true});
    },

    onUpdate({content, html, json, model, value}) {
      const {format} = this;

      let modelUpdate = false;

      if (model) {
        modelUpdate = true;

      } else if (content) {
        const newDecoded = this.generateFromContent();

        // console.log("CMSContentEditable.onUpdate content = " + JSON.stringify(newDecoded, null, 4));

        const newValue = JSON.stringify(newDecoded);

        if (newValue !== this.$internalJSON) {
          this.$internalJSON = newValue;

          this.$internalModel = newDecoded;
        }

      } else if (typeof html !== "undefined" || (format === "html" && typeof value !== "undefined")) {
        const htmlValue = html ?? value;

        this.$internalModel = this.generateFromString(htmlValue);

        modelUpdate = true;

      } else if (typeof json !== "undefined" || (format === "json" && typeof value !== "undefined")) {
        const jsonValue = json ?? value;

        const update = this.$internalJSON !== jsonValue;
        // console.log("CMSContentEditable.onUpdate json", update, jsonValue);
        if (update) {
          this.$internalJSON = jsonValue;
          this.$internalModel = JSONSafeParse(jsonValue);
          ++this.valueUpdate;
        }
      }

      if (modelUpdate) {
        // console.log("CMSContentEditable.onUpdate model " + JSON.stringify(this.$internalModel, null, 4));

        const jsonValue = JSON.stringify(this.$internalModel);

        if (this.$internalJSON !== jsonValue) {
          this.$internalJSON = jsonValue;

          ++this.valueUpdate;
        }
      }

      // Don't emit event when triggered by value update
      if (typeof value === "undefined") {
        if (format === "json") {
          this.$emit("input", this.$internalJSON);

        } else if (format === "html") {
          this.$emit("input", specToHTML(this.$internalJSON));
        }
      }
    },

    renderArray(specs, toolbar = []) {
      const content = [];

      specs.forEach((spec, index) => {
        if (Array.isArray(spec)) {
          content.push(this.renderTag(spec, toolbar, index, specs));
        } else {
          content.push(String(spec));
        }
      });

      return {content, toolbar};
    },

    renderHandle(spec, index, context, bus) {

      const pasteHTML = html => {
        const pasted = this.generateFromString(html);

        if (spec.length < 3) {
          spec.push(pasted);
        } else {
          spec.splice(2, 1, pasted);
        }

        this.onModelChange();
      };

      const pasteText = text => {
        if (spec.length < 3) {
          spec.push([text]);
        } else {
          spec.splice(2, 1, [text]);
        }
        this.onModelChange();
      };

      const select = () => {
        const element = bus.component?.elm;

        // console.log("Select element in contenteditable", element);

        if (element != null) {
          this.setSelection(element, 0, element, element.childNodes?.length || 0);
        }
      };

      const tagMenu = this.$createElement(CMSTagMenu, {
        props: {
          enable: this.allowExec,
          value: spec,
        },
        on: {

          copy: () => {
            select();
            document.execCommand("copy");
          },

          cut: () => {
            select();
            document.execCommand("cut");
          },

          delete: () => {
            // console.log("Delete");
            context.splice(index, 1);
            this.onModelChange();
          },

          insert: position => {

            let callback;

            if (position === "before") {
              callback = tag => context.splice(index, 0, generateTagSource(tag));

            } else if (position === "after") {
              callback = tag => context.splice(index + 1, 0, generateTagSource(tag));

            } else if (position === "within") {
              callback = tag => spec[2].push(generateTagSource(tag));

            } else {
              console.warn("Insert position missing");
              callback = tag => this.$internalJSON[2].push(generateTagSource(tag));
            }

            this.showInsertMenu(tagMenu, position, callback);
          },

          move: direction => {
            // console.log("Move " + direction);
            if (direction === "up") {
              if (index > 0) {
                context.splice(index - 1, 2, context[index], context[index - 1]);
                this.onModelChange();
              }

            } else if (direction === "down") {
              if (index < context?.length) {
                context.splice(index, 2, context[index + 1], context[index]);
                this.onModelChange();
              }
            }
          },

          paste: async () => {
            if (typeof clipboard?.read === "function") {
              // Use Clipboard API

              const clipboardItems = await clipboard.read();
              const clipboardItem = clipboardItems?.[0];
              // console.log("Pasted (read)", clipboardItem);

              const types = clipboardItem?.types;

              if (Array.isArray(types)) {
                if (types.includes("text/html")) {
                  const blob = await clipboardItem.getType("text/html");
                  pasteHTML(await blob.text());

                } else if (types.includes("text/plain")) {
                  const blob = await clipboardItem.getType("text/plain");
                  pasteText(await blob.text());

                } else {
                  console.warn("Unable to paste", clipboardItem);
                }
              }

            } else if (typeof clipboard?.readText === "function") {
              // Use Clipboard API

              const text = await clipboard?.readText();
              console.log("Pasted (readText)", text);

              if (typeof text === "string") {
                pasteText(text);
              }

            } else if (window.document.queryCommandSupported("paste")) {
              select();
              window.document.execCommand("paste");

            } else {
              throw new Error("Paste is not supported")
            }
          },

          properties: () => {
            console.log("TODO Show properties");

            this.setPropertiesDialog(
              spec,
              newValue => {
                spec.splice(0, 3, newValue[0], newValue[1], newValue[2]);
              }
            );

          },

          toggle: select,
        },
      });

      return tagMenu;
    },

    renderTag(spec, toolbar, index, context) {
      const tag = String(spec[0]);

      const bus = {component: null};

      if (isBlock(tag) || containsColon(tag)) {
        // Toolbar component has to be added before children are processed
        toolbar.push(this.renderHandle(spec, index, context, bus));
      }

      let rendered;

      if (/^[a-z]\w*$/.test(tag)) {

        const options = spec.find($ => typeof $ === "object" && !Array.isArray($)) ?? {};

        const contentSrc = spec.find($ => Array.isArray($)) ?? [];

        const {content} = this.renderArray(contentSrc, toolbar);

        // Literal HTML
        rendered = this.$createElement(tag, options, content);

      } else {
        // Component
        rendered = this.$createElement(CMSComponentProperties, {
          props: {value: spec},
          on: {
            'update:tag': $event => this.onContentChange($event),
            'update:props': $event => this.onContentChange($event),
            'update:content': $event => this.onContentChange($event),
          },
        });
      }

      // Component shared with toolbar *after* children are processed
      bus.component = rendered;

      return rendered;
    },

    setPropertiesDialog(dialogValue, onInput) {
      this.propertiesDialogValue = dialogValue == null ? null
        : JSON.parse(JSON.stringify(dialogValue));

      this.$propertiesDialogCallback = onInput;
    },

    setSelection(startNode, startOffset, endNode, endOffset) {
      try {
        const range = document.createRange();

        range.setStart(startNode, startOffset);

        range.setEnd(endNode, endOffset);

        const selection = window.getSelection();

        selection.removeAllRanges();

        selection.addRange(range);


      } catch (selectionError) {
        console.warn(selectionError);
      }
    },

    hideInsertMenu() {
      this.insertMenuProps = null;
    },

    showInsertMenu(targetComponent, position, callback) {
      this.insertMenuProps = {
        activator: targetComponent.elm,
        position,
        callback,
      };
    },
  },

  created() {
    const {value} = this;

    this.onUpdate({value});
  },

  watch: {
    value(value) {
      this.onUpdate({value});
    },
  },

  render() {
    // Purely for reactivity
    // noinspection JSUnusedLocalSymbols
    const {valueUpdate} = this;

    const {
      insertMenuProps,
      propertiesDialogValue
    } = this;

    const {content, toolbar} = this.renderArray(this.$internalModel);

    const insertMenuPosition = insertMenuProps?.position;

    toolbar.push(this.$createElement(
      VMenu,
      {
        props: {
          closeOnClick: false,
          closeOnContentClick: false,
          right: true,
          nudgeRight: 36,
          nudgeTop: insertMenuPosition === "after" ? -36
            : insertMenuPosition === "before" ? 36
            : 0,
          activator: insertMenuProps?.activator,
          value: insertMenuProps != null,
        },
        on: {
          input: $event => {
            if (!$event) {
              this.hideInsertMenu();
            }
          },
        },
      },
      [this.$createElement(
        CMSNewTagToolbar,
        {
          on: {
            insert: tag => {
              this.hideInsertMenu();

              insertMenuProps.callback(tag);
            },
          },
        }
      )]
    ));

    const overlayEl = this.$createElement(
      CMSTagDialog,
      {
        props: {
          value: propertiesDialogValue,
        },
        on: {
          close: () => {
            this.propertiesDialogValue = null
            this.$propertiesDialogCallback = null
          },

          input: $event => {
            this.$propertiesDialogCallback?.($event);
          },
        },
      }
    );

    const toolbarEl = this.$createElement(
      "div",
      {
        "class": "CMSContentEditable--toolbar",
        style: {
          width: "48px",
          flex: "0 0 48px",
        },
        attrs: {},
      },
      toolbar
    );

    const inputEl = this.$createElement(
      "div",
      {
        "class": "CMSContentEditable--input",
        style: {
          flex: "1 1 100%",
          margin: "5px 4px",
        },
        attrs: {"contenteditable": "true"},
        on: {
          change: this.onContentChange,
          input: this.onContentChange,
        },
      },
      content
    );

    return this.$createElement(
      "div",
      {
        "class": "CMSContentEditable",
        style: {
          display: "flex",
          flexFlow: "row",
        },
      },
      [overlayEl, toolbarEl, inputEl]
    );
  },
};