<template>
  <v-menu bottom :nudge-bottom="36">
    <template #activator="{attrs, on}">
      <v-btn icon tile
             color="primary"
             class="CMSContentTypeSelect--activator"
             v-bind="attrs" v-on="on"
             @keydown="activatorKeyDown"
             @keypress="activatorKeyPress"
      >
        <v-icon style="font-style: normal">{{ getActivatorIcon(value) }}</v-icon>
      </v-btn>
    </template>

    <div style="width: calc(3 * 36px)">
      <v-sheet elevation="24" color="primary" class="CMSContentTypeSelect--menu">
        <template v-for="type in types">
          <v-btn icon tile
                 :outlined="!closeButton && value === type"
                 @click="create(getDefault(type))">
            <v-icon>{{ getIcon(type) }}</v-icon>
          </v-btn>
        </template>

        <v-btn v-if="canDelete"
               icon tile
               color="red"
               @click="$emit('delete')"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-sheet>
    </div>
  </v-menu>
</template>

<script>
export default {
  name: 'CMSContentTypeSelect',

  props: {
    canDelete: Boolean,
    closeButton: Boolean,
    value: {},
  },

  computed: {
    types() {
      return ['string', 'Array'];
    },
  },

  methods: {
    activatorKeyDown($event) {
      const keyCode = $event.keyCode;

      if (37 <= keyCode && keyCode <= 40) {
        //left = 37; up = 38; right = 39; down = 40
        $event.stopPropagation();
        $event.preventDefault();
      }
    },

    activatorKeyPress($event) {
      const charCode = $event.charCode;

      if (0x30 <= charCode && charCode <= 0x39) {
        // U+0030 DIGIT ZERO
        // U+0039 DIGIT NINE
        $event.stopPropagation();
        $event.preventDefault();

        this.create(String.fromCharCode(charCode));

      } else if (charCode === 0x08 && charCode === 0x2E) {
        // BACKSPACE 0x08
        // DELETE 0x2E
        $event.stopPropagation();
        $event.preventDefault();

        this.canDelete && this.$emit("delete");

      } else if (charCode === 0x22) {
        // U+0022 QUOTATION MARK
        $event.stopPropagation();
        $event.preventDefault();
        this.create(this.getDefault('string'));

      } else if (charCode === 0x5B) {
        // U+005B LEFT SQUARE BRACKET
        $event.stopPropagation();
        $event.preventDefault();
        this.create(this.getDefault('Array'));

      }
    },

    create(json) {
      this.$emit('create', json);
    },

    getActivatorIcon(type) {
      const {closeButton} = this;

      return closeButton ? "mdi-plus"
          : this.getIcon(type);
    },

    getDefault(type) {
      return type === 'string' ? '""'
          : type === 'Array'? '["", {}, []]'
              : type;
    },

    getIcon(type) {
      return type === 'string' ? "mdi-format-quote-open"
          : type === 'Array'? "mdi-code-tags"
              : "mdi-alert-box";
    },
  },
}
</script>

<style>
.CMSContentTypeSelect--activator.theme--light:not(:focus) {
  color: rgba(0, 0, 0, 0.54) !important;
}

.CMSContentTypeSelect--activator.theme--dark:not(:focus) {
  color: white !important;
}

.CMSContentTypeSelect--menu {
  display: flex;
  flex-flow: row wrap;
  width: calc(36px * 3);
  justify-items: flex-end;
}
</style>
