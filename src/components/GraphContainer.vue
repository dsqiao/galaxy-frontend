<template>
  <div class="graphContainer" id="graphContainer"></div>
</template>

<script>
import * as d3 from 'd3'
export default {
  name: 'GraphContainer',
  mounted: function () {
    const graphContainer = d3.select('#graphContainer')
    console.log(graphContainer)
  }
}
</script>

<style>
</style>
