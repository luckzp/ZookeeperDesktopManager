<template>
  <div id="app">
    <!-- <landing-page></landing-page> -->
    <node-pad></node-pad>
  </div>
</template>

<script>
  import LandingPage from '@/pages/LandingPage'
import NodePad from '@/pages/NodePad'
  export default {
    name: 'OneSetting',
    components: {
      LandingPage,
      NodePad
    }
  }
</script>

<style>
  /* CSS */
</style>
