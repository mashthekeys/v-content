<template>
  <v-select
      label="lang"
      :items="items"
      :value="value"
      @input="$emit('input', $event)"
  />
</template>

<script>
import APP_LANG_INFO from "@/app_lang_info.js";

export default {
  name: 'CMSPageLang',

  props: {
    value: {},
  },

  computed: {
    items() {
      return APP_LANG_INFO.map(([lang, info]) => ({value: lang, text: info.name}));
    },
  },
}
</script>
