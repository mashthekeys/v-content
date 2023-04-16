<template>
  <v-treeview
      class="CMSPathTree"
      :active.sync="selected"
      activatable
      dense
      item-key="path"
      item-text="path"
      :load-children="fetchChildren"
      :multiple-active="false"
      :items="pageTree"
      :open="openPaths"
      @update:open="setOpen"
  >
    <template #label="{item, open, active, selected}">
      <div class="CMSPathTree--node">
        <div class="CMSPathTree--divider"
             :style="{
               left: `${(item.path === '/' ? 1 : 1 + item.path.replace(/[^\/]+/g, '').length) * 24 - 20}px`,
             }"></div>

        <v-btn
            v-if="item.emptyTreePlaceholder"
            block
            @click="createNewChild('', '0', void 0, '')"
        >
          <span>Create Page</span>
        </v-btn>

        <template v-else>
          <div style="float: left">
            <tt style="font-size: 80%; display:inline-block; vertical-align: bottom"
                v-text="((item.data && item.data.name) || item.path) + '\u202F'"
            />
          </div>

          <div style="float: right; font-weight:bold;">{{item.data && item.data.title}}</div>

          <div style="clear:both;"></div>

          <div
              v-if="open || active || selected"
              style="padding: 3px 0 0 0"
              @mousedown.stop.prevent
              @mouseup.stop.prevent
              @click.stop.prevent
          >
            <v-btn
                small
                block
                @click="createNewChild(item.path, item.data.lang_group, item.data.lang)"
            >New page
            </v-btn>
          </div>
        </template>
      </div>
    </template>
  </v-treeview>
</template>

<script>
import randomUint64 from "@/util/randomUint64.js";

export default {
  name: 'CMSPathTree',

  props: {
    value: {}
  },

  watch: {
    rootPath(rootPath) {
      const {pageTree} = this;
      
      if (pageTree.length) {
        this.$set(pageTree, 0, rootPath);
      } else {
        rootPath.push(pageTree); 
      }

      ++this.newRoot;
    },
    
    selected(selected) {
      this.$emit("input", selected);
    },

    value(value) {
      const {selected} = this;

      if (Array.isArray(value)) {
        const isDifferent = value.length !== selected.length && value.some((v, i) => v !== selected[i]);

        if (isDifferent) {
          this.selected = value.slice();
        }
      }
    },
    //
    // openPaths(openPaths, old) {
    //   console.log(`openPaths`, [...openPaths], [...old]);
    // },
  },

  data() {

    const {value} = this;

    // console.log("data rootPath", JSON.stringify(rootPath));

    return {
      newRoot: 0,
      openPaths: [],
      selected: Array.isArray(value) ? value.slice() : [],
    };
  },

  methods: {
    setOpen(value) {
      // console.log("setOpen()", [...value]);

      if (!value.length) {
        // Do nothing
        return;
      }

      if (value.length === 1 && value[0] !== "/") {
        // Workaround for bug in v-treeview.
        // Updates to open after child nodes are reset seem to remove previously opened nodes.
        value = value.concat(this.openPaths);
      }

      const open = new Set(value);

      if (value.length) open.add("/");

      value.forEach(str => {
        if (typeof str === "string") {
          const parts = str.split("/");

          for (let l = 2; l <= parts.length; ++l) {
            const path = parts.slice(0, l).join("/");
            open.add(path);
          }
        }
      });

      this.openPaths = [...open];
      // console.log("setOpen() Result", [...open]);
    },

    async createNewChild(parent, parent_group, defaultLang, name) {
      try {
        console.log(`createNewChild(${parent}, ${parent_group}, ${defaultLang}, ${name})`);
        name = name ?? `new_${new Date().toISOString().replace(/:/g, "-").replace(/\./, "_").replace(/Z$/g, "")}`;

        const lang_group = randomUint64();

        const lang = defaultLang || "und";

        console.log(`lang_key ${lang_group}:${lang}`);

        const path = {
          parent,
          name,
          ext: "",
          lang,
          lang_group,
          published_at: null,
          title: "",
          route: {},
          local_data: {},
          local_transform: "",
        };

        const group = {
          id: lang_group,
          parent_group,
          shared_route: {},
          shared_data: {},
          shared_transform: "",
        };

        console.log(`cms/createGroup`, JSON.stringify({
          data: group,
          members: {[lang]: path},
        }, null, 2));

        const groupObject = await this.$store.dispatch("cms/createGroup", {
          data: group,
          members: {[lang]: path},
        });

        console.log("createNewChild", JSON.stringify(groupObject.members, null, 2));

        const pathObject = groupObject.members[lang];

        this.selected = [pathObject.path];

        this.openPaths = this.openPaths.filter($ => $ !== parent);

        this.$nextTick(
            () => {
              if (parent !== "") {
                if (!this.openPaths.includes(parent)) {
                  console.log("createNewChild openPaths CHANGING", JSON.stringify(this.openPaths));
                  this.openPaths.push(parent);
                  console.log("createNewChild openPaths", JSON.stringify(this.openPaths));
                } else {
                  console.log("createNewChild openPaths OK", JSON.stringify(this.openPaths));
                }
              } else {
                console.log("createNewChild openPaths parent = ", JSON.stringify(parent));
              }
            }
            // ,
            // 100
        );
      } catch (exception) {
        console.error(exception);

        throw exception;
      }
    },

    async fetchChildren({path, childrenLoaded}) {
      if (!childrenLoaded) {
        await this.$store.dispatch("cms/getChildrenByPath", {path});
      }
    },

  },

  computed: {
    pageTree() {
      const {rootPath, $asyncComputed} = this;

      if ($asyncComputed.rootPath.success) {
        if (rootPath != null) {
          return [rootPath];
        } else {
          return [{emptyTreePlaceholder: true}];
        }
      }

      return [];
    },
  },

  asyncComputed: {
    rootPath: {
      async get() {
        return this.$store.dispatch("cms/getPath", {path: "/"});
      },
      watch: ['newRoot'],
    },
  },
}
</script>

<style>

.CMSPathTree.v-treeview {
  padding-bottom: 3px;
  flex: 1 1 50vh;
}

.CMSPathTree.v-treeview button.v-treeview-node__toggle {
  margin: 8px 0 0 0;
}

.CMSPathTree.v-treeview .v-treeview-node__root {
  align-items: flex-start;
}

.CMSPathTree.v-treeview .v-treeview-node__content {
  padding: 4px 0;
}

div.CMSPathTree--divider {
  display: block;
  position: absolute;
  left: 0;
  right: 0;
  top: -1px;
  bottom: 0;
  border-top: solid 1px;
  border-bottom: solid 1px;
  pointer-events: none;
  color: #889;
}

</style>