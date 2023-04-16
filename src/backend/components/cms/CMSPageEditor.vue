<template>
  <v-container class="CMSPageEditor">

    <v-progress-linear indeterminate v-if="form == null" />

    <template v-else>
      <v-row>
        <v-col>
          <div style="display:flex; flex-flow: row; align-items: center">
            <v-btn
                :color="color"
                :outlined="toolbarTab !== 0"
                style="border-radius: 6px 6px 0 0; flex: 2 0 5em;"
                @click="toolbarTab = 0"
            >
              <v-icon left>mdi-web</v-icon>
              <span>Properties</span>
            </v-btn>

            <v-btn
                :color="color"
                :outlined="toolbarTab !== 1"
                style="border-radius: 6px 6px 0 0; flex: 2 0 5em;"
                @click="toolbarTab = 1"
            >
              <v-icon left>mdi-file-document</v-icon>
              <span>Page</span>
            </v-btn>

            <v-btn
                :color="color"
                :outlined="toolbarTab !== 2"
                style="border-radius: 6px 6px 0 0; flex: 2 0 5em;"
                @click="toolbarTab = 2"
            >
              <v-icon left>mdi-code-braces-box</v-icon>
              <span>Data</span>
            </v-btn>

            <v-spacer />
          </div>

          <v-toolbar
              :color="color"
              dense
              :elevation="0"
              class="CMSPageEditor--toolbar"
          >
            <v-tooltip bottom :color="color" nudge-top="10px" transition="none">
              <template #activator="{attrs, on}">
                <div v-bind="attrs" v-on="on">
                  <v-btn-toggle v-model="editorLevel" :background-color="'#00000000'">
                    <v-btn icon :value="2" tile>
                      <v-icon>mdi-pencil-box</v-icon>
                    </v-btn>
                    <v-btn icon :value="1" tile>
                      <v-icon>mdi-code-braces-box</v-icon>
                    </v-btn>
                    <v-btn icon :value="0" tile>
                      <v-icon>mdi-text-box</v-icon>
                    </v-btn>
                  </v-btn-toggle>
                </div>
              </template>
              <span class="toolbarLabel text--primary">
                <v-icon>mdi-menu-up</v-icon>
                <span style="display: inline-flex; flex-flow: column; align-items: stretch; text-align: center">
                  <span :style="{height: 0, visibility: editorLevel === 2 ? 'visible' : 'hidden'}">Visual Editor</span>
                  <span :style="{height: 0, visibility: editorLevel === 1 ? 'visible' : 'hidden'}">Source Editor</span>
                  <span :style="{visibility: editorLevel === 0 ? 'visible' : 'hidden'}">Source Code</span>
                </span>
              </span>
            </v-tooltip>

            <v-spacer />

            <v-tooltip bottom :color="color" nudge-top="10px" transition="none">
              <template #activator="{attrs, on}">
                <v-btn icon tile v-bind="attrs" v-on="on" @click="viewPage">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
              </template>
              <span class="toolbarLabel text--primary">
                <v-icon>mdi-menu-up</v-icon>
                View Page
              </span>
            </v-tooltip>

            <v-spacer />

            <v-tooltip bottom :color="color" nudge-top="10px" transition="none">
              <template #activator="{attrs, on}">
                <v-btn icon tile v-bind="attrs" v-on="on">
                  <v-icon>mdi-cursor-move</v-icon>
                </v-btn>
              </template>
              <span class="toolbarLabel text--primary">
                <v-icon>mdi-menu-up</v-icon>
                Move
              </span>
            </v-tooltip>

            <v-spacer />

            <v-tooltip bottom :color="color" nudge-top="10px" transition="none">
              <template #activator="{attrs, on}">
                <v-btn icon tile v-bind="attrs" v-on="on">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
              <span class="toolbarLabel text--primary">
                <v-icon>mdi-menu-up</v-icon>
                Delete
              </span>
            </v-tooltip>

            <v-spacer />

            <v-tooltip bottom :color="color" nudge-top="10px" transition="none">
              <template #activator="{attrs, on}">
                <v-btn icon tile v-bind="attrs" v-on="on" @click="save">
                  <v-icon>mdi-cloud-upload</v-icon>
                </v-btn>
              </template>
              <span class="toolbarLabel text--primary">
                <v-icon>mdi-menu-up</v-icon>
                Save
              </span>
            </v-tooltip>
          </v-toolbar>
        </v-col>
      </v-row>

      <div style="display:flex; flex-flow: row-reverse wrap">
        <CMSPageLangAlternates
            :color="color"
            :lang-group="form.lang_group"
            :parent="form.parent"
            :path="form.path"
            :value="form.lang"
            @input="$set(form, 'lang', $event)"
            @update:path="$emit('input', $event)"
        />

        <template v-if="toolbarTab === 0">
          <div style="flex: 1 0 auto">
            <v-subheader>Properties</v-subheader>

            <template v-if="isRoot">
              <tt class="CMSPageEditor--path">/</tt>
            </template>

            <template v-else>
              <v-text-field label="Name" v-model="form.name">
                <template #prepend-inner>
                  <tt class="CMSPageEditor--path">/</tt>
                </template>
              </v-text-field>
            </template>
          </div>
        </template>

        <template v-if="toolbarTab === 1">
          <div style="flex: 1 0 auto">
            <v-subheader>Page</v-subheader>

            <v-text-field
                label="Title"
                v-model="form.title"
            />
          </div>
        </template>

        <template v-if="toolbarTab === 2">
          <div style="flex: 1 0 auto">
            <v-subheader>Data</v-subheader>
          </div>
        </template>
      </div>

      <v-row>
        <v-col v-if="toolbarTab === 0">
          <div style="display: flex; flex-flow: column; justify-items: flex-start">
            <div>
              <v-select
                  label="Component"
                  prepend-icon="mdi-hexagon-outline"
                  :items="pageViewList"
                  v-model="form.component"
              />
            </div>

            <div>
              <v-checkbox
                  label="List in Menu"
                  v-model="form.inMenu"
              />
            </div>

            <div style="background: rgba(240,248,255, 0.3)">
              <v-checkbox label="Props" :input-value="true" />

              <template v-if="editorLevel === 0">
                <v-textarea
                    label="Props Array"
                    :rules="[validJSON]"
                    spellcheck="false"
                    v-model="form.props"
                />

                <v-text-field
                    label="Props Function"
                    spellcheck="false"
                    v-model="form.propsFn"
                />
              </template>

              <template v-else>
                <v-json-editor
                    label="Props Array"
                    v-model="form.props"
                />

                <v-text-field
                    label="Props Function"
                    spellcheck="false"
                    v-model="form.propsFn"
                />
              </template>
            </div>
          </div>
        </v-col>

        <v-col v-else-if="toolbarTab === 1">
          <div style="display: flex; flex-flow: column; justify-items: flex-start">


            <div style="display:inline-flex; flex-flow: row">
              <v-simple-checkbox
                  :value="publishedAt != null"
                  @input="publishedAt = ($event ? new Date() : null)"
              />

              <v-menu :disabled="publishedAt == null">
                <template #activator="{attrs, on}">
                  <tt
                      aria-label="Publication Date"
                      v-bind="attrs"
                      v-on="on"
                      v-text="publishedAtLabel"
                  ></tt>
                </template>

                <div style="display:flex; flex-flow: row wrap">
                  <v-date-picker
                      :value="publishedAt != null ? String(publishedAt).substr(0, 10) : null"
                      @input="publishedAt = $event + 'T' + (String(publishedAt).substr(11, 8) || '00:00:00') + 'Z'"
                  />
                  <v-time-picker
                      :value="publishedAt != null ? String(publishedAt).substr(11, 8) : null"
                      @input="publishedAt = String(publishedAt || new Date().toISOString()).substr(0, 10) + 'T' + $event + 'Z'"
                  />
                </div>
              </v-menu>
            </div>

            <div>
              <template v-if="editorLevel === 0">
                <v-textarea
                    label="Page Content"
                    :rules="[validJSON]"
                    spellcheck="false"
                    v-model="form.page_content"
                />
              </template>
              <template v-else-if="editorLevel === 1">
                <v-json-editor
                    label="Page Content"
                    v-model="form.page_content"
                />
              </template>
              <template v-else>
                <CMSSlotsEditor
                    label="Page Content"
                    v-model="form.page_content"
                />
              </template>
            </div>
          </div>
        </v-col>

        <v-col v-else-if="toolbarTab === 2">
          <template v-if="editorLevel === 0">
            <v-textarea
                label="Page Data (Shared)"
                :rules="[validJSON]"
                spellcheck="false"
                v-model="form.shared_data"
            />

            <v-text-field
                label="Page Transform"
                spellcheck="false"
                v-model="form.shared_transform"
            />

            <v-textarea
                :label="'Page Data (' + form.lang + ')'"
                :rules="[validJSON]"
                spellcheck="false"
                v-model="form.local_data"
            />

            <v-text-field
                :label="'Additional Transform (' + form.lang + ')'"
                spellcheck="false"
                v-model="form.local_transform"
            />
          </template>
          <template v-else>
            <v-json-editor
                label="Page Data (Shared)"
                v-model="form.shared_data"
            />

            <v-text-field
                label="Page Transform"
                spellcheck="false"
                v-model="form.shared_transform"
            />

            <v-json-editor
                :label="'Page Data (' + form.lang + ')'"
                v-model="form.local_data"
            />

            <v-text-field
                :label="'Additional Transform (' + form.lang + ')'"
                spellcheck="false"
                v-model="form.local_transform"
            />
          </template>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>
import CMSPageLangAlternates from "@/backend/components/cms/CMSPageLangAlternates.vue";
import view_components from "@/../cache/view-components.js";
import config from "../../../../config/config.js";
import CMSSlotsEditor from "@/backend/components/cms/content/CMSSlotsEditor.vue";
import VJsonEditor from "@/../local_modules/v-json-editor/src/components/VJsonEditor.vue";

const {DEV_URL} = config;

function JSON_stringify_safe(anything) {
  try {
    return JSON.stringify(anything, null, 2);
  } catch (ignored) {
  }
  return '"Invalid"';
}

export default {
  name: 'CMSPageEditor',

  components: {VJsonEditor, CMSSlotsEditor, CMSPageLangAlternates},

  props: {
    value: {},
  },

  data() {
    return {
      form: null,

      nSaves: 0,

      toolbarTab: 1,

      editorLevel: 2,
    };
  },

  methods: {
    makeForm(pathObject) {
      // pathObject = pathObject == null ? {} : {...pathObject};

      // console.log("makeForm", {...pathObject});
      const group = pathObject.group;
      // console.log("makeForm group", {...group});

      const data = pathObject.data ?? {};

      const sharedRoute = group?.data?.shared_route ?? {};

      return {
        path: pathObject.path ?? "",

        parent: data.parent ?? "",
        name: data.name ?? "",
        title: data.title ?? "",
        lang: data.lang ?? "",
        published_at: data.published_at ?? null,
        lang_group: data.lang_group,
        meta: JSON_stringify_safe(data.meta),
        local_data: JSON_stringify_safe(data.local_data),
        local_transform: data.local_transform ?? "",
        page_content: JSON_stringify_safe(data.page_content || {default: []}),

        component: sharedRoute.component,
        inMenu: !!sharedRoute.inMenu,
        props: JSON_stringify_safe(sharedRoute.props ?? null),
        propsFn: sharedRoute.propsFn,
        shared_data: JSON_stringify_safe(group?.data?.shared_data),
        shared_transform: group?.data?.shared_transform ?? "",
      };
    },

    makeValue(form, path) {
      const pathObject = {
        published_at: form.published_at || null,
        parent: String(form.parent),
        name: String(form.name),
        path: String(path),
        lang: String(form.lang),
        lang_group: String(form.lang_group),
        title: String(form.title),
        meta: JSON.parse(form.meta || "null"),
        local_data: JSON.parse(form.local_data || "null"),
        local_transform: String(form.local_transform || ""),
        page_content: JSON.parse(form.page_content || "null"),
      };

      const group = {
        id: String(form.lang_group),
        shared_route: {
          props: JSON.parse(form.props || "null") || undefined,
          inMenu: form.inMenu ? true : undefined,
          propsFn: form.propsFn || undefined,
          component: String(form.component || ""),
        },
        shared_data: JSON.parse(form.shared_data || "null"),
        shared_transform: String(form.shared_transform || ""),
      };

      return {
        group,
        path: pathObject,
      };
    },

    async save() {
      const saveValue = this.makeValue(this.form, this.value);

      console.log("save saveValue", saveValue);

      const updated = await this.$store.dispatch("cms/updatePath", saveValue);

      console.log("save updated", updated);

      this.$emit("save", {value: updated});
    },

    validJSON(string) {
      try {
        JSON.parse(string);

        return true;
      } catch (ignored) {
        return false;
      }
    },

    viewPage() {
      window.open(DEV_URL + this.value, "_blank", "noopener,noreferrer")
    },
  },

  computed: {
    color() {
      return this.$vuetify.theme.dark ? "deep-purple" : "blue accent-3";
    },

    isRoot() {
      return this.value === "/";
    },

    pageViewList() {
      return view_components.slice();
    },

    path() {
      const {parent, name} = this.form;

      if (!parent?.length) return "/";

      return parent + "/" + name + "/";
    },

    publishedAt: {
      get() {
        const {published_at} = this.form;

        if (published_at == null) {
          return null;
        } else if (published_at.toISOString) {
          return published_at.toISOString();
        } else {
          return String(published_at);
        }
      },

      set(value) {
        if (value == null) {
          this.form.published_at = null;
        } else if (value.toISOString) {
          this.form.published_at = value.toISOString();
        } else {
          this.form.published_at = String(value);
        }
      },
    },

    publishedAtLabel() {
      const {publishedAt} = this;

      return (publishedAt != null
          ? `Published ${String(publishedAt).substr(0, 19)}`
          : 'Draft'
      );
    },
  },

  asyncComputed: {
    cachedPath: {
      async get() {
        if (this.value) {
          return this.$store.dispatch("cms/getPath", {path: this.value});
        }
      },
      watch: ["nSaves"],
    },
  },

  watch: {
    cachedPath(cachedPath) {
      this.form = cachedPath != null ? this.makeForm(cachedPath) : null;

      this.selectedLang = cachedPath?.data?.lang;
    },
  },
}
</script>

<style>
tt.CMSPageEditor--path {
  line-height: 20px;
}

tt.CMSPageEditor--path.CMSPageEditor--parent {
  opacity: 0.9;
}

span.toolbarLabel {
  font-weight: bold;
}

span.toolbarLabel > .v-icon {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -63%);
}

.CMSPageEditor--toolbar {
  border-radius: 0 4px 4px 4px;
}

.CMSPageEditor--toolbar > .v-toolbar__content > div > .v-btn-toggle > .v-btn.v-btn > span.v-btn__content > .v-icon {
  color: #0007;
}

.CMSPageEditor--toolbar > .v-toolbar__content > div > .v-btn-toggle > .v-btn.v-btn.v-btn--active > span.v-btn__content > .v-icon {
  color: #000F;
}

.CMSPageEditor--toolbar.theme--dark > .v-toolbar__content > div > .v-btn-toggle > .v-btn.v-btn > span.v-btn__content > .v-icon {
  color: #FFF7;
}

.CMSPageEditor--toolbar.theme--dark > .v-toolbar__content > div > .v-btn-toggle > .v-btn.v-btn.v-btn--active > span.v-btn__content > .v-icon {
  color: #FFFF;
}
</style>