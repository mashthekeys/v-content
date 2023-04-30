<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
@import "@/cms/cmsHTML.css";

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

<script>
export default {
  name: "App",
};
</script>