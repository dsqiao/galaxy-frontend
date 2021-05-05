<template>
  <div id="app">
    <Nav />
    <div id="content">
      <div id="listContainer">
        <GraphList v-bind:domain="domain" v-on:changeDomain="changeDomain"/>
      </div>
      <GraphContainer v-bind:domain="domain" ref="graphContainer">
        <div>hello</div>
      </GraphContainer>
    </div>
  </div>
</template>

<script>
import GraphContainer from './components/GraphContainer.vue'
import Nav from './components/Nav.vue'
import GraphList from './components/GraphList.vue'
export default {
  name: 'App',
  components: {
    GraphContainer,
    Nav,
    GraphList
  },
  data () {
    return {
      domain: null // 当前显示哪个图谱
    }
  },
  methods: {
    // 当 graphList 更改 domain 时，graphContainer 相应更改
    changeDomain (name) {
      this.domain = name
      this.$refs.graphContainer.changeDomain(name)
    }
  }
}
</script>

<style>
* {
  --app-height: 100vh;
  --nav-height: 65px;
  --content-height: calc(var(--app-height) - var(--nav-height));
}
#app {
  margin: 0;
  padding: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: var(--app-height);
}
#content {
  height: var(--content-height);
  display: grid;
  background-color: #333333;
  grid-template-columns: 1fr 4fr;
}
#listContainer {
  border-right: 2px solid #1179b3;
  min-width: 250px;
  height: 100%;
  color: lightskyblue;
}
</style>
