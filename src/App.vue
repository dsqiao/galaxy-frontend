<template>
  <div id="app">
    <Nav />
    <div id="content">
      <div class="toolbar">
        <OpSvg
          v-for="m in this.operationList"
          v-bind:key="m.hint"
          :src="m.path"
          :hint="m.hint"
          @click.native="m.click"
        />
        <Drawer :visible.sync="listDrawer" title="图谱列表">
          <GraphList v-bind:domain="domain" v-on:changeDomain="changeDomain" />
        </Drawer>
      </div>
      <GraphContainer v-bind:domain="domain" ref="graphContainer">
      </GraphContainer>
    </div>
  </div>
</template>

<script>
import GraphContainer from './components/GraphContainer.vue'
import Nav from './components/Nav.vue'
import GraphList from './components/GraphList.vue'
import Drawer from './components/Drawer.vue'
import OpSvg from './components/OpSvg'
export default {
  name: 'App',
  components: {
    GraphContainer,
    Nav,
    GraphList,
    Drawer,
    OpSvg,
  },
  data () {
    const _this = this
    return {
      domain: null, // 当前显示哪个图谱
      listDrawer: false,
      drawer: false,
      operationList: [{
        path: require('./assets/svg/list.svg'),
        hint: '图谱列表',
        click: () => { _this.listDrawer = !_this.listDrawer }
      }, {
        path: require('./assets/svg/table.svg'),
        hint: 'table',
        click: () => { }
      }, {
        path: require('./assets/svg/new.svg'),
        hint: 'new',
        click: () => { }
      }, {
        path: require('./assets/svg/refresh.svg'),
        hint: 'refresh',
        click: () => { }
      }]
    }
  },
  methods: {
    // 当 graphList 更改 domain 时，graphContainer 相应更改
    changeDomain (name) {
      this.domain = name
      this.$refs.graphContainer.changeDomain(name)
    },
    showList () {
      this.listDrawer = !this.listDrawer
    }
  }
}
</script>

<style>
@import url(./globalColor.css);
* {
  --app-height: 100vh;
  --nav-height: 65px;
  --content-height: calc(var(--app-height) - var(--nav-height));
  --toolbar-width: 56px;
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
  display: flex;
  flex-direction: row;
  background-color: #333333;
}
#listContainer {
  border-right: 2px solid #1179b3;
  min-width: 250px;
  height: 100%;
  color: lightskyblue;
}
.toolbar {
  width: var(--toolbar-width);
  background-color: #202124;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 18px;
  box-sizing: border-box;
}
</style>
