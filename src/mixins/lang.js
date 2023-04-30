
export default {
  computed: {
    lang: {
      lazy: true,
      get() {
        const lang = this.$store.state.route?.meta?.lang;

        return lang ?? 'und';
      },
    },

    $t: {
      lazy: true,
      get() {
        const lng = this.lang;

        return (key, options) => {
          if (options?.lng == null) {
            options = Object.assign({lng}, options);
          }
          return this._getI18nKey(key, options);
        };
      },
    },
  },
};

