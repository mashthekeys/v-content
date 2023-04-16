<template>
  <div class="v-input v-text-field v-input--is-label-active v-input--is-dirty" :class="themeClass">
    <div class="v-input__control">
      <div class="v-input__slot">
        <v-label v-if="label != null && label.length" absolute :value="true" style="min-width: 100%; position:absolute;">{{label}}</v-label>

        <CMSContentSlots
            path="$"
            :value="value"
            @input="$emit('input', $event)"
        />

      </div>

      <div class="v-messages" :class="themeClass"><div class="v-messages__wrapper"></div></div>
    </div>
  </div>
</template>

<script>
import {VLabel} from "vuetify/lib/components";
import CMSContentSlots from "@/backend/components/cms/content/CMSContentSlots.vue";

export default {
  name: 'CMSSlotsEditor',

  components: {CMSContentSlots, "v-label": VLabel},

  props: {
    label: {},
    value: {},
  },

  computed: {
    themeClass() {
      return this.$vuetify.theme.dark ? "theme--dark" : "theme--light";
    },
  },
}
</script>
