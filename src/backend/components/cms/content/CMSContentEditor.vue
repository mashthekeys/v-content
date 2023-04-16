<template>
  <div class="v-input v-text-field v-input--is-label-active v-input--is-dirty" :class="componentClass">
    <div class="v-input__control">
      <div class="v-input__slot">
        <v-label v-if="label != null && label.length" absolute :value="true" style="min-width: 100%; position:absolute;">{{label}}</v-label>

        <div>
          <v-toolbar dense width="100%">
            <v-toolbar-items>
              <v-btn class="CMSTagButton">text</v-btn>

              <v-btn tile icon
                     :input-value="focusInfo.tags.includes('b')"
                     @click="wrapInline('b')"
              >
                <TagIcon value="b" />
              </v-btn>
              <v-btn tile icon
                     :input-value="focusInfo.tags.includes('i')"
                     @click="wrapInline('i')"
              >
                <TagIcon value="i" />
              </v-btn>
              <v-btn tile icon
                     :input-value="focusInfo.tags.includes('u')"
                     @click="wrapInline('u')"
              >
                <TagIcon value="u" />
              </v-btn>

              <v-btn tile icon
                     :input-value="focusInfo.tags.includes('q')"
                     @click="wrapInline('q')"
              >
                <TagIcon value="q" />
              </v-btn>
              <v-btn tile icon
                     :input-value="focusInfo.tags.includes('cite')"
                     @click="wrapInline('cite')"
              >
                <TagIcon value="cite" />
              </v-btn>
              <v-btn tile icon
                     :input-value="false">
                <TagIcon value="a" />
              </v-btn>

              <v-btn tile icon
                     :input-value="focusInfo.tags.includes('sub')"
                     @click="wrapInline('sub')"
              >
                <TagIcon value="sub" />
              </v-btn>
              <v-btn tile icon
                     :input-value="focusInfo.tags.includes('sup')"
                     @click="wrapInline('sup')"
              >
                <TagIcon value="sup" />
              </v-btn>

              <v-btn tile icon
                     :input-value="focusInfo.tags.includes('small')"
                     @click="wrapInline('small')"
              >
                <TagIcon value="small" />
              </v-btn>
              <v-btn tile icon
                     :input-value="focusInfo.tags.includes('big')"
                     @click="wrapInline('big')"
              >
                <TagIcon value="big" />
              </v-btn>

              <v-menu
                  bottom
                  :close-on-content-click="false"
                  :nudge-bottom="36"
              >
                <template #activator="{attrs, on}">

                  <v-btn tile icon class="CMSContentEditor--colorBtn"
                         v-bind="attrs" v-on="on"
                         :input-value="focusInfo.color != null"
                  >
                    <v-icon :color="focusInfo.color">mdi-format-color-text</v-icon>
                    <div class="UnderlineDots"
                         :class="focusInfo.color == null ? 'UnderlineDots--rainbow' : ''"
                         :style="{color: focusInfo.color}"
                         aria-hidden="true"
                    ><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
                  </v-btn>
                </template>
                <CMSColorPicker :value="focusInfo.color"/>
              </v-menu>

              <v-btn tile icon class="CMSContentEditor--colorBtn"
                     :input-value="focusInfo.tags.includes('mark')"
              >
                <v-icon color="black" style="background: yellow">mdi-format-color-highlight</v-icon>
              </v-btn>
            </v-toolbar-items>
          </v-toolbar>

          <CMSContentEditable
              :format="format"
              :path="path"
              :value="value"
              ref="contentEditable"
              @input="$emit('input', $event)"
          />

          <v-toolbar dense min-width="100%" width="100%">
            <v-toolbar-items>
              <v-menu bottom nudge-bottom="48px">
                <template #activator="{attrs, on}">
                  <v-btn tile icon v-bind="attrs" v-on="on">
                    <v-icon>mdi-plus-thick</v-icon>
                  </v-btn>
                </template>
                <template #default>
                  <v-sheet tile min-width="100%" width="100%">
                    <template v-for="tag in additionalBlockTags">
                      <v-btn color="accent" text tile @click="insertAsBlock(tag)"
                             :key="tag"
                      >
                        <span>{{ tag }}</span>
                      </v-btn>
                    </template>
                  </v-sheet>
                </template>
              </v-menu>

              <v-btn color="accent" tile icon @click="insertAsBlock('p')">
                <TagIcon value="p" />
              </v-btn>

              <v-btn color="accent" tile icon @click="insertAsBlock('ul')">
                <TagIcon value="ul" />
              </v-btn>

              <v-btn color="accent" tile icon @click="insertAsBlock('ol')">
                <TagIcon value="ol" />
              </v-btn>

              <v-btn color="accent" tile icon @click="insertAsBlock('blockquote')">
                <TagIcon value="blockquote" />
              </v-btn>

              <v-btn color="accent" tile icon @click="insertAsBlock('h6')">
                <v-icon>mdi-format-header-pound</v-icon>
              </v-btn>

              <v-btn color="accent" tile icon @click="insertAsBlock('br')">
                <TagIcon value="br" />
              </v-btn>

              <v-btn color="accent" tile icon @click="insertAsBlock('hr')">
                <TagIcon value="hr" />
              </v-btn>

              <v-btn color="accent" tile icon @click="insertAsBlock('table')">
                <TagIcon value="table" />
              </v-btn>

              <v-btn color="accent" tile icon @click="insertAsBlock('details')">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path style="fill: currentColor" d="M3,8.5L5.5,4H0.5L3,8.5M7,19H22V17H7V19M7,13H22V11H7V13M7,7H22V5H7V7Z" />
                </svg>
              </v-btn>

              <v-btn color="accent" tile icon @click="insertAsBlock('aside')">
                <TagIcon value="aside" />
              </v-btn>

              <v-btn color="accent" tile icon @click="insertAsBlock('div')">
                <TagIcon value="div" />
              </v-btn>
            </v-toolbar-items>
          </v-toolbar>

          <div style="min-height: 28px;">
            <template v-for="(item, index) in selectedDisplay">
              <v-btn :key="index"
                     depressed
                     tile
                     small
                     style="background: none;"
              >
                <v-icon small>{{item.display.outer === 'block' ? 'mdi-square-outline'
                    : item.display.outer === 'inline' ? 'mdi-text'
                        : 'mdi-star-box-outline' }}</v-icon>
                <span>{{item.name}}</span>
              </v-btn>
            </template>
          </div>
        </div>

      </div>

      <div v-if="messages || !hideDetails" class="v-messages" :class="componentClass">
        <div class="v-messages__wrapper">{{messages}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import {VLabel} from "vuetify/lib/components";
import {cmsElements} from "@/backend/components/cms/content/html.js";
import css3Display from "@/util/css3Display.js";
import CMSContentEditable from "@/backend/components/cms/content/CMSContentEditable.js";
import TagIcon from "@/backend/components/cms/content/TagIcon.js";
import {generateTagSource} from "@/backend/components/cms/content/generate.js";
import jsonClone from "@/util/jsonClone.js";
import CMSColorPicker from "@/backend/components/cms/content/CMSColorPicker.vue";

function parsePath(path) {
  if (path == null) return [];

  let parts = String(path).split(/[\[.]/);

  return parts.map(part => {

    if (part.charAt(part.length - 1) === ']') {
      part = part.substr(0, part.length - 1);
    }

    if (part.charAt(0) === '"') {
      return JSON.parse(part);
    }

    return part;
  });
}

function lookupPath(object, path) {
  if (typeof path === "string") path = parsePath(path);

  console.log("// lookupPath", path.join("."));
  console.log("// lookupPath root", jsonClone(object));
  for (let p = 1; object != null && p < path.length; p++){
    const key = path[p];

    if (p > 1) {
      object = object[2][key];
    } else {
      object = object[key];
    }
  }

  console.log("// lookupPath =", jsonClone(object));
  return object;
}

export default {
  name: 'CMSContentEditor',

  components: {CMSColorPicker, TagIcon, CMSContentEditable, "v-label": VLabel},

  props: {
    dense: Boolean,
    format: {default: "html"},
    hideDetails: Boolean,
    messages: {},
    path: {default: "$"},
    label: {},
    value: {},
  },

  data() {
    return {
      anchorPosition: null,
      anchorPath: null,
      focusPosition: null,
      focusPath: null,
    };
  },

  computed: {
    additionalBlockTags() {
      return ['article',  'dl', 'pre', 'section'];
    },

    componentClass() {
      return [
          this.$vuetify.theme.dark ? "theme--dark" : "theme--light",
          this.dense ? "v-input--dense" : "",
          this.hideDetails ? "v-input--hide-details" : "",
      ].join(" ");
    },

    decoded() {
      const {format, value} = this;

      if (format === "json") {
        let array;

        try {
          array = JSON.parse(value);
        } catch (ignored) {
        }

        if (Array.isArray(array)) return array;

      } else if (format === "html") {
        return this.generateFromString(value);
      }

      return undefined;
    },
    generateFromString: CMSContentEditable.methods.generateFromString,
    makeElementValue: CMSContentEditable.methods.makeElementValue,

    anchorInfo() {
      const {decoded, path, anchorPath} = this;

      let tags = [];
      let display = [];
      let data = [];
      let tagProperties = [];
      let color = null;

      if (anchorPath != null && decoded != null) {

        const pathSegments = parsePath(anchorPath.replace(path, "$"));

        // console.log("focusInfo: " + pathSegments.join(' > '));

        pathSegments.shift(); // $

        let object = decoded;

        // console.log(`focusInfo decoded`, decoded);

        for (let p = 0; object != null && p < pathSegments.length; p++) {
          const key = pathSegments[p];

          object = object[key];

          // console.log(`focusInfo p = ${p} key = ${JSON.stringify(key)}`, object);

          data.push(object);

          if (object != null) {
            switch (typeof object) {
              case "object":
                const tag = String(object[0]);

                tags.push(tag);

                const tagProps = cmsElements.all.find($ => $.name === tag) ?? {};

                tagProperties.push(tagProps);

                const tagDisplay = css3Display(object[1]?.style?.display || tagProps.display || "inline", "object");

                display.push(tagDisplay);

                color = object[1]?.style?.color ?? color;

                // Pass contents into next iteration
                object = object[2];

                break;

              case "string":
                tags.push("text");

                tagProperties.push({
                  name: "text",
                  display: "inline",
                })

                display.push({outer: "inline", inner: "flow"});
                break;

            }
          }
        }
      }

      // console.log(path, {data, display, tags, tagProperties, color});

      return {data, display, tags, tagProperties, color};
    },

    focusInfo() {
      const {decoded, path, focusPath} = this;

      let tags = [];
      let display = [];
      let data = [];
      let tagProperties = [];
      let color = null;

      if (focusPath != null && decoded != null) {

        const pathSegments = parsePath(focusPath.replace(path, "$"));

        // console.log("focusInfo: " + pathSegments.join(' > '));

        pathSegments.shift(); // $

        let object = decoded;

        // console.log(`focusInfo decoded`, decoded);

        for (let p = 0; object != null && p < pathSegments.length; p++) {
          const key = pathSegments[p];

          object = object[key];

          // console.log(`focusInfo p = ${p} key = ${JSON.stringify(key)}`, object);

          data.push(object);

          if (object != null) {
            switch (typeof object) {
              case "object":
                const tag = String(object[0]);

                tags.push(tag);

                const tagProps = cmsElements.all.find($ => $.name === tag) ?? {};

                tagProperties.push(tagProps);

                const tagDisplay = css3Display(object[1]?.style?.display || tagProps.display || "inline", "object");

                display.push(tagDisplay);

                color = object[1]?.style?.color ?? color;

                // Pass contents into next iteration
                object = object[2];

                break;

              case "string":
                tags.push("text");

                tagProperties.push({
                  name: "text",
                  display: "inline",
                })

                display.push({outer: "inline", inner: "flow"});
                break;

            }
          }
        }
      }

      // console.log(path, {data, display, tags, tagProperties, color});

      return {data, display, tags, tagProperties, color};
    },

    selectedDisplay() {
      const {focusInfo} = this;

      const {data, display, tags, tagProperties} = focusInfo;

      return tags.map((name, i) => {
        const tagDisplay = display[i];

        const isBlockParent = tagDisplay.inner === "table-cell" || tagDisplay.inner === "table-caption" || (
            display[i + 1] != null && display[i + 1].outer === "block"
        );

        return {name, display: tagDisplay, isBlockParent};
      });
    },
  },

  methods: {
    canContainBlock(display) {
      // Inner display can be table-cell, table-caption,
      // or any value NOT starting table... or flow...
      return display.inner === "table-cell" || display.inner === "table-caption" ||
          (!/^(table|flow)/.test(display.inner));
    },

    canContainInline(display) {
      // Inner display can be table-cell, table-caption, or any value NOT starting table...
      return display.inner === "table-cell" || display.inner === "table-caption" ||
          (!/^table/.test(display.inner));
    },

    getNodePath(node) {
      const {$refs, path} = this;

      const editorElement = $refs.contentEditable.$el;

      let keys = [];
      let target = node;
      let isInsideEditor = false;

      do {
        const parentNode = target.parentNode;

        if (parentNode === editorElement) {
          keys.push(path);
          isInsideEditor = true;

        } else if (parentNode != null) {
          const index = [...parentNode.childNodes].indexOf(target);

          keys.push(index);
        }

        target = parentNode;

      } while (!isInsideEditor && target != null);

      if (isInsideEditor) {
        keys.reverse();

        return keys.join(".");
      }
    },

    insertAsBlock(tag) {
      const {decoded, focusInfo, selectedDisplay} = this;

      const {data, display, tags, tagProperties} = focusInfo;

      const newTag = generateTagSource(tag);

      const insertTarget = selectedDisplay.reduceRight((result, item, index) => {
        if (result !== undefined) {
          return result;
        }
        if (item.isBlockParent) {
          return {item, index};
        }
      }, undefined);

      // console.log('CMSContentEditor.insertAsBlock', insertTarget);

      let insertIndex = -1;

      let parentContent;
      let prevSibling;

      if (insertTarget == null) {
        parentContent = decoded;
        prevSibling = data[0];

      } else {
        const {index} = insertTarget;

        const parent = data[index];

        parentContent = parent[2];

        if (index < selectedDisplay.length) {
          prevSibling = data[index + 1];
        }
      }

      if (parentContent != null && prevSibling != null) {
        insertIndex = parentContent.indexOf(prevSibling) + 1;
      }

      if (insertIndex === 0) insertIndex = parentContent.length;

      // console.log('CMSContentEditor.insertAsBlock READY', {parentContent, insertIndex, newTag});

      parentContent.splice(insertIndex, 0, newTag);

      this.$emit("input", JSON.stringify(decoded));
    },

    onSelectionChange($event) {

      const selection = window.getSelection();
      // console.log('CMSContentEditor.onSelectionChange', selection);

      const {anchorNode, anchorOffset, focusNode, focusOffset} = selection;

      if (focusNode != null) {
        const focusPath = this.getNodePath(focusNode);

        const anchorPath = (focusNode === anchorNode) ? focusPath : this.getNodePath(anchorNode);

        this.setSelected(focusPath, focusOffset, anchorPath, anchorOffset);
      }
    },

    setSelected(focusPath, focusPosition, anchorPath, anchorPosition) {
      // console.log('CMSContentEditor.setSelected focus', focusPath, focusPosition);

      this.focusPath = focusPath;
      this.focusPosition = focusPosition;

      if (anchorPath != null) {
        // console.log('CMSContentEditor.setSelected anchor', anchorPath, anchorPosition);
        this.anchorPath = anchorPath;
        this.anchorPosition = anchorPosition;
      } else {
        this.anchorPath = focusPosition;
        this.anchorPosition = focusPosition;
      }
    },

    wrapInline(tag) {
      const {decoded, anchorPath, anchorPosition, focusPath, focusPosition, path} = this;

      /** @var {{data, display, tags, tagProperties, color}} */
      const anchorInfo = this.anchorInfo;

      /** @var {{data, display, tags, tagProperties, color}} */
      const focusInfo = this.focusInfo;

      console.log(`CMSContentEditor.wrapInline FROM ${anchorPath} ${anchorPosition}`);
      console.log(`CMSContentEditor.wrapInline TO ${focusPath} ${focusPosition}`);

      const emptySelection = anchorPath === focusPath && anchorPosition === focusPosition;

      const forwards = anchorPath < focusPath || (anchorPath === focusPath && anchorPosition < focusPosition);

      console.log(`CMSContentEditor.wrapInline ${emptySelection ? 'EMPTY' : forwards ? 'FORWARDS' : 'BACKWARDS'}`);

      if (anchorPath === focusPath) {

        if (anchorInfo.tags[anchorInfo.tags.length - 1] !== "text") {
          console.warn('Current anchor is not at a text element, not sure what to do');
          return;
        }

        const input = focusInfo.data[focusInfo.tags.length - 1];

        const from = Math.min(anchorPosition, focusPosition);
        const to = Math.max(anchorPosition, focusPosition);

        const before = input.substring(0, from);
        const wrap = emptySelection ? "\xa0" : input.substring(from, to);
        const after = input.substring(to);

        const replaceWith = [
            [tag, {}, [wrap]]
        ];

        if (before.length) replaceWith.unshift(before);

        if (after.length) replaceWith.push(after);

        // replace in parent array
        const parent = focusInfo.data[focusInfo.tags.length - 2];
        const index = parsePath(focusPath).pop();
        console.log("// replace in parent array", parent, index, replaceWith);
        // TODO this cannot append to the root node
        parent[2].splice(index, 1, ...replaceWith);

      } else {

        const startInfo = forwards ? anchorInfo : focusInfo;
        const startPath = forwards ? anchorPath : focusPath;
        const startPosition = forwards ? anchorPosition : focusPosition;

        const endInfo = forwards ? focusInfo : anchorInfo;
        const endPath = forwards ? focusPath : anchorPath;
        const endPosition = forwards ? focusPosition : anchorPosition;

        const replacements = [];

        console.log("// startPath", startPath, startPosition);

        console.log("// endPath", endPath, endPosition);

        const flagForRemoval = p => {
          console.log("// flagForRemoval", p);
          return replacements.push([p, null]);
        };

        const flagForReplacement = (p, newValues) => {
          console.log("// flagForReplacement", p, JSON.stringify(newValues));
          replacements.push([p, newValues])
        };

        const parent = p => {
          console.log("// parent", p);

          const parentPath = parsePath(p.replace(path, '$')).slice(0, -1);

          if (parentPath.length === 1 && parentPath[0] === '$') {
            return ['!ROOT', null, decoded];
          }

          console.log("// parentPath", parentPath.join('.'));

          return lookupPath(decoded, parentPath);
        };

        const sibling = p => {
          console.log("// sibling", p);
          const s = lookupPath(decoded, p.replace(path, '$'));
          console.log("// sibling =", JSON.stringify(s));
          if (s == null) throw new ReferenceError("sibling == null");
          return s;
        };

        const nextPath = (current, siblingOnly) => {
          const debugLabel = siblingOnly ? "// nextSibling" : "// nextPath";
          console.log(debugLabel, current);

          const parts = parsePath(current.replace(path, '$'));

          let object = decoded;
          let objects = [];

          // console.log(debugLabel + " STARTING AT", JSON.stringify(object));
          for (let p = 1; object != null && p < parts.length; p++){
            // console.log(debugLabel + " p = " + p);
            const key = parts[p];
            // console.log(debugLabel + " key = " + key);

            objects[p - 1] = object;

            object = object[key];

            const nextValue = typeof object === "object" ? object[2] : null;

            if (nextValue != null) {
              object = nextValue;
            } else {
              break;
            }

            // console.log(debugLabel + " NEXT OBJECT", JSON.stringify(object));
          }

          // console.log(debugLabel + " objects", JSON.stringify(objects));

          for (let p = parts.length - 1; object != null && p > 0; p--){
            // console.log(debugLabel + " p = " + p);
            const key = parts[p];
            // console.log(debugLabel + " key = " + key);

            if (String(key) !== String(key | 0)) {
              throw new TypeError("Cannot increment " + JSON.stringify(key));
            }

            const next = 1 + Number(key);
            // console.log(debugLabel + " next = " + next);
            // console.log(debugLabel + " objects[p - 1].length = " + objects[p - 1].length);

            if (Array.isArray(objects) && objects[p - 1].length > next) {
              parts[p] = next;

              const answer = parts.slice(0, p +  1).join(".").replace(/^\$/, path);
              console.log(debugLabel + " = " + JSON.stringify(answer));
              return answer;

            } else if (siblingOnly) {
              break;
            }
          }

          console.log(debugLabel + " = null");
          return null;
        };

        const nextSibling = p => nextPath(p, true);

        // Advance forward through tree from start until we reach end
        console.log("// Advance forward through tree from start until we reach end");

        let currentPath = startPath;

        // Split text (if required)
        console.log("// Split text (if required)");
        if (startInfo.tags[startInfo.tags.length - 1] !== "text") {
          console.warn('Current range start is not at a text element, not sure what to do');
          return;
        }

        const input = startInfo.data[startInfo.tags.length - 1];

        const from = startPosition;

        const before = input.substring(0, from);
        const wrap = input.substring(from);

        console.log({before, wrap});

        let spec = [tag, {}, []];

        if (wrap.length) spec[2].push(wrap);
        console.log("spec = " + JSON.stringify(spec));

        const replaceWith = [spec];

        if (before.length) replaceWith.unshift(before);
        console.log("currentPath = " + JSON.stringify(currentPath));
        console.log("replaceWith = " + JSON.stringify(replaceWith));

        console.log("flagForReplacement.1");
        flagForReplacement(currentPath, replaceWith);
        let specUsed = true;

        let q = nextSibling(currentPath);

        do {

          console.log("// for q = ...");

          for (;
               q != null && q < endPath;
               q = nextSibling(q)
          ) {
            currentPath = q;
            console.log("currentPath = " + JSON.stringify(q));

            spec[2].push(sibling(currentPath));

            if (!specUsed) {
              flagForReplacement(currentPath, [spec]);
              specUsed = true;
            } else {
              flagForRemoval(currentPath);
            }
          }
          console.log("// end for q;");

          if (currentPath === endPath) {
            // const input = sibling(path);
            const input = endInfo.data[endInfo.tags.length - 1];

            const to = endPosition;

            const wrap = input.substring(0, to);
            const after = input.substring(to);

            if (wrap.length) spec[2].push(wrap);

            if (after.length) {
              console.log("flagForReplacement.3a", jsonClone(spec));
              flagForReplacement(currentPath, [spec, after]);
              specUsed = true;
            } else if (!specUsed) {
              console.log("flagForReplacement.3b", jsonClone(spec));
              flagForReplacement(currentPath, [spec]);
              specUsed = true;
            } else {
              console.log("flagForRemoval.3", jsonClone(spec));

              flagForRemoval(currentPath);
            }
          }

          if (currentPath < endPath) {
            currentPath = nextPath(currentPath);

            spec = [tag, {}, []];
            specUsed = false;
            q = currentPath;
          } else {
            currentPath = null;
            q = null;
          }

        } while (currentPath != null && currentPath <= endPath);

        // Finally, apply replacements in reverse order
        console.log("// Finally, apply replacements in reverse order");

        replacements.reduceRight((_, [path, newValues]) => {
          console.log(`// Replace ${path} with ${JSON.stringify(newValues)}`);

          const index = parsePath(path).pop();

          const parentArray = parent(path);
          console.log(`// index = ${JSON.stringify(index)}`);
          console.log(`// parentArray for ${path} BEFORE ${JSON.stringify({...parentArray})}`);

          parentArray[2].splice(index, 1, ...(newValues ?? []));
          try {
            console.log(`// parentArray for ${path} AFTER ${JSON.stringify({...parentArray})}`);
          } catch (probablyCyclic) {
            console.warn(`// parentArray for ${path} AFTER...`, parentArray);
          }
        }, null);
      }

      try {
        console.log(`// Done ${JSON.stringify(decoded)}`);
      } catch (probablyCyclic) {
        console.warn(`// Done...`, decoded);
      }
      this.$emit("input", JSON.stringify(decoded));
    },
  },

  mounted() {
    document.addEventListener("selectionchange", this.onSelectionChange);
  },

  beforeDestroy() {
    document.removeEventListener("selectionchange", this.onSelectionChange);
  },
}
</script>

<style>
.CMSContentEditor--colorBtn::before {
  background: none;
  border-color: currentColor;
  border-style: solid;
  border-width: 6px;
}

.UnderlineDots {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
}
.UnderlineDots > span {
  display: inline-block;
  width: 2.5px;
  height: 3px;
  margin: 0 0.5px;
  background-color: currentColor;
}

.UnderlineDots--rainbow > span:nth-child(1) { background-color: #E00; }
.UnderlineDots--rainbow > span:nth-child(2) { background-color: orange; }
.UnderlineDots--rainbow > span:nth-child(3) { background-color: yellow; }
.UnderlineDots--rainbow > span:nth-child(4) { background-color: #0E0; }
.UnderlineDots--rainbow > span:nth-child(5) { background-color: deepskyblue; }
.UnderlineDots--rainbow > span:nth-child(6) { background-color: #21F; }
.UnderlineDots--rainbow > span:nth-child(7) { background-color: blueviolet; }

</style>
