<template>
  <v-card height="90vh">
    <v-card-title>Alternate Languages</v-card-title>
    <v-card-subtitle>Content within {{parentName}}</v-card-subtitle>
    <v-card-text>
      <v-subheader></v-subheader>
      <v-simple-table>
        <thead>
        <tr>
          <th>Lang.</th>
<!--          <th class="CMSPageLangAlternates&#45;&#45;this">This</th>-->
          <template v-for="(siblings, lang_group) in siblingGroups">
            <th>{{ lang_group }}</th>
          </template>
        </tr>
        </thead>
        <tbody>
        <template v-for="altLang in allLang">
          <tr>
            <th>{{altLang}}:</th>
<!--            <td class="CMSPageLangAlternates&#45;&#45;this">{{getAlternatePath(altLang, langKey)}}</td>-->
            <template v-for="(siblings, lang_group) in siblingGroups">
              <td>{{getName(siblings[altLang])}}</td>
            </template>
          </tr>
        </template>
        </tbody>
      </v-simple-table>
    </v-card-text>
  </v-card>
</template>

<script>
import APP_LANG_INFO from "@/app_lang_info.js";

export default {
  name: 'CMSLangAlternatesGrid',

  props: {
    langKey: {
      default: "",
    },
    parent: {},
  },

  data() {
    return {
      parentLangKey: "",
    };
  },

  methods: {
    getAlternate(altLang) {
      const {allSiblings} = this;

      if (allSiblings == null) return null;

      return allSiblings.find($ => $.lang === altLang);
    },

    getAlternatePath(altLang) {
      const alt = this.getAlternate(altLang);

      if (alt == null) return null;

      return alt.path;
    },

    getName(alt) {
      return alt?.name;
    },
  },

  computed: {
    allLang() {
      return APP_LANG_INFO.map(([lang, info]) => lang);
      // const {alternateLang, lang} = this;
      //
      // const langs = lang ? [lang] : [];
      //
      // if (alternateLang != null) {
      //   langs.push(...alternateLang);
      // }
      //
      // return langs.sort();
    },

    alternateLang() {
      const {allSiblings, lang, langGroup} = this;

      return allSiblings?.filter?.($ => $.lang !== lang && $.lang_group === langGroup);
    },

    lang() {
      return String(this.langKey).split(":")[1];
    },

    langGroup() {
      return String(this.langKey).split(":")[0];
    },

    parentName() {
      return this.parent;
    },

    // parentLangKey() {
    //   const parentLangKey = this.directParent?.lang_key;
      // console.log("parentLangKey", parentLangKey);
      // return parentLangKey;
    // },

    siblingGroups() {
      const {allSiblings} = this;

      if (allSiblings == null) return {};

      const groups = {};

      allSiblings.forEach(sibling => {
        const {lang, lang_group} = sibling;

        if (!lang_group) {
          groups['TODO' + Math.random()] = {[lang]: sibling};

        } else if (groups.hasOwnProperty(lang_group)) {
          groups[lang_group][lang] = sibling;

        } else {
          groups[lang_group] = {[lang]: sibling};
        }
      });

      return groups;
    },
  },

  asyncComputed: {

    allParents: {
      // lazy: true,
      async get() {
        // const parentLangKey = this.directParent?.lang_key;
        const {parentLangKey} = this;

        if (parentLangKey) {
          console.log("allParents.get", parentLangKey);
          const parentGroup = await this.$store.dispatch("cms/getGroupById", {lang_key: parentLangKey});
          const allParents = Object.values(parentGroup.members);
          console.log("allParents result", JSON.parse(JSON.stringify(allParents)));
          return allParents;
        }
      },
    },

    allSiblings: {
      // lazy: true,
      async get() {
        const {allParents} = this;
        const {parentLangKey} = this;

        if (allParents?.length > 0) {
          const parentPaths = allParents.map($ => $.path);
          console.log("allSiblings.get", parentPaths);
          const siblingGroups = await this.$store.dispatch("cms/getChildrenById", {id: parentLangKey});
          const allSiblings = siblingGroups.reduce(
              (array, group) => array.concat(Object.values(group.members)),
              []
          );
          console.log("allSiblings result", JSON.parse(JSON.stringify(allSiblings)));
          return allSiblings;
        }
      },
    },

    directParent: {
      // lazy: true,
      async get() {
        const {parent} = this;

        console.log("directParent.get", parent);
        if (parent) {
          const directParent = await this.$store.dispatch("cms/getPath", {path: parent});
          console.log("directParent result", JSON.parse(JSON.stringify(directParent)));

          // SIDE EFFECT
          const parentLangKey = directParent?.data?.lang_key;

          this.parentLangKey = parentLangKey;

          console.log("directParent parentLangKey", this.parentLangKey, parentLangKey);
          // END OF SIDE EFFECT

          return directParent;
        }
      },
    },

  },

  watch: {
    parent: $ => console.log("parent", $),
  },
}
</script>