<template>
  <div id="tableContainer">
    <table id="nodeTable" class="propertyTable">
      <span class="properTableName">结点属性表</span>
      <thead>
        <tr>
          <td>id</td>
          <td>名称</td>
          <td>直径</td>
          <td>类型</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="node in graph.nodes" v-bind:key="node.uuid">
          <td>{{ node.uuid }}</td>
          <td>{{ node.name }}</td>
          <td>{{ node.r }}</td>
          <td>{{ node.type }}</td>
        </tr>
      </tbody>
    </table>
    <table id="relationTable" class="propertyTable">
      <span class="properTableName">关系属性表</span>
      <thead>
        <tr>
          <td>id</td>
          <td>名称</td>
          <td>sourceId</td>
          <td>targetId</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="link in graph.links" v-bind:key="link.uuid">
          <td>{{ link.uuid }}</td>
          <td>{{ link.name }}</td>
          <td>{{ link.sourceid }}</td>
          <td>{{ link.targetid }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'AttributionTable',
  props: {
    graph: {
      type: Object
    }
  }
}
</script>

<style>
#tableContainer {
  background-color: rgba(166, 166, 166, 0.6);
  color: white;
  text-align: center;
  padding: 5px 10px;
  margin: 20px 40px;
  border-radius: 15px;
}
#closeAttributeTable {
  position: relative;
  float: right;
  margin-right: 2%;
  cursor: pointer;
}
.propertyTable {
  position: relative;
  text-align: center;
  display: block;
  width: 100%;
  margin-bottom: 7%;
  height: 160px;
  max-height: 230px;
  overflow-y: auto;
}
.propertyTable thead,
tbody {
  width: 100%;
}

.propertyTable tbody {
  height: 160px;
  max-height: 160px;
}

.properTableName {
  font-weight: bold;
}
.propertyTable tr {
  padding-top: 1%;
  width: 100%;
  display: table;
  height: 25px;
  table-layout: fixed;
  border-bottom: 1px solid white;
}
</style>
