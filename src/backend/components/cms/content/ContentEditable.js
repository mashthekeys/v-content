
export default {
  name: 'ContentEditable',

  props: {
    tag: {},
    value: {},
  },

  data() {
    return {
      valueUpdate: 0,
    };
  },

  methods: {
    onContentChange($event) {
      // console.log("ContentEditable.onContentChange", $event);

      const target = $event.target;

      const innerText = target.innerText;

      this.$internalValue = innerText;

      if (target.firstElementChild != null) {
        // console.log("ContentEditable.onContentChange", "firstElementChild");
        target.innerText = innerText;
      }

      this.$emit('input', innerText)
    },
  },

  render() {
    // noinspection JSUnusedLocalSymbols
    const valueUpdate = +this.valueUpdate;

    const {$internalValue, tag} = this;
    // console.log("ContentEditable.render", {$internalValue, tag, valueUpdate});

    const attrs = {
      attrs: {
        contenteditable: "true",
      },
      on: {
        change: this.onContentChange,
        input: this.onContentChange,
      },
    };

    const content = $internalValue == null ? [] : [$internalValue];

    return this.$createElement(tag || 'span', attrs, content);
  },

  created() {
    // Non-reactive property to avoid triggering re-render
    this.$internalValue = this.value;
  },

  watch: {
    value(value) {
      const update = this.$internalValue !== value;
      // console.log("ContentEditable#value", update, value);
      if (update) {
        this.$internalValue = value;
        ++this.valueUpdate;
      }
    },
  },
}
