<template>
  <v-app class="CMSApp">
    <div v-if="maintenanceMessage">
      <h1>{{ websiteName }}</h1>
      <h2>{{ appName }}</h2>
      <div class="CMSApp--warning">
        <p class="CMSApp--warning">{{ maintenanceMessage }}</p>
      </div>
    </div>

    <router-view v-else />
  </v-app>
</template>

<script>
import {maintenanceMessage} from "./maintenanceMessage.js";
import config from "../../config/config.js";

export default {
  name: "CMSApp",

  data() {
    return {
      appName: config.APP_NAME,
      maintenanceMessage,
      websiteName: config.WEBSITE_NAME,
    };
  },

  mounted() {
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      this.$vuetify.theme.dark = true;
    }
  },
}
</script>

<style>
/*noinspection CssUnknownTarget*/
@import url(../../dist/backend-styles.css);

div.CMSApp--warning {
  border: rgba(218, 165, 32, 0.5) 1px;
  border-radius: 2px;
}

p.CMSApp--warning {
  position: relative;

  padding: 0 0 0 1.5em;
}

p.CMSApp--warning::before {
  content: "⚠️";
}

@keyframes cms-ui-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.4);
  }
  100% {
    transform: scale(1);
  }
}

</style>