<template>
  <v-dialog
      :overlay-opacity="0.8"
      v-model="open"
  >
    <v-card min-height="90vh">
      <v-card-title>
        <span>Tag Properties</span>

        <v-spacer />

        <v-btn icon tile @click="open = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <div style="display: flex; flex-flow: row wrap;">

          <div class="CMSTagDialog--body">
            <CMSComponentProperties
                :value="value"
                @update:tag="setValue($event)"
                @update:props="setValue(null, {props: $event})"
                @update:content="setValue(null, null, $event)"
            />
          </div>

          <div class="CMSTagDialog--body">
            <v-textarea
                style="font-family: monospace"
                :rules="[validJSON]"
                :rows="1 + JSON.stringify(value, null, 2).replace(/[^\n]/g, '').length"
                :value="JSON.stringify(value, null, 2)"
                @input="setJSON"
            />
          </div>

        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import CMSComponentProperties from "@/backend/components/cms/content/CMSComponentProperties.vue";

export default {
  name: "CMSTagDialog",

  components: {CMSComponentProperties},

  props: {
    value: {},
  },

  computed: {
    open: {
      get() {
        return this.value != null;
      },
      set(value) {
        this.$emit(value ? "open" : "close")
      },
    },
  },

  methods: {
    setValue(a, b, c) {
      const {value} = this;

      const newValue = [
          a ?? value[0],
          b ?? value[1],
          c ?? value[2],
      ];

      this.$emit("input", newValue);
    },

    setJSON(value) {
      try {
        this.$emit("input", JSON.parse(value));
      } catch (ignore) {
        // Ignore invalid JSON
        console.log("Ignore invalid JSON");
      }
    },

    validJSON(value) {
      try {
        JSON.parse(value);
        return true;
      } catch (ignore) {
        return false;
      }
    },
  },
}
</script>

<style>
.CMSTagDialog--body {
  flex: 1 1 50%;
  min-width: 25rem;
}
</style>