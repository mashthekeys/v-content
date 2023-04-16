<template>
  <v-select
      style="display: inline-flex; width: 4em; flex: 0 0 4em;"
      dense
      hide-details
      :items="elementList"
      :value="value"
      @input="$emit('input', $event)"
  />
</template>

<script>
import {cmsElements} from "@/backend/components/cms/content/html.js";

export default {
  name: 'CMSTagSelect',

  props: {
    value: {}
  },

  computed: {
    elementList() {
      const {block, inline, layout, structural} = cmsElements;

      return [...block, ...inline, ...layout, ...structural].map(
          ({name, display, style, class: c}) => ({
            value: name,
            text: `${name} (${display})`,
          })
      );
    },
  },
}
</script>