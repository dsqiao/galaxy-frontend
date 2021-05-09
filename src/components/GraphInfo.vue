<template>
  <div id="graphInfoContainer">
    <div class="graph-title">{{ domain }}</div>
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
  props: ['graph', 'mode_name', 'analyzedProperties', 'domain'],
  data () {
    return {}
  },
  methods: {}
}
</script>

<style scoped>
#graphInfoContainer {
  position: absolute;
  top: 15px;
  right: 20px;
  color: white;
  text-align: center;
  width: 130px;
}
.graph-title {
  background-color: rgba(30, 144, 255, 0.8);
  color: white;
  font-size: 17px;
  border-radius: 20px;
  padding: 5px 10px;
  margin-bottom: 7%;
  height: 30px;
  line-height: 20px;
  box-sizing: border-box;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
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
