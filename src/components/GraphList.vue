<template>
  <div id="graphList">
    <header class="header">
      <span>我的图谱</span>
      <div class="createDomainSvg" @click="clickCreateDomainSvg">
        <img :src="require('../assets/svg/createDomain.svg')" />
      </div>
    </header>
    <div
      @click="matchDomainGraph(m, $event)"
      v-for="m in domainList"
      v-bind:key="m.name"
      class="domainNameItem"
      :style="
        m.id === activeId && 'background-color: var(--active-graph-list-item);'
      "
      @mouseenter="showDeleteSvg(m)"
      @mouseleave="concealDeleteSvg(m)"
    >
      <img :src="require('../assets/svg/right.svg')" />
      <input
        v-if="m.id === null"
        id="createDomainInput"
        placeholder="新建图谱名"
        @blur="blur"
        @keyup.enter="$event.target.blur"
        v-model="inputDomainName"
      />
      <span v-else class="domainNameText">{{ m.name }}</span>
      <div
        class="deleteDomainSvg"
        :id="`delete__${m.id}`"
        style="display: none"
        @click="deleteDomain(m)"
        @mouseenter="showDeleteHint(m)"
        @mouseleave="concealDeleteHint(m)"
      >
        <img :src="require('../assets/svg/delete.svg')" />
        <div
          class="deleteHint"
          :id="`delete-hint__${m.id}`"
          style="display: none"
        >
          删除
        </div>
      </div>
    </div>
    <!-- <CreateDomainForm ref="createDomainForm" /> -->
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
      },
      domainList: [],
      activeId: 0, // 当前选中的图谱的 id
      inputDomainName: '',
    }
  },
  // 创建 GraphList 实例时要获取到 Domain 的列表。
  created () {
    this.getDomainList()
  },
  watch: {
    domainList: {
      handler: function (newVal, oldVal) {
      },
      deep: true
    }
  },
  methods: {
    clickCreateDomainSvg () {
      const _this = this
      let promise = new Promise(function (resolve, reject) {
        _this.prevActiveId = _this.activeId
        _this.activeId = null
        _this.domainList.unshift({
          name: 'new domain',
          id: null,
        })
        resolve()
      })
      promise.then(() => {
        document.getElementById('createDomainInput').focus()
      })
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
            _this.domainList = result.data.nodeList
            _this.matchDomainGraph(_this.domainList[0])
            _this.inputDomainName = ''
          }
        }
      })
    },
    matchDomainGraph (domain, event) {
      this.activeId = domain.id
      this.$emit('changeDomain', domain.name)
    },
    showDeleteSvg (m) {
      document.getElementById(`delete__${m.id}`).style.display = 'flex'
    },
    concealDeleteSvg (m) {
      document.getElementById(`delete__${m.id}`).style.display = 'none'
    },
    showDeleteHint (m) {
      document.getElementById(`delete-hint__${m.id}`).style.display = 'block'
    },
    concealDeleteHint (m) {
      document.getElementById(`delete-hint__${m.id}`).style.display = 'none'
    },
    /* 失去输入框焦点，不能是在 @blur 的时候调用，不然 @keyup.enter 也会调用，造成 bug。要在点击其他地方的时候调用 */
    blur () {
      // 没有输入时，撤回到添加前的状态
      const value = this.inputDomainName
      if (value.length === 0) {
        this.domainList.shift()
        this.activeId = this.prevActiveId
      } else { // 真的有输入了，真的要建新图谱了
        this.createDomain(value)
      }
    },
    createDomain (name) {
      const _this = this
      const data = { domain: name }
      $.ajax({
        data: data,
        type: 'POST',
        url: 'http://localhost:8081/create_domain',
        success: function (result) {
          if (result.code === 200) {
            // TODO 返回的格式是：{code: 200, msg: null: data: null}
            // 希望能返回新的 domainList，这样就不用再去 getDomainList 了
            _this.getDomainList()
          }
        }
      })
    },
    deleteDomain (domain) {
      const _this = this
      const data = { domain: domain.name }
      $.ajax({
        data: data,
        type: 'POST',
        url: 'http://localhost:8081/delete_domain',
        success: function (result) {
          if (result.code === 200) {
            _this.getDomainList()
          } else {
            _this.$message({
              showClose: true,
              message: result.msg,
              type: 'warning'
            })
          }
        }
      })
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
.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  color: var(--gray-400);
  margin: 10px 20px;
  font-size: 14px;
}
.createDomainSvg {
  position: absolute;
  right: 24px;
  width: 26px;
  height: 26px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.createDomainSvg:hover {
  background-color: var(--gray-800);
}
.domainNameItem {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: var(--drawer-background);
  cursor: pointer;
  text-align: left;
  padding: 7px 24px 7px 24px;
  transition-duration: 0s;
}
.domainNameItem:hover {
  background-color: var(--drawer-background-hover);
  transition-duration: 0.3s;
}

.deleteDomainSvg {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 24px;
  width: 28px;
  height: 28px;
  border-radius: 14px;
  transition: 0.3s;
}
.deleteDomainSvg:hover {
  background-color: var(--graph-list-svg-background);
  transition: 0.3s;
}
.domainNameText {
  color: var(--gray-400);
  font-weight: 400;
  margin-left: 18px;
  height: 22px;
}
.deleteHint {
  position: absolute;
  top: 34px;
  right: -8px;
  left: -8px;
  color: white;
  padding: 5px 4px;
  background-color: black;
  font-size: 12px;
  text-align: center;
  border-radius: 5px;
  transition: 5s;
}
#createDomainInput {
  outline: none;
  border: none;
  height: 18px;
  border-radius: 4px;
  margin-left: 18px;
  background-color: var(--gray-400);
  padding: 2px 5px;
}
</style>
