<template>
  <div id="app">
    <Nav />
    <div id="content">
      <div class="toolbar">
        <OpSvg
          v-for="m in this.operationList"
          v-bind:key="m.hint"
          :src="m.path"
          :activeSrc="m.activePath"
          :hint="m.hint"
          :active="m.isActive"
          @click.native="m.click"
        />
        <Drawer
          :visible.sync="listDrawer"
          title="图谱列表"
          width="max(20%, 240px)"
        >
          <GraphList
            v-bind:domain="domain"
            v-on:changeDomain="changeDomain"
            @clickNew="createDomainDrawer = true"
          />
        </Drawer>
        <Drawer
          :visible.sync="createDomainDrawer"
          title="新建图谱"
          width="300px"
        />
        <Drawer :visible.sync="tableDrawer" title="属性表" width="400px">
          <AttributionTable :graph="this.graph"></AttributionTable>
        </Drawer>
      </div>
      <GraphContainer
        v-on:setGraph="this.setGraph"
        v-bind:domain="domain"
        ref="graphContainer"
        :graphMode.sync="graphMode"
      >
      </GraphContainer>
      <Drawer :visible.sync="isEditingNodeAttr" title="属性编辑" width="300px">
        <NodeAttrEditForm></NodeAttrEditForm>
      </Drawer>
    </div>
  </div>
</template>

<script>
import GraphContainer from './components/GraphContainer.vue'
import Nav from './components/Nav.vue'
import GraphList from './components/GraphList.vue'
import Drawer from './components/Drawer.vue'
import OpSvg from './components/OpSvg'
import AttributionTable from './components/AttributionTable'
import NodeAttrEditForm from './components/form/NodeAttrEditForm'
import { mapMutations } from 'vuex'
export default {
  name: 'App',
  components: {
    GraphContainer,
    Nav,
    GraphList,
    Drawer,
    OpSvg,
    AttributionTable,
    NodeAttrEditForm,
  },
  watch: {
    createNodeMode (val) {
      this.operationList[4].isActive = val
    },
    createLinkMode (val) {
      this.operationList[5].isActive = val
    },
    graphMode (val) {
      this.operationList[6].isActive = !val
    }
  },
  computed: {
    isEditingNodeAttr: {
      get: function () {
        return this.$store.state.isEditingNodeAttr
      },
      set: function (val) {
        this.switchIsEditingNodeAttr(val)
      }
    },
    isEditingLinkAttr: {
      get: function () {
        return this.$store.state.isEditingLinkAttr
      },
      set: function (val) {
        this.switchIsEditingLinkAttr(val)
      }
    },
    createNodeMode: {
      get: function () {
        return this.$store.state.createNodeMode
      },
      set: function (val) {
        this.setCreateNodeMode(val)
      }
    },
    createLinkMode: {
      get: function () {
        return this.$store.state.createLinkMode
      },
      set: function (val) {
        this.setCreateLinkMode(val)
      }
    }
  },
  data () {
    const _this = this
    return {
      domain: null, // 当前显示哪个图谱
      listDrawer: false, // 图谱列表抽屉是否打开
      tableDrawer: false, // 图谱表格抽屉是否打开
      createDomainDrawer: false,
      graphMode: true, // 当前处于力导图还是排版
      graph: {
        nodes: [],
        links: [],
      },
      operationList: [{
        path: require('./assets/svg/list.svg'),
        hint: '图谱列表',
        click: () => { _this.listDrawer = !_this.listDrawer }
      }, {
        path: require('./assets/svg/table.svg'),
        hint: 'table',
        click: () => { _this.tableDrawer = !_this.tableDrawer }
      }, {
        path: require('./assets/svg/new.svg'),
        hint: 'new',
        click: () => { }
      }, {
        path: require('./assets/svg/refresh.svg'),
        hint: 'refresh',
        click: () => { }
      }, {
        path: require('./assets/svg/circle.svg'),
        activePath: require('./assets/svg/circleActive.svg'),
        hint: '新建结点',
        click: _this.clickCreateNodeSvg,
        isActive: false,
      }, {
        path: require('./assets/svg/link.svg'),
        activePath: require('./assets/svg/linkActive.svg'),
        hint: '新建关系',
        click: _this.clickCreateLinkSvg,
        isActive: false,
      }, {
        path: require('./assets/svg/mode.svg'),
        activePath: require('./assets/svg/modeActive.svg'),
        hint: '排版模式',
        click: _this.switchGraphMode,
        isActive: false,
      }]
    }
  },
  methods: {
    ...mapMutations([
      'switchIsEditingNodeAttr',
      'switchIsEditingLinkAttr',
      'setCreateNodeMode',
      'setCreateLinkMode',
    ]),
    // 当 graphList 更改 domain 时，graphContainer 相应更改
    changeDomain (name) {
      this.domain = name
      this.$refs.graphContainer.changeDomain(name)
    },
    // graphContainer 更改了 graph 时，table 也需要相应更改
    setGraph (nodes, links) {
      this.graph.nodes = nodes
      this.graph.links = links
    },
    clickCreateNodeSvg () {
      // 点一下激活，点两下取消
      if (!this.graphMode) {
        alert('请关闭排版模式后再编辑图谱')
      } else {
        this.createNodeMode = !this.createNodeMode
      }
    },
    clickCreateLinkSvg () {
      if (!this.graphMode) {
        alert('请关闭排版模式后再编辑图谱')
      } else {
        this.createLinkMode = !this.createLinkMode
      }
    },
    switchGraphMode () {
      this.graphMode = !this.graphMode
    }
  }
}
</script>

<style>
@import url('./style/globalColor.css');
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
  user-select: none; /* 阻止双击选中 */
}
</style>
