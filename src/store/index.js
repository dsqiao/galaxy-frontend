// 组装模块并导出 store
import Vuex from 'vuex'
import Vue from 'vue'
Vue.use(Vuex)
export default new Vuex.Store({
  state: {
    isEditingNodeAttr: false,
    isEditingLinkAttr: false,
    nodeAttr: { // 正在被编辑的结点的属性
      id: null,
      name: '',
      r: null,
      color: '',
      type: '',
      url: '',
      fontSize: null,
    },
    createNodeMode: false, // 是否处于新增结点状态
    createLinkMode: false, // 是否处于新增关系状态
  },
  mutations: {
    switchIsEditingNodeAttr (state, val) {
      state.isEditingNodeAttr = val
    },
    switchIsEditingLinkAttr (state, val) {
      state.isEditingLinkAttr = val
    },
    setNodeAttr (state, val) {
      state.nodeAttr = val
    },
    setCreateNodeMode (state, val) {
      state.createNodeMode = val
    },
    setCreateLinkMode (state, val) {
      state.createLinkMode = val
    }
  },
  getters: {},
  actions: {},
})
