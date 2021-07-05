<template>
  <div id="app">
    <!-- <landing-page></landing-page> -->
    <!-- <node-pad></node-pad> -->
    <image-download></image-download>
  </div>
</template>

<script>
  import LandingPage from '@/pages/LandingPage'
import NodePad from '@/pages/NodePad'
import ImageDownload from "@/pages/ImageDownload";
  export default {
    name: 'Image-Download',
    components: {
      LandingPage,
      NodePad,
      ImageDownload
    }
  }
</script>

<style>
  /* CSS */
</style>
