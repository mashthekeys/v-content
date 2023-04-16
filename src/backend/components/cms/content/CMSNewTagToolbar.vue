<template>
  <v-sheet dense min-width="100%" width="100%" style="">
    <div style="height: 36px">
      <v-btn color="accent" tile icon @click="insertTag('p')">
        <TagIcon value="p" />
      </v-btn>

      <v-btn color="accent" tile icon @click="insertTag('ul')">
        <TagIcon value="ul" />
      </v-btn>

      <v-btn color="accent" tile icon @click="insertTag('ol')">
        <TagIcon value="ol" />
      </v-btn>

      <v-btn color="accent" tile icon @click="insertTag('blockquote')">
        <TagIcon value="blockquote" />
      </v-btn>

      <v-btn color="accent" tile icon @click="insertTag('h6')">
        <v-icon>mdi-format-header-pound</v-icon>
      </v-btn>

      <v-btn color="accent" tile icon @click="insertTag('br')">
        <TagIcon value="br" />
      </v-btn>

      <v-btn color="accent" tile icon @click="insertTag('hr')">
        <TagIcon value="hr" />
      </v-btn>

      <v-btn color="accent" tile icon @click="insertTag('table')">
        <TagIcon value="table" />
      </v-btn>

      <v-btn color="accent" tile icon @click="insertTag('details')">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path style="fill: currentColor" d="M3,8.5L5.5,4H0.5L3,8.5M7,19H22V17H7V19M7,13H22V11H7V13M7,7H22V5H7V7Z" />
        </svg>
      </v-btn>

      <v-btn color="accent" tile icon @click="insertTag('aside')">
        <TagIcon value="aside" />
      </v-btn>

      <v-btn color="accent" tile icon @click="insertTag('div')">
        <TagIcon value="div" />
      </v-btn>
    </div>

    <div style="height: 36px; display:flex; flex-flow: row">

      <output style="flex: 1 1 33%; padding: 8px" v-text="userHint" />

      <v-text-field
        style="flex: 1 1 66%"
        dense
        hide-details
        v-model="tagValue"
        @keydown.enter="$emit('insert', tagValue)"
      />

      <v-btn color="accent" icon tile @click="$emit('insert', tagValue)">
        <TagIcon value="+" />
      </v-btn>
    </div>
  </v-sheet>
</template>

<script>
import TagIcon from "@/backend/components/cms/content/TagIcon.js";

export default {
  name: "CMSNewTagToolbar",

  components: {TagIcon},

  data() {
    return {
      tagValue: "custom-tag",
    };
  },

  computed: {
    userHint() {
      return `Create a new tag`;
    },
  },

  methods: {
    insertTag(tag) {
      this.$emit("insert", tag);
    },
  },
}
</script>

<style>

</style>