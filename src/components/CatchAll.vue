<template>
  <div>
    <h1>{{ websiteName }}</h1>

    <h3>No results found.</h3>
  </div>
</template>

<script>
import config from "../../config/config.js";

export default {
  name: "CatchAll",

  computed: {
    websiteName() {
      return config.WEBSITE_NAME;
    },
  },
}
</script>
