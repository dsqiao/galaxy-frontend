<template>
  <div id="graphList">
    <div class="listHeader">
      <span class="name">图谱列表</span>
    </div>
    <div id="listContent">
      <button @click="createDomain" id="new">+ 新建</button>
      <div
        @click="matchDomainGraph(m, $event)"
        v-for="m in pageModel.nodeList"
        v-bind:key="m.name"
        class="domainNameItem"
      >
        <span class="domainNameText">{{ m.name }}</span>
        <button
          class="deleteDomainButton"
          type="button"
          @click="deleteDomain(m)"
        >
          删除
        </button>
      </div>
    </div>
    <CreateDomainForm ref="createDomainForm" />
  </div>
</template>

<script>
import CreateDomainForm from './form/CreateDomainForm.vue'
import $ from 'jquery'
export default {
  name: 'GraphList',
  components: {
    CreateDomainForm,
  },
  props: ['domain'],
  data () {
    return {
      // TODO pageModel 需要改，里面很多东西用不上，命名也很鬼畜
      pageModel: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
        totalPage: 0,
        nodeList: []
      }
    }
  },
  // 创建 GraphList 实例时要获取到 Domain 的列表。
  created () {
    this.getDomainList()
  },
  methods: {
    createDomain () {
      this.$refs.createDomainForm.showForm()
    },
    getDomainList () {
      const _this = this
      $.ajax({
        data: {},
        type: 'POST',
        url: 'http://localhost:8081/get_graph',
        success: function (result) {
          if (result.code === 200) {
            _this.pageModel = result.data
          }
        }
      })
    },
    matchDomainGraph (domain, event) {
      this.$emit('changeDomain', domain.name)
    }
  }
}
</script>

<style scoped>
#graphList {
  text-align: center;
  padding-top: 10%;
  height: 60%;
}

.name {
  font-size: 18px;
  color: white;
  border-bottom: 2px solid #fee064;
}
#listContent {
  background-color: gray;
  margin: 5% 10% 0 10%;
  min-height: 150px;
  height: 30vh;
  border-radius: 10px;
  max-height: 30vh;
  overflow-y: auto;
  padding-bottom: 10%;
}
#new {
  background-color: darkgreen;
  border-radius: 15px;
  margin-top: 3%;
  padding: 1% 3%;
  color: white;
  font-weight: bold;
}
#new:hover {
  background-color: green;
  transform: scale(1.1);
  transition: 0.2s;
}

.domainNameItem {
  display: grid;
  background-color: darkgray;
  border-radius: 15px;
  text-align: left;
  grid-template-columns: 4fr 1fr;
  margin-left: 5%;
  margin-right: 5%;
  margin-top: 3%;
  padding: 1% 3% 1%;
}

.domainNameText {
  cursor: pointer;
}

.deleteDomainButton {
  background-color: lightgray;
  margin: 2% 0 2% 2%;
  color: red;
  padding: 1% 1%;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
}

.deleteDomainButton:hover {
  background-color: white;
  transform: scale(1.05);
  transition: 0.1s;
}

.domainNameText {
  color: black;
  font-weight: bold;
}
</style>
