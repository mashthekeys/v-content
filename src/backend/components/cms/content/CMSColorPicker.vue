<template>
  <v-sheet>
    <v-list-item @click="applyColor(null)">
      <v-list-item-icon>
        <v-icon>mdi-square-outline</v-icon>
      </v-list-item-icon>

      <v-list-item-content>
        Default color
      </v-list-item-content>
    </v-list-item>

    <v-list-item :disabled="lastColor == null" @click="applyColor(lastColor)">
      <v-list-item-icon>
        <v-icon :color="lastColor">mdi-square</v-icon>
      </v-list-item-icon>

      <v-list-item-content>{{ lastColor }}</v-list-item-content>
    </v-list-item>

    <v-tabs v-model="colorModelIndex">
      <v-tab>Swatches</v-tab>
      <v-tab>RGB</v-tab>
      <v-tab>HSL</v-tab>
    </v-tabs>

    <v-color-picker
        :mode="colorModel"
        :modes="colorModel"
        :hide-canvas="showSwatches"
        :hide-inputs="showSwatches"
        hide-mode-switch
        :hide-sliders="showSwatches"
        :show-swatches="showSwatches"
        :value="lastColorObject.value"
        @input="pickColor"
    />
  </v-sheet>
</template>

<script>
export default {
  name: 'CMSColorPicker',

  props: {
    value: {}
  },

  data() {
    return {
      colorModelIndex: 1,
      lastColor: this.value,
    };
  },

  computed: {
    colorModel() {
      const {colorModelIndex} = this;

      if (colorModelIndex === 2) {
        return "hsla";
      }
      return "rgba";
    },

    showSwatches() {
      const {colorModelIndex} = this;

      return !colorModelIndex;
    },

    lastColorObject() {
      const {value} = this;

      if (value == null) {
        console.log("Null color value", value);
        return {
          mode: "hexa",
          value: null,
        };
      }

      const match = /^(rgba?|hsla?)\s*\(\s*([0-9.]+%?)\s*,\s*([0-9.]+%?)\s*,\s*([0-9.]+%?)\s*(?:,\s*([0-9.]+%?)\s*)?\)/.exec(value);
      console.log("Match color value", match);

      if (match == null) {
        return {
          mode: "hexa",
          value,
        };
      }

      const mode = match[1];

      if (mode === "rgb" || mode === "rgba") {
        return {
          mode: "rgba",
          value: {
            r: match[2],
            g: match[3],
            b: match[4],
            a: match[5] ?? 1,
          }
        };
      }

      if (mode === "hsl" || mode === "hsla") {
        return {
          mode: "hsla",
          value: {
            h: match[2],
            s: match[3],
            l: match[4],
            a: match[5] ?? 1,
          }
        };
      }

      console.warn("Cannot understand color value", value);
      return {
        mode: "hexa",
        value: null,
      };
    },
  },

  methods: {
    applyColor(color) {
      console.log("applyColor", color);
      this.$emit('input', color);
    },

    pickColor(color) {
      const {colorModelIndex} = this;

      console.log("pickColor", color, colorModelIndex);

      if (colorModelIndex === 0 && "hexa" in color) {
        if (color.alpha === 1) {
          this.lastColor = color.hex || color.hexa;
          console.log("pickColor setting color.hex", this.lastColor);
        } else {
          this.lastColor = color.hexa;
          console.log("pickColor setting color.hexa", this.lastColor);
        }

      } else if (colorModelIndex === 2 && "hsla" in color) {
        const {hsla} = color;
        this.lastColor = `hsla(${hsla.r | 0}, ${hsla.g | 0}, ${hsla.b | 0}, ${isFinite(hsla.a) ? hsla.a : 1})`;
        console.log("pickColor setting color.hsla", this.lastColor);
      }

      const rgba = "r" in color ? color : color.rgba;
      this.lastColor = `rgba(${rgba.r | 0}, ${rgba.g | 0}, ${rgba.b | 0}, ${isFinite(rgba.a) ? rgba.a : 1})`;
      console.log("pickColor setting color.rgba", this.lastColor);
    },
  },

  watch: {
    "value"(value) {
      console.log("#value", value);
      this.lastColor = value ?? this.lastColor ?? "#000000";
    },
  },

}
</script>

<style>
</style>