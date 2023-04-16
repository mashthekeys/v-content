<template>
  <v-menu>
    <template #activator="{attrs, on}">
      <v-btn
          :color="color"
          :elevation="0"
          :outlined="value == null || !selected"
          :text="value == null"
          :style="value == null ? '' : 'flex: 1 0 3em; justify-content: space-between'"
          v-bind="attrs"
          v-on="buttonHandler(on)"
      >
        <span>{{ label }}</span>
        <v-icon v-if="value == null">mdi-plus</v-icon>
        <v-icon v-else-if="selected">mdi-menu</v-icon>
      </v-btn>
    </template>
    <template #default>
      <v-list dense>
        <template v-for="l in langList">
          <v-list-item @click="$emit('change', l)">
            <v-list-item-title>{{ l }}</v-list-item-title>

            <v-list-item-icon v-if="l === value">
              <v-icon>mdi-check</v-icon>
            </v-list-item-icon>
          </v-list-item>

          <v-divider v-if="l === value" />
        </template>
      </v-list>
    </template>
  </v-menu>
</template>

<script>
import config from "../../../../config/config.js";

const {APP_LANG} = config;

export default {
  name: 'CMSLangButton',
  props: {
    color: {
      default: 'primary',
    },
    exclude: {},
    selected: Boolean,
    value: {},
  },

  methods: {
    buttonHandler(handlers) {
      const {click} = handlers;
      
      const on = {...handlers};

      on.click = $event => this.menuOnClick ? click($event) : this.$emit('click', $event);

      return on;
    },
  },
  
  computed: {
    label() {
      const {value} = this;

      return value == null ? "Add" : value;
    },

    cmsLangs() {
      return Array.isArray(APP_LANG) ? APP_LANG.map(String) : ["und"];
    },

    langList() {
      const {cmsLangs, exclude, value} = this;

      let langList = cmsLangs;

      if (Array.isArray(exclude)) {
        langList = langList.filter(
            $ => $ !== value && !exclude.includes($)
        );
      } else {
        langList = langList.filter(
            $ => $ !== value
        );
      }


      if (value != null) {
        langList = [value].concat(langList);
      }

      return langList;
    },

    menuOnClick() {
      return this.selected || this.value == null;
    },
  },
}
</script>
