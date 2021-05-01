<template>
  <div id="graphList">
    <div class="listHeader">
      <span class="name">图谱列表</span>
    </div>
    <div id="listContent">
      <button @click="createDomain" id="new">+ 新建</button>
      <div
        @click="matchDomainGraph(m, $event)"
        v-for="m in pageModel.domainList"
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
    <div id="createDomainForm">
      <div id="closeCreateDomainForm" @click="closeCreateDomainForm">关闭</div>
      <span id="domainLabel">请输入要创建的领域名称</span>
      <input id="createDomainName" type="text" placeholder="Domain Name" />
      <div id="createDomainNameConfirmGroup">
        <button type="button" id="createConfirm" @click="createDomainConfirm">
          确定
        </button>
        <button type="button" id="createCancel" @click="createDomainCancel">
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GraphList',
  data () {
    return {
      pageModel: {
        domainList: null
      }
    }
  }
}
</script>

<style>
</style>
