<template>
  <div class="ErrorComponent" style="backdrop-filter: invert(1);">
    <fieldset>
      <legend>ErrorComponent</legend>

      <slot name="default"></slot>
    </fieldset>

    <fieldset>
      <legend>Lang</legend>

      <p>{{ $route.meta ? $route.meta.lang : void 0 }}</p>
    </fieldset>
  </div>
</template>

<script>
export default {
  name: "ErrorComponent"
}
</script>

<style>

</style>