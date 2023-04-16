<template>
  <fieldset contenteditable="false" class="CMSComponentProperties">
    <legend>Component Properties</legend>

    <div style="display:flex; flex-flow: row wrap">

      <div style="flex: 1 0 50%">
        <div>

          <v-combobox
              label="Component"
              prepend-icon="mdi-hexagon-outline"
              :items="componentList"
              style="width: 100%"
              :value="tag"
              @input="setTag"
          />

        </div>
      </div>

      <div style="flex: 1 0 50%">
        <v-json-editor
            label="Properties"
            :value="stringifySafe(props)"
            @input="setProps(parseSafe($event))"
        />
      </div>
    </div>

    <pre>{{ JSON.stringify(content, null, 2) }}</pre>
  </fieldset>
</template>

<script>
import VJsonEditor from "@/../local_modules/v-json-editor/src/components/VJsonEditor.vue";

export default {
  name: "CMSComponentProperties",
  components: {VJsonEditor},

  props: {
    value: {},
  },

  computed: {
    componentList() {
      return [
        "cms:assembly-icons",
        "cms:link-resources",
        "cms:page-resources",
      ];
    },

    content() {
      return this.valueInternal[2];
    },

    options() {
      return this.valueInternal[1];
    },

    props() {
      return this.options?.props ?? {};
    },

    tag() {
      return this.valueInternal[0];
    },

    valueInternal() {
      const {value} = this;

      return Array.isArray(value) ? [
        typeof value[0] === "string" ? value[0] : "",
        value.find($ => typeof $ === "object" && !Array.isArray($)) ?? {},
        value.find($ => Array.isArray($)) ?? []
      ] : [];
    },
  },

  methods: {
    getElementValue(root) {
      return JSON.parse(JSON.stringify(this.valueInternal));
    },

    parseSafe(value) {
      try {
        return JSON.parse(value);
      } catch (ignore) {
        return null;
      }
    },

    setProps(props) {
      // console.log('setProps', {...props});

      this.$set(this.valueInternal[1], 'props', props);

      this.$emit('update:props', props)
    },

    setTag(tag) {
      this.valueInternal[0] = tag;

      this.$emit('update:tag', tag);
    },

    stringifySafe(value) {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return 'null';
      }
    },
  },
}
</script>

<style>

</style>