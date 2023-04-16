<template>
  <div class="CMSContentSlots">
    <template v-for="(node, index) in nodes">
      <div class="CMSContentSlots--row" :key="index">

        <v-menu bottom nudge-bottom="36px">
          <template #activator="{attrs, on}">
            <v-text-field
                style="flex: 0.25 1 8em"
                dense
                hide-details
                :value="node.key"
                @input="setKey(index, $event)"
            >
              <template #prepend-inner>
                <v-btn icon tile v-bind="attrs" v-on="on">
                  <v-icon>mdi-format-list-group</v-icon>
                </v-btn>
              </template>
            </v-text-field>
          </template>
          <template #default>
            <div style="width: 36px">
              <v-sheet elevation="24" color="primary" width="36px">
                <v-btn icon tile
                       color="red"
                       @click="deleteIndex(index)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-sheet>
            </div>
          </template>
        </v-menu>

        <v-sheet width="80%" style="flex: 1 0.25 80%; margin-top: 4px">
          <CMSContentEditor
              dense
              format="json"
              hide-details
              :path="node.path"
              :value="node.value"
              @input="setValue(index, $event)"
          />
        </v-sheet>

      </div>
    </template>

    <div class="CMSContentSlots--row" :key="'create'"
    >
      <v-btn
          icon 
          tile
          @click="appendValue('[]')"
      >
        <v-icon>mdi-format-list-group-plus</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
import CMSContentEditor from "@/backend/components/cms/content/CMSContentEditor.vue";

export default {
  name: 'CMSContentSlots',

  components: {
    CMSContentEditor,
  },

  props: [
    "path",
    "value",
  ],

  data() {
    return {
      lastOutput: this.value,
    };
  },

  methods: {
    appendValue($event) {
      // console.log("CMSContentSlots.appendValue", $event);
      const length = this.nodes.length;

      const key = length ? "slot_" + length : "default";

      this.nodes.push({
        key,
        path: `${this.path}."${key}"`,
        value: $event,
      });

      this.dispatchInput();
    },

    deleteIndex(index) {
      // console.log("CMSContentSlots.deleteIndex", index);
      this.nodes.splice(index, 1);

      this.dispatchInput();
    },

    dispatchInput() {
      const output = this.output;
      const old = this.lastOutput;
      // console.log("CMSContentSlots.dispatchInput", output, old);
      if (output !== old && output !== this.value) {
        // console.log("CMSContentSlots.dispatchInput >> input");
        this.lastOutput = output;
        this.$emit("input", output);
      }
    },

    setValue(index, $event) {
      // console.log("CMSContentSlots.setValue", index, $event);
      this.nodes[index].value = String($event);

      this.dispatchInput();
    },

    setKey(index, $event) {
      // console.log("CMSContentSlots.setKey", index, $event);
      this.nodes[index].key = String($event);

      this.dispatchInput();
    },
  },

  computed: {
    elevation() {
      return this.path.replace(/[^.]/g, "").length;
    },

    decoded() {
      const {value} = this;

      let object;

      try {
        object = JSON.parse(value);
      } catch (ignored) {
      }

      if (object !== null && typeof object === "object") return object;
    },

    nodes() {
      const {decoded, path} = this;

      if (decoded == null) return [];

      return Object.keys(decoded).map(key => {
        const keyPath = /^\w+$/.test(key) ? key : JSON.stringify(key).replace(/\./g, "\\u002e").replace(/\[/g, "\\u005b");

        return {
          key,
          path: `${path}.${keyPath}`,
          value: JSON.stringify(decoded[key]),
        };
      });
    },

    output() {
      // console.log("CMSContentSlots.output");
      return `{${this.nodes.map(
          ({key, value}) => JSON.stringify(key) + ":" + value
      ).join(",")}}`
    },
  },

  watch: {
    value(value) {
      this.lastOutput = value;
    },
  },
}
</script>

<style>
div.CMSContentSlots--row {
  display: flex;
  flex-flow: row wrap;
}
</style>
