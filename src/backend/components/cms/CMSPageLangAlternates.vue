<template>
  <div class="CMSPageLangAlternates">
    <v-menu
        bottom
        nudge-bottom="36px"
        :close-on-content-click="false"
    >
      <template #activator="{attrs, on, value: open}">
        <v-sheet class="CMSPageLangAlternates--col" rounded>
          <v-btn
              :color="open ? 'primary' : void ''"
              block
              width="100px"
              v-bind="attrs"
              v-on="on"
          >
            <span>{{ isNew ? "New Page" : "This Page" }}</span>
            <v-spacer />
            <span>🏴</span>
            <span>{{value}}</span>
            <v-icon>mdi-menu</v-icon>
          </v-btn>

          <template v-if="isNew"></template>

          <template v-else-if="alternateLang != null && alternateLang.length">
            <v-subheader style="height: 24px; cursor: default">
              <v-icon disabled left small>mdi-pencil</v-icon>
              Also available in
            </v-subheader>

            <div>
              <template v-for="altLang in alternateLang.slice(0, 2)">
                <v-btn
                    depressed
                    small
                    tile
                    width="100px"
                    @click="goToTranslation(altLang)"
                    :key="altLang"
                >
                  <span>🏴</span>
                  <span>{{altLang}}</span>
                </v-btn>
              </template>
            </div>

            <template v-if="alternateLang.length > 2">
              <v-btn
                  block
                  small
                  tile
                  v-on="on"
              >{{alternateLang.length - 2}} more…</v-btn>
            </template>
          </template>

          <template v-else-if="canCreateLang != null && canCreateLang.length">
            <v-subheader style="height: 24px; cursor: default">
              <v-icon disabled left small>mdi-plus-thick</v-icon>
              Create translation
            </v-subheader>

            <div>
              <template v-for="altLang in canCreateLang.slice(0, 2)">
                <v-btn
                    small
                    text
                    tile
                    width="100px"
                    @click="createTranslation(altLang)" :key="altLang">
                  <span>➕</span>
                  <span>{{altLang}}</span>
                </v-btn>
              </template>
            </div>

            <template v-if="canCreateLang.length > 2">
              <v-btn
                  block
                  small
                  text
                  tile
                  v-on="on"
              >{{canCreateLang.length - 2}} more…</v-btn>
            </template>
          </template>

        </v-sheet>
      </template>

      <template #default>
        <v-sheet class="CMSPageLangAlternates--col" :color="tint(2, 'primary')">
          <template v-if="!isNew && (alternateLang != null && alternateLang.length)">
            <v-subheader style="height: 24px; cursor: default">
              <v-icon disabled left small>mdi-pencil</v-icon>
              Also available in
            </v-subheader>

            <template v-for="altLang in alternateLang">
              <v-btn
                  :color="tint(3, 'primary')"
                  depressed
                  small
                  tile
                  width="100px"
                  @click="goToTranslation(altLang)"
                  :key="altLang"
              >
                <span>🏴</span>
                <span>{{altLang}}</span>
              </v-btn>
            </template>

          </template>

          <template v-if="!isNew && (canCreateLang != null && canCreateLang.length)">
            <v-subheader style="height: 24px; cursor: default">
              <v-icon disabled left small>mdi-plus-thick</v-icon>
              Create translation
            </v-subheader>

            <template v-for="altLang in canCreateLang">
              <v-btn
                  small
                  text
                  tile
                  width="100px"
                  @click="createTranslation(altLang)"
                  :key="altLang"
              >
                <span>➕</span>
                <span>{{altLang}}</span>
              </v-btn>
            </template>
          </template>

          <v-subheader style="height: 24px; cursor: default">
            <v-icon disabled left small>mdi-flag</v-icon>
            Change
          </v-subheader>

          <v-select
              color="primary"
              dense
              hide-details
              :items="canSetLang"
              style="padding-bottom: 8px"
              :value="value"
              @input="$emit('input', $event)"
          >
            <template #item="{item}">
              <v-list-item-title style="text-align: center; text-transform: uppercase">
                <span>🏴 </span>
                <span>{{item.text || item}}</span>
              </v-list-item-title>
            </template>

            <template #selection="{item,index,selected,disabled}">
              <v-list-item-title style="text-align: center; text-transform: uppercase">
                <span>🏴 </span>
                <span>{{item.text || item}}</span>
              </v-list-item-title>
            </template>
          </v-select>

        </v-sheet>
      </template>
    </v-menu>

  </div>
</template>

<script>
import CMSLangAlternatesGrid from "@/backend/components/cms/CMSLangAlternatesGrid.vue";
import config from "../../../../config/config.js";

const {APP_LANG} = config;

export default {
  name: 'CMSPageLangAlternates',
  components: {CMSLangAlternatesGrid},

  props: {
    value: {},

    langGroup: {},

    parent: {},

    path: {},
  },

  data() {
    return {
      open: false,
    };
  },

  methods: {
    openDialog() {
      this.open = true;
    },

    async createTranslation(newLang) {
      const {langGroup, parent} = this;

      const name = new Date().toISOString().replace(/:/g, "-").replace(".", "_").replace("Z", "");

      // Search for alt-value parent
      const groupObject = await this.$store.dispatch("cms/getGroupByPath", {path: parent});

      const parentObject = groupObject?.members?.[newLang];

      const newParent = parentObject?.path ?? parent;

      const ext = "";

      const path = `${newParent?.length > 1 ? newParent : ""}/${name}${ext}`;

      const data = {
        path,
        parent: newParent,
        name,
        ext,
        title: name,
        lang: newLang,
        published_at: null,
        lang_group: langGroup,
        meta: null,
        local_data: {},
        local_transform: "",
        page_content: {default: []},
      };

      const pathObject = await this.$store.dispatch("cms/createPathInGroup", {data})

      this.$emit("update:path", pathObject.path);
    },

    goToTranslation(lang) {
      const {alternates} = this;

      const alternate = alternates.find($ => $?.data?.lang === lang);

      const path = alternate?.path;

      if (path) {
        console.log("goToTranslation", lang, path);
        this.$emit("update:path", path);
      } else {
        throw new ReferenceError(`No translation in ${lang}`);
      }
    },


    tint(level, color) {
      const tint = (this.$vuetify.theme.dark ^ (level < 0)) ? 'darken' : 'lighten';

      return `${tint}-${Math.abs(level)}${color != null ? " " + color : ""}`;
    },
  },

  computed: {
    allLang() {
      const {alternateLang, value} = this;

      const langs = (alternateLang ?? []).concat(value);

      return langs.sort();
    },

    alternateLang() {
      const {alternates, value, path} = this;

      if (alternates == null) return null;

      return alternates.filter(
          // $ => $?.data?.lang !== value
          $ => $?.path !== path
      ).map(
          $ => $?.data?.lang
      );
    },

    canCreateLang() {
      const {alternateLang, isRoot, value} = this;

      if (isRoot) return [];

      if (alternateLang == null) return APP_LANG.slice();

      return APP_LANG.filter($ => $ !== value && !alternateLang.includes($));
    },

    canSetLang() {
      const {alternateLang, value} = this;

      if (alternateLang == null) return APP_LANG.slice();

      return [String(value)].concat(
          APP_LANG.filter($ => $ !== value && !alternateLang.includes($))
      );
    },

    isRoot() {
      return !this.parent;
    },

    isNew() {
      // TODO
      return false;
    },

    langKey() {
      const {langGroup, value} = this;

      if (langGroup > 0 && typeof value === "string" && value.length > 0) {
        return `${langGroup}:${value}`;
      }

      return "";
    },
  },

  asyncComputed: {
    alternates: {
      // lazy: true,
      async get() {
        const {langGroup} = this;

        if (langGroup.length > 0) {

          // console.log("alternates.get", langGroup);

          const match = await this.$store.dispatch("cms/getGroupById", {id: langGroup});

          // console.log("alternates.get", langGroup, JSON.parse(JSON.stringify(match.members)));

          return Object.values(match.members);
        }

        return [];
      },
    },
  },
}
</script>

<style>
div.CMSPageLangAlternates {
}

div.CMSPageLangAlternates--col.v-sheet {
  width: 200px;
}
</style>

