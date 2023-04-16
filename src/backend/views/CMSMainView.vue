<template>
  <div class="CMSMainView">
    <v-card><v-card-title>{{ appName }}</v-card-title></v-card>

    <CMSPathTree
        ref="tree"
        v-model="selectedPath"
    />

    <v-container>

      <template v-if="selectedPath.length && selectedPath[0]">
        <CMSPageEditor
            :value="selectedPath[0]"
            @input="setSelected"
            @save="onEditorSave"
        />
      </template>

    </v-container>
  </div>
</template>

<script>
import config from "../../../config/config.js";
import CMSPageEditor from "@/backend/components/cms/CMSPageEditor.vue";
import CMSPathTree from "@/backend/components/cms/CMSPathTree.vue";

export default {
  name: "CMSMainView",

  components: {CMSPathTree, CMSPageEditor},

  data() {
    return {
      appName: config.APP_NAME,
      selectedPath: [],
    };
  },

  methods: {
    async onEditorSave($event) {
      const path = $event?.value?.path;

      console.log('onEditorSave', path, $event);

      // Refresh view of tree
      await this.$store.dispatch("cms/getChildrenByPath", {path, fresh: true});

      this.selectedPath = [path];
    },

    setSelected(selected) {
      this.selectedPath.splice(0, this.selectedPath.length, selected);
    },
  },

  async mounted() {
    const preload = async (path) => {
      console.log("preload", path);

      await this.$store.dispatch("cms/getPath", {path});
      const children = await this.$store.dispatch("cms/getChildrenByPath", {path});

      // for (let c = 0; c < children.length; c++) {
      //   const {path} = children[c].data;
      //
      //   await preload(path);
      // }
    };

    await preload("/");

    console.log("preload", "DONE");

    const openPaths = this.$refs?.tree?.openPaths;

    if (openPaths?.indexOf("/") === -1) {
      openPaths.unshift("/");
    }
  }
}
</script>

<style>
div.CMSMainView {
  display: grid;
  max-height: 100vh;
  grid-template-rows: 64px auto;
  grid-template-columns: 30% auto;
}

div.CMSMainView > :nth-child(1) {
  grid-area: 1 / 1 / span 1 / span 1;
}

div.CMSMainView > :nth-child(2) {
  grid-area: 2 / 1 / span 1 / span 1;
  overflow-y: auto;
}

div.CMSMainView > :nth-child(3) {
  grid-area: 1 / 2 / span 2 / span 1;
  overflow-y: auto;
}
</style>