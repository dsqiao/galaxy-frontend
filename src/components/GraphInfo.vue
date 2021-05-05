<template>
  <div id="graphInfoContainer">
    <div id="mode_name">{{ mode_name }}</div>
    <div id="graphInfo">
      <span class="inner-info">结点数量: {{ graph.nodes.length }}</span>
      <span class="inner-info">关系数量: {{ graph.links.length }}</span>
    </div>
    <div
      id="analyzed-info"
      v-for="m in analyzedProperties"
      v-bind:key="m.nodes_names"
    >
      <div class="analyzed-inner-info">
        <span class="inner-info">{{ m.type }}:</span>
        <span class="inner-info">{{ m.nodes_names }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GraphInfo',
  props: ['graph', 'mode_name', 'analyzedProperties'],
  data () {
    return {}
  },
  methods: {}
}
</script>

<style scoped>
#graphInfoContainer {
  position: absolute;
  right: 0;
  color: white;
  margin: 15px 20px 0 0;
  text-align: center;
  width: 160px;
}
#mode_name {
  background-color: rgba(30, 144, 255, 0.8);
  color: white;
  font-size: 16px;
  border-radius: 20px;
  padding: 5px 10px;
  margin-bottom: 7%;
  height: 20px;
  line-height: 20px;
}

#graphInfo .inner-info {
  margin-top: 1%;
  display: block;
}

.analyzed-inner-info {
  margin-top: 8%;
  background-color: rgba(169, 169, 169, 0.3);
  padding: 4px 8px;
  border-radius: 8px;
}
.analyzed-inner-info .inner-info {
  display: block;
  margin-top: 2%;
}
</style>
